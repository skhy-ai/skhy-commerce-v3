
import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import * as dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables (for Supabase URL/Key if locally present, though we might need to prompt)
dotenv.config();

// Interfaces
interface CompanyRow {
    [key: string]: string;
}

interface EnrichedRow extends CompanyRow {
    LinkedIn_Profile: string;
    CEO_Name: string;
    CEO_Email: string;
}

// Configuration (Supabase Public Key/URL usually safe to hardcode in frontend/scripts if adhering to RLS, 
// but for admin scripts we might need the Service Role key OR user login.
// Ideally, for a backend script like this, we'd use a generic key, but restricted data needs privilege.
// Given this is an admin tool run locally, we will ask for SUPABASE_URL and KEY in .env or prompt.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''; // Ideally Service Role for bypassing RLS if needed, or Anon if policies allow.

// Initialize Supabase (We need this to fetch the Apollo Key from system_config)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

// --- Apollo API ---
const searchMultiPeople = async (apiKey: string, domain: string, titles: string[]) => {
    const url = 'https://api.apollo.io/v1/mixed_people/search';

    // Apollo API allows JSON body
    const body = {
        api_key: apiKey,
        q_organization_domains: [domain],
        page: 1,
        per_page: 1, // We only need the top 1 regex match effectively
        person_titles: titles
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error(`Apollo API Error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data: any = await response.json();
        if (data.people && data.people.length > 0) {
            return data.people[0]; // Return top result
        }
        return null;
    } catch (error) {
        console.error('Apollo Request Failed:', error);
        return null;
    }
};

const processCSV = async (inputPath: string) => {
    console.log("--- Skhy AI: Apollo Enrichment Tool ---");

    // 1. Fetch Apollo API Key from Supabase
    let apolloKey = '';

    console.log("Fetching Configuration from Supabase...");
    const { data: configData, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'apollo_api_key')
        .single();

    if (configData && configData.value) {
        apolloKey = configData.value;
        const masked = apolloKey.substring(0, 4) + '...' + apolloKey.substring(apolloKey.length - 4);
        console.log(`Found Apollo API Key in System Config: ${masked}`);
        const confirm = await askQuestion("Use this key? (Y/n): ");
        if (confirm.toLowerCase() === 'n') {
            apolloKey = await askQuestion("Enter Apollo API Key manually: ");
        }
    } else {
        console.log("Apollo API Key not found in System Config.");
        apolloKey = await askQuestion("Enter Apollo API Key manually: ");
    }

    if (!apolloKey) {
        console.error("No API Key provided. Aborting.");
        process.exit(1);
    }

    const results: CompanyRow[] = [];
    const enrichedResults: EnrichedRow[] = [];

    // 2. Read CSV
    console.log(`\nReading input file: ${inputPath}`);
    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(inputPath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${results.length} companies. Starting enrichment...`);

    // 3. Process Rows
    let processedCount = 0;
    for (const row of results) {
        processedCount++;
        // Try to find a domain first, then fallback to name
        let companyDomain = row['Website'] || row['Domain'] || '';
        const companyName = row['Company Name'] || row['Organization Name'] || row['Company'] || row['Name'];

        // Simple domain extraction if 'Website' is a full URL
        if (companyDomain.includes('://')) {
            try {
                companyDomain = new URL(companyDomain).hostname.replace('www.', '');
            } catch (e) { /* ignore */ }
        }

        // We prefer searching by Domain if available, fallback to Org Name if Apollo supports fuzzy match (it does partially)
        // Note: 'q_organization_domains' expects domains. 'q_organization_name' is legacy/mixed. 
        // We will try domain if valid, otherwise skip or try name if we had a dedicated endpoint. 
        // The Mixed Search endpoint accepts q_organization_domains. 

        let searchDomain = companyDomain;
        if (!searchDomain && companyName) {
            // Need a domain scraper or just search by name? 
            // Apollo's mixed search is primarily domain based for accuracy.
            // For now, if no domain, we might skip or try to guess.
            // Let's rely on the CSV having a website or clean domain.
            console.warn(`[${processedCount}] Skipping ${companyName}: No Domain/Website column found.`);
            enrichedResults.push({ ...row, LinkedIn_Profile: '', CEO_Name: '', CEO_Email: '' });
            continue;
        }

        // Titles to search for
        const titles = ["CEO", "Chief Executive Officer", "Founder", "Co-Founder", "Managing Partner", "Director"];

        console.log(`[${processedCount}/${results.length}] Searching: ${companyName} (${searchDomain})...`);

        // Rate limit kindness (free tier is aggressive)
        if (processedCount > 1) await new Promise(r => setTimeout(r, 1000));

        const person = await searchMultiPeople(apolloKey, searchDomain, titles);

        if (person) {
            console.log(`   -> Found: ${person.name} (${person.title})`);
            enrichedResults.push({
                ...row,
                LinkedIn_Profile: person.linkedin_url || '',
                CEO_Name: person.name || '',
                CEO_Email: person.email || '' // Email might be hidden or require credit unlock
            });
        } else {
            console.log("   -> No match found.");
            enrichedResults.push({ ...row, LinkedIn_Profile: '', CEO_Name: '', CEO_Email: '' });
        }
    }

    // 4. Write CSV
    const parsedPath = path.parse(inputPath);
    const outputPath = path.join(parsedPath.dir, `${parsedPath.name}_apollo_enriched${parsedPath.ext}`);

    if (enrichedResults.length > 0) {
        // Determine headers dynamically
        const header = Object.keys(enrichedResults[0]).map(id => ({ id, title: id }));
        const csvWriter = createObjectCsvWriter({
            path: outputPath,
            header: header
        });

        await csvWriter.writeRecords(enrichedResults);
        console.log(`\nSuccess! Enriched data saved to: ${outputPath}`);
    } else {
        console.log("\nNo data generated.");
    }

    rl.close();
};

// CLI Args
const args = process.argv.slice(2);
const inputArg = args.find(arg => arg.startsWith('--input='));

if (!inputArg) {
    console.error('Usage: npm run enrich -- --input=path/to/file.csv');
    process.exit(1);
}

const inputFile = inputArg.split('=')[1];
processCSV(inputFile).catch((err) => {
    console.error("Fatal Error:", err);
    rl.close();
});
