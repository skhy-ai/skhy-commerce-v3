# SKHY AI — Physics Engine Documentation

## Overview

The Build Your Own Drone (BYOD) simulator uses a **spec-driven physics engine** (`useHeavyLiftSimulation.ts`) to compute real-time flight performance, validate component compatibility, and generate Bills of Materials (BOM).

---

## Voltage Classes

| Class | Voltage Range | Examples |
|-------|--------------|---------|
| **LV** (Low Voltage) | ≤ 51.8V (≤ 12S LiPo) | `6S = 22.2V`, `10S = 37V`, `12S = 44.4V`, `14S = 51.8V` |
| **HV** (High Voltage) | > 52V (> 12S LiPo) | `16S = 59.2V`, `18S = 66.6V`, HV packs |

> **Rule:** Motor `voltage_req` must match Battery `type` (both LV or both HV). A mismatch triggers a ⚠️ Voltage Mismatch warning and blocks BOM generation.

---

## ESC Current Rating Rule

```
ESC.rating (A)  ≥  Motor.max_amps (A)
```

If the motor's peak current exceeds the ESC's rated amperage, the ESC will overheat or fail.

> **Example:** `tm_p80_iii` has `max_amps = 65A`. A `60a_single` ESC (60A) is **under-rated** — triggers ⚠️ ESC Mismatch.

---

## Thrust-to-Weight Ratio (TWR)

```
TWR = Total_Max_Thrust / AUW
```

- **Minimum safe TWR:** 2.0 (50% throttle at hover)
- **Recommended:** ≥ 2.5 for stable controlled flight
- If `hoverThrottle > 75%` (TWR < 1.33), the config is flagged as **overweight**

---

## Hover Power Formula

```
P_hover (W) = AUW_grams / motor_efficiency_hover (g/W)
```

**Example:** 10kg AUW drone with η = 7.5 g/W:
```
P_hover = 10,000g / 7.5 g/W = 1,333 W
```

Motor efficiency values (`efficiency_hover`) are sourced from manufacturer datasheets and embedded in the `MOTORS` catalog in `droneComponents.ts`.

---

## Endurance Formula

```
usable_Wh    = battery.capacity_wh × 0.80   (20% reserve)
endurance_hr = usable_Wh / P_hover (W)
endurance_min = endurance_hr × 60
```

---

## Speed and Range Formula

```
RPM_load     = motor.kv × battery.voltage × 0.75   (prop load derating)
pitch_inches = prop.size_inches × 0.40
speed_raw_kmh = RPM_load × pitch_inches × 0.001524   (pitch-speed formula)

// Capped by frame class:
speed_kmh = min(speed_raw × 0.8, 72)    // standard
speed_kmh = min(speed_raw × 0.6, 45)    // industrial

cruise_speed = speed × 0.65
range_km     = endurance_hr × cruise_speed
```

---

## Mass Budget

| Component | Weight Source |
|-----------|--------------|
| Frame | `FRAMES[frameId].weight_kg` |
| Motors | `motor.weight_kg × frame.arms` |
| Props | `prop.weight_kg × frame.arms` |
| ESC | `esc.weight_kg` (4in1) or `esc.weight_kg × frame.arms` |
| Battery | `batt.weight_kg` |
| GPS | 0.050 kg (fixed) |
| Telemetry | 0.030 kg (standard) / `HIGH_GAIN_TELEMETRY.weight_kg` |
| Payload | user-selected `payloadMass + camera.weight_kg` |

**Total AUW = sum of all above**

---

## Pre-Generated Configs (AI Engine Presets)

Pre-generated configurations in `preGeneratedConfigs.ts` are validated against three rules:

1. `motor.voltage_req === battery.type` (LV/HV match)
2. `esc.rating >= motor.max_amps`  
3. `hoverThrottle <= 75%` (TWR ≥ 1.33)

### Fixed Presets (June 2026)

| Preset | Problem | Fix Applied |
|--------|---------|------------|
| Swift-Quad Express | `quad_industrial` (25kg frame!) with wrong motors | → `quad_17` + `sunnysky_x4110s` + `40a_xrotor` |
| Shield-Quad Anti-Jam | Marginal ESC margin with `cobra_cm4515` | → `kde_4014xf` (35A) + `40a_xrotor` (40A) |
| Fortress Hex | `tm_p80_iii` (65A) vs `60a_single` (60A) ESC | → `hw_p80_esc` (150A FOC) |
| LiDAR-Hex Industrial | Same ESC under-rating | → `hw_p80_esc` (150A FOC) |
| gen-log-07 (AI) | `hw_p50m` (HV) + `mpower_14s_45000` (LV) | → `tm_p80_iii` (LV) + `hw_p80_esc` |

---

## Adding New Presets

When adding a preset to `preGeneratedConfigs.ts` or `heavyLiftData.ts`:

1. Verify `motor.voltage_req` matches `battery.type`
2. Verify `esc.rating >= motor.max_amps`
3. Estimate AUW and check `(AUW / motor.max_thrust_kg × frame.arms) < 0.75`
4. Set `power_consumption_w` = `(AUW_kg × 1000) / motor.efficiency_hover` for reference

---

## Component Catalog References

- **Frames:** `src/data/droneComponents.ts → FRAMES`
- **Motors:** `src/data/droneComponents.ts → MOTORS` + DB-parsed motors
- **Batteries:** `src/data/droneComponents.ts → BATTERIES` + DB-parsed batteries  
- **ESCs:** `src/data/droneComponents.ts → ESCS`
- **Props:** `src/data/droneComponents.ts → PROPS`
- **Config Templates:** `src/data/simulators/heavyLiftData.ts → CONFIG_TEMPLATES`
- **Pre-Generated:** `src/data/preGeneratedConfigs.ts → PRE_GENERATED_CONFIGS`
