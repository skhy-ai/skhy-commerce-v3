/**
 * marketplaceNormalization.js
 * Central logic for standardizing product categories and extracting technical specifications.
 * (JS version for script compatibility)
 */

const TAXONOMY = {
    // RF Communications
    'ADS-B AMPLIFIER': { category: 'Amplifiers', subcategory: 'ADS-B' },
    'ADS-B FILTER': { category: 'RF Communications', subcategory: 'Filters' },
    'booster': { category: 'Amplifiers', subcategory: 'Signal Boosters' },
    'manet': { category: 'RF Communications', subcategory: 'MANET Radios' },
    'antenna': { category: 'RF Communications', subcategory: 'Antennas' },
    
    // Navigation & Sensors
    'ajgps': { category: 'Navigation & Sensors', subcategory: 'Anti-Jamming GNSS' },
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
export function normalizeCategory(p) {
    const cat = (p.category || '').toLowerCase();
    const name = p.name.toLowerCase();
    const desc = (p.description || '').toLowerCase();

    // 1. Direct mapping check (if name or category matches key exactly)
    if (TAXONOMY[p.category]) return TAXONOMY[p.category];

    // 2. Specialized Logic for User Requirements
    
    // Navigation & Sensors / Anti-Jamming (CRPAs are sensors/navigation protection, not jammers)
    if (name.includes('anti-jamming') || name.includes('ajgps') || name.includes('crpa') || name.includes('gnss anti-jam')) {
        return { category: 'Navigation & Sensors', subcategory: 'Anti-Jamming GNSS' };
    }

    // Jamming First (high priority as they are often mixed with others)
    if (name.includes('jamming') || name.includes('jammer') || name.includes('blocker')) {
        return { category: 'Jamming Systems', subcategory: name.includes('module') ? 'Jamming Modules' : 'Signal Jammers' };
    }

    // Amplifiers
    if (name.includes('amplifier') || name.includes('booster') || name.includes('repeater') || cat.includes('amplifier')) {
        return { category: 'Amplifiers', subcategory: name.includes('bidirectional') ? 'Bidirectional' : 'Power Amplifiers' };
    }

    // RF Communications (MIMO, Mesh, MANET, Radios)
    if (name.includes('mimo') || name.includes('mesh') || name.includes('manet') || name.includes('radio') || name.includes('telemetry') || name.includes('datalink')) {
        return { category: 'RF Communications', subcategory: name.includes('mesh') ? 'Mesh Networking' : 'Data Links' };
    }

    // Other categories
    if (name.includes('motor') || desc.includes('kv rating')) return { category: 'Propulsion', subcategory: 'Motors' };
    if (name.includes('esc') || desc.includes('foc')) return { category: 'Propulsion', subcategory: 'Electronic Speed Controllers' };
    if (name.includes('battery') || name.includes('molicel') || name.includes('li-ion') || name.includes('lipo')) return { category: 'Power Systems', subcategory: 'Batteries' };
    if (name.includes('antenna') || name.includes('lpda') || name.includes('dipole')) return { category: 'RF Communications', subcategory: 'Antennas' };
    if (name.includes('filter') || name.includes('cavity')) return { category: 'RF Communications', subcategory: 'Filters' };
    if (name.includes('drone') || name.includes('uav') || name.includes('vtol') || name.includes('multicopter')) return { category: 'Platforms', subcategory: 'UAVs' };
    if (name.includes('propeller') || name.includes('cf prop')) return { category: 'Propulsion', subcategory: 'Propellers' };

    // Default normalization
    const finalCat = p.category || 'General';
    return { category: finalCat, subcategory: 'Other' };
}

/**
 * Extracts technical specifications from description and features.
 */
export function extractSpecs(p) {
    const specs = {};
    const name = (p.name || '').toLowerCase();
    const text = `${p.description || ''} ${ (p.features || []).join(' ') }`;

    // RF Specs
    if (p.category === 'RF & Communication' || p.category === 'Communications' || p.category === 'General' || name.includes('jammer') || name.includes('radio')) {
        const freqMatch = text.match(/([0-9.]+)\s*-\s*([0-9.]+)\s*(MHz|GHz)/i) || text.match(/([0-9.]+)\s*(MHz|GHz)/i);
        if (freqMatch) specs['Frequency'] = freqMatch[0];

        const gainMatch = text.match(/([0-9.]+)\s*dB/i);
        if (gainMatch) specs['Gain'] = gainMatch[0];

        const noiseMatch = text.match(/Noise Figure[:\s]+([0-9.]+)\s*dB/i) || text.match(/＜([0-9.]+)\s*dB/i);
        if (noiseMatch) specs['Noise Figure'] = noiseMatch[1] + 'dB';

        const powerMatch = text.match(/Output Power[:\s]+([0-9.]+)\s*W/i) || text.match(/([0-9.]+)\s*W/i) || text.match(/([0-9.]+)\s*dBm/i);
        if (powerMatch) specs['Power Output'] = powerMatch[0];
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
    if (p.category === 'Platforms' || name.includes('drone') || name.includes('uav')) {
        const endMatch = text.match(/([0-9]+)\s*-\s*([0-9]+)\s*Minutes/i) || text.match(/([0-9]+)\s*Minutes/i);
        if (endMatch) specs['Endurance'] = endMatch[0];
        
        const rangeMatch = text.match(/([0-9]+)\s*-\s*([0-9]+)\s*km/i) || text.match(/([0-9]+)\s*km/i);
        if (rangeMatch) specs['Range'] = rangeMatch[0];
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

    // 4. Electrical Specifications (from direct fields)
    if (p.operating_voltage) specs['Operating Voltage'] = p.operating_voltage;
    if (p.operating_current) specs['Operating Current'] = p.operating_current;

    return specs;
}
