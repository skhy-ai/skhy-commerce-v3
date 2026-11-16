/**
 * parseProductSpecs.ts
 * Extracts physics-critical values from a product's `features[]` text array.
 *
 * Motor features pattern examples:
 *   "Max Thrust: 2.5kg per axis"   → max_thrust_kg
 *   "380KV (RPM/V)"                → kv
 *   "Max Continuous Power: 850W"   → watts_max
 *   "Integrated 120A FOC ESC"      → max_amps
 *
 * Battery feature pattern examples:
 *   "13.5Ah Capacity (299.7Wh)"    → capacity_ah, capacity_wh
 *   "22.2V Nominal Voltage"        → voltage
 *   "135A Max Continuous Discharge" → max_discharge_a
 */

/** Extract the first numeric match from an array of strings given regex patterns. */
function extractNum(sources: string[], ...patterns: RegExp[]): number | null {
    for (const src of sources) {
        for (const pat of patterns) {
            const m = src.match(pat);
            if (m) return parseFloat(m[1]);
        }
    }
    return null;
}

// ─── Motor ────────────────────────────────────────────────────────────────────

export interface ParsedMotorSpecs {
    max_thrust_kg: number;     // kg, per motor axis
    kv: number;                // RPM/V
    watts_max: number;         // W continuous
    max_amps: number;          // A continuous
    /** g/W — directly governs hover endurance. Physics-derived from real thrust vs power data. */
    efficiency_hover: number;
    voltage_req: 'LV' | 'HV';
    class: 'medium' | 'industrial';
}

/**
 * Derive hover efficiency (g/W) from measured thrust (kg) and max power (W).
 * Real-world benchmarks used as bounds:
 *   Hobbywing P65M: 130 kg / (20000 W) ≈ 6.5 g/W
 *   Hobbywing P50M: 104 kg / (15000 W) ≈ 6.9 g/W
 *   T-Motor P80:    18 kg  / (2000 W)  ≈ 9.0 g/W
 *   KDE 4014XF:     2.8 kg / (850 W)   ≈ 3.3 g/W → hover at 50% thrust ≈ 7 g/W
 *   T-Motor MN4006: 2.5 kg / (400 W)   ≈ 6.25 g/W hover, real-world ≈ 9–11 g/W
 *
 * The discrepancy is because max_power is at MAX thrust, not hover.
 * Hover is typically 40–60% throttle, where efficiency peaks.
 * Industry-measured hover efficiency is usually 1.5–2× the max-throttle figure.
 */
function deriveHoverEfficiency(thrustKg: number, wattsMax: number): number {
    // Known industrial motor anchor points (from T-Motor & Hobbywing datasheets)
    if (thrustKg >= 100) return 6.5;   // Hobbywing P65M class
    if (thrustKg >= 80)  return 7.1;   // Hobbywing P50M class
    if (thrustKg >= 15)  return 9.0;   // T-Motor P80 class
    if (thrustKg >= 5)   return 9.5;   // Heavy medium (Cobra CM-4515)
    if (thrustKg >= 2.5) return 10.5;  // Medium (MN4006 / KDE 4014XF)
    if (thrustKg >= 1.8) return 10.0;  // Light-medium (MT3510)
    // Fallback: derive from thrust/power ratio at hover (≈55% throttle = 30% power)
    if (wattsMax > 0) {
        const hoverW = wattsMax * 0.30;
        const derived = (thrustKg * 0.55 * 1000) / hoverW;
        return Math.min(14, Math.max(7, derived));
    }
    return 9.0; // safe default
}

export function parseMotorFromProduct(p: {
    features?: string[];
    power_draw_w?: number;
    weight_kg?: number | null;
    name?: string;
}): ParsedMotorSpecs {
    const feats: string[] = p.features || [];
    const name = p.name || '';

    // ── Max Thrust (kg/axis) ──
    const thrust = extractNum([...feats, name],
        /Max Thrust[:\s]+([0-9.]+)\s*kg/i,
        /([0-9.]+)\s*kg.*per.*axis/i,
        /([0-9.]+)\s*kg.*Maximum Thrust/i,
        /([0-9.]+)\s*kg.*Thrust Capacity/i,
    ) ?? 2.5;

    // ── KV Rating ──
    const kv = extractNum([...feats, name], /([0-9]+)\s*KV/i) ?? 400;

    // ── Max Continuous Watts ──
    // power_draw_w in DB = max continuous power for motors with full spec sheets
    const parsedWatts = extractNum(feats,
        /Max Continuous Power[:\s]+([0-9]+)\s*W/i,
        /([0-9]+)\s*W.*continuous/i,
    );
    const watts_max = (p.power_draw_w && p.power_draw_w > 0)
        ? p.power_draw_w
        : (parsedWatts ?? Math.round(thrust * 1000 / 9.0)); // physics fallback

    // ── Max Amps ──
    const max_amps = extractNum(feats,
        /Integrated\s+([0-9]+)\s*A\s*(FOC|ESC)/i,
        /([0-9]+)\s*A\s*(FOC|ESC|Max|Continuous)/i,
        /([0-9]+)A.*integrated/i,
    ) ?? Math.max(20, Math.round(watts_max / 22.2));

    // ── Hover Efficiency (g/W) ──
    const efficiency_hover = deriveHoverEfficiency(thrust, watts_max);

    // ── Voltage Class ──
    // Industrial motors with KV < 30 or HV in features → HV
    const isHV = kv < 30 || feats.some(f => /\bHV\b|High.Voltage|High-Voltage/i.test(f));
    const voltage_req: 'LV' | 'HV' = isHV ? 'HV' : 'LV';

    // ── Motor Class ──
    const motorClass: 'medium' | 'industrial' = thrust >= 15 ? 'industrial' : 'medium';

    return { max_thrust_kg: thrust, kv, watts_max, max_amps, efficiency_hover, voltage_req, class: motorClass };
}

// ─── Battery ──────────────────────────────────────────────────────────────────

export interface ParsedBatterySpecs {
    capacity_wh: number;       // Wh
    voltage: number;           // V nominal
    capacity_ah: number;       // Ah
    max_discharge_a: number;   // A continuous
    type: 'LV' | 'HV';
}

export function parseBatteryFromProduct(p: {
    features?: string[];
    name?: string;
    description?: string;
    power_draw_w?: number;
}): ParsedBatterySpecs | null {
    const feats: string[] = p.features || [];
    const desc = p.description || '';
    const name = p.name || '';
    const all = [...feats, desc, name];

    // ── Wh ──
    // "299.7Wh" or "(299.7Wh)" or "Capacity: 1554Wh"
    const wh = extractNum(all,
        /\(([0-9.]+)\s*Wh\)/i,
        /Capacity.*([0-9.]+)\s*Wh/i,
        /([0-9.]+)\s*Wh\s*Capacity/i,
        /([0-9.]+)\s*Wh/i,
    );

    // ── Ah ──
    // "13.5Ah" or "30000mAh"
    const ah = extractNum(all,
        /([0-9.]+)\s*Ah\s*Capacity/i,
        /Capacity.*\(([0-9.]+)\s*Ah\)/i,
        /([0-9.]+)\s*Ah/i,
    );
    const mah = extractNum(all, /([0-9]+)\s*mAh/i);
    const capacityAh = ah ?? (mah ? mah / 1000 : null);

    // ── Voltage ──
    const voltage = extractNum(all,
        /([0-9.]+)\s*V\s*Nominal/i,
        /([0-9.]+)V\s*Nominal/i,
        /Nominal.*([0-9.]+)\s*V/i,
        /([0-9.]+)\s*V\s*\(/i,
    );

    // ── Max Discharge ──
    const maxA = extractNum(feats,
        /([0-9]+)\s*A\s*Max\s*Continuous/i,
        /([0-9]+)\s*A.*Discharge/i,
        /([0-9]+)\s*A.*Max/i,
    ) ?? 80;

    // ── Resolve capacity_wh ──
    const capacityWh = wh
        ?? (capacityAh && voltage ? Math.round(capacityAh * voltage * 10) / 10 : null);

    // Guard: must have meaningful energy
    if (!capacityWh || capacityWh < 10) return null;

    const finalVoltage = voltage ?? (capacityAh ? capacityWh / capacityAh : 22.2);
    const finalAh = capacityAh ?? capacityWh / finalVoltage;

    return {
        capacity_wh: Math.round(capacityWh * 10) / 10,
        voltage: finalVoltage,
        capacity_ah: Math.round(finalAh * 10) / 10,
        max_discharge_a: maxA,
        type: finalVoltage >= 44 ? 'HV' : 'LV',
    };
}
