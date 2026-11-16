import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /.netlify/functions/record-visit
 * (or /api/record-visit)
 *
 * Records a page visit into the site_visits Supabase table using the server-side
 * service role key. This bypasses client RLS restrictions, avoids ad-blocker issues,
 * and extracts accurate geo information directly from Netlify headers.
 */
const handler: Handler = async (event: HandlerEvent) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return {
            statusCode: 503,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Database service not configured" }),
        };
    }

    try {
        let body: any = {};
        if (event.body) {
            try {
                body = JSON.parse(event.body);
            } catch {
                body = {};
            }
        }

        // Netlify provides geo headers automatically on production edges
        const headerCountry = event.headers["x-country"] || event.headers["x-nf-country"];
        const headerCity = event.headers["x-city"] || event.headers["x-nf-city"];
        const clientIp =
            event.headers["x-nf-client-connection-ip"] ||
            event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            event.headers["client-ip"] ||
            "";

        // Hash IP for privacy if present
        let ipHash = body.ipHash || null;
        if (!ipHash && clientIp) {
            let hash = 0x811c9dc5;
            for (let i = 0; i < clientIp.length; i++) {
                hash ^= clientIp.charCodeAt(i);
                hash = Math.imul(hash, 0x01000193);
            }
            ipHash = (hash >>> 0).toString(16).padStart(8, "0");
        }

        const countryCode = (body.country_code || headerCountry || "US").toUpperCase();
        const country = body.country || (countryCode === "US" ? "United States" : countryCode === "MY" ? "Malaysia" : countryCode === "IN" ? "India" : countryCode);
        const city = body.city || headerCity || null;
        const region = body.region || null;
        const pagePath = body.pagePath || body.page_path || "/";
        const sessionId = body.sessionId || body.session_id || crypto.randomUUID();

        const supabase = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false },
        });

        // Insert visit row using service role
        const { error: insertErr } = await supabase.from("site_visits").insert({
            country,
            country_code: countryCode,
            city,
            region,
            page_path: pagePath,
            session_id: sessionId,
            ip_hash: ipHash,
        });

        if (insertErr) {
            console.error("Error inserting site visit:", insertErr);
        }

        // Query the updated exact total count
        const { count: exactTotal } = await supabase
            .from("site_visits")
            .select("*", { count: "exact", head: true });

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                success: true,
                totalVisits: exactTotal ?? 0,
                country,
                country_code: countryCode,
            }),
        };
    } catch (err: any) {
        console.error("record-visit function exception:", err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err?.message || "Internal server error" }),
        };
    }
};

export { handler };
