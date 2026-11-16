/**
 * marketplaceNormalization.ts
 * Central logic for standardizing product categories and extracting technical specifications.
 */

export interface ProductSpecs {
    [key: string]: string | number | boolean | null;
}

export interface NormalizedProduct {
    category: string;
    subcategory: string;
    specs: ProductSpecs;
}

const TAXONOMY: Record<string, { category: string; subcategory: string }> = {
    // RF & Communication
    'ADS-B AMPLIFIER': { category: 'RF & Communication', subcategory: 'Amplifiers' },
    'ADS-B FILTER': { category: 'RF & Communication', subcategory: 'Filters' },
    'booster': { category: 'RF & Communication', subcategory: 'Boosters' },
    'manet': { category: 'RF & Communication', subcategory: 'MANET Radios' },
    'antenna': { category: 'RF & Communication', subcategory: 'Antennas' },
    
    // Power Systems
    'Batteries': { category: 'Power Systems', subcategory: 'Batteries' },
    'Power Distribution': { category: 'Power Systems', subcategory: 'PDB' },
    
    // Navigation & Sensors
    'ajgps': { category: 'Navigation & Sensors', subcategory: 'Anti-Jamming' },
    'acoustic': { category: 'Navigation & Sensors', subcategory: 'Acoustic Sensors' },
    'GNSS': { category: 'Navigation & Sensors', subcategory: 'GNSS Modules' },
    
    // Computing
    'edge-ai': { category: 'Computing & AI', subcategory: 'Edge AI Nodes' },
    
    // Platforms
    'drone': { category: 'Platforms', subcategory: 'Unmanned Aerial Vehicles' },
};

/**
 * Normalizes category and subcategory based on current values and text analysis.
 */
export function normalizeCategory(p: { category?: string | null; name: string; description?: string }): { category: string; subcategory: string } {
    const cat = p.category || '';
    const name = p.name.toLowerCase();
    const desc = (p.description || '').toLowerCase();

    // 1. Direct mapping
    if (TAXONOMY[cat]) return TAXONOMY[cat];

    // 2. Keyword based refinement
    if (name.includes('motor') || desc.includes('kv rating')) return { category: 'Propulsion', subcategory: 'Motors' };
    if (name.includes('esc') || desc.includes('foc')) return { category: 'Propulsion', subcategory: 'Electronic Speed Controllers' };
    if (name.includes('battery') || name.includes('molicel')) return { category: 'Power Systems', subcategory: 'Batteries' };
    if (name.includes('antenna') || name.includes('lpda')) return { category: 'RF & Communication', subcategory: 'Antennas' };
    if (name.includes('amplifier') || name.includes('ads-b')) return { category: 'RF & Communication', subcategory: 'Amplifiers' };
    if (name.includes('jamming') || name.includes('anti-jam')) return { category: 'Navigation & Sensors', subcategory: 'Anti-Jamming' };
    if (name.includes('drone') || name.includes('uav')) return { category: 'Platforms', subcategory: 'UAVs' };

    return { category: cat || 'General', subcategory: 'Other' };
}

/**
 * Extracts technical specifications from description and features.
 */
export function extractSpecs(p: { description?: string; features?: string[]; category: string }): ProductSpecs {
    const specs: ProductSpecs = {};
    const text = `${p.description || ''} ${ (p.features || []).join(' ') }`;

    // RF Specs
    if (p.category === 'RF & Communication') {
        const freqMatch = text.match(/([0-9.]+)\s*-\s*([0-9.]+)\s*MHz/i) || text.match(/([0-9.]+)\s*MHz/i);
        if (freqMatch) specs['Frequency'] = freqMatch[0];

        const gainMatch = text.match(/([0-9.]+)\s*dB/i);
        if (gainMatch) specs['Gain'] = gainMatch[0];

        const noiseMatch = text.match(/Noise Figure[:\s]+([0-9.]+)\s*dB/i) || text.match(/＜([0-9.]+)\s*dB/i);
        if (noiseMatch) specs['Noise Figure'] = noiseMatch[1] + 'dB';

        const powerMatch = text.match(/([0-9.]+)\s*W/i) || text.match(/([0-9.]+)\s*dBm/i);
        if (powerMatch) specs['Power'] = powerMatch[0];
    }

    // Power Specs
    if (p.category === 'Power Systems') {
        const capMatch = text.match(/([0-9.]+)\s*Wh/i);
        if (capMatch) specs['Capacity (Wh)'] = parseFloat(capMatch[1]);

        const ahMatch = text.match(/([0-9.]+)\s*Ah/i) || text.match(/([0-9.]+)\s*mAh/i);
        if (ahMatch) specs['Capacity (Ah)'] = ahMatch[0];

        const voltMatch = text.match(/([0-9.]+)\s*V/i);
        if (voltMatch) specs['Voltage'] = voltMatch[0];
    }

    // Navigation Specs
    if (p.category === 'Navigation & Sensors') {
        const chanMatch = text.match(/([0-9]+)\s*channel/i);
        if (chanMatch) specs['Channels'] = parseInt(chanMatch[1]);
        
        const accMatch = text.match(/≤\s*([0-9.]+)\s*m/i) || text.match(/Accuracy[:\s]+([0-9.]+)\s*m/i);
        if (accMatch) specs['Accuracy'] = accMatch[1] + 'm';
    }

    // Platform Specs
    if (p.category === 'Platforms') {
        const endMatch = text.match(/([0-9]+)\s*-\s*([0-9]+)\s*Minutes/i) || text.match(/([0-9]+)\s*Minutes/i);
        if (endMatch) specs['Endurance'] = endMatch[0];
    }

    // --- Global Extractions (Apply to all categories) ---
    
    // 1. Weight Extraction
    // Matches: 160g, 160 g, 1.2kg, 1.2 kg, <400g, Approx. 1150g
    const weightMatch = text.match(/(?:Weight|Mass)[:\s]*([<≤]?\s*[0-9.]+\s*(?:kg|g|grams))/i) || 
                        text.match(/([0-9.]+\s*(?:kg|g)(?!\w))/i);
    if (weightMatch) specs['Weight'] = weightMatch[1].trim();

    // 2. Dimensions Extraction
    // Matches: 100.0mm x 100.0mm x 25.0mm, 21.0 x 6.8 x 5.2, 140*140*45 mm
    const dimMatch = text.match(/(?:Dimensions|Size)[:\s]*([0-9.]+\s*(?:mm|cm|in)?\s*[x*]\s*[0-9.]+\s*(?:mm|cm|in)?\s*[x*]\s*[0-9.]+\s*(?:mm|cm|in)?)/i) ||
                     text.match(/([0-9.]+\s*[x*]\s*[0-9.]+\s*[x*]\s*[0-9.]+)\s*(?:mm|cm|in)/i);
    if (dimMatch) specs['Dimensions'] = dimMatch[1].trim();

    // 3. Power Draw Extraction
    // Matches: Power consumption: <15W, Power: 25W, 10W (if not already Power Output)
    const pwrMatch = text.match(/(?:Power consumption|Power draw|Consumption)[:\s]*([<≤]?\s*[0-9.]+\s*W)/i);
    if (pwrMatch) specs['Power Draw'] = pwrMatch[1].trim();

    return specs;
}
