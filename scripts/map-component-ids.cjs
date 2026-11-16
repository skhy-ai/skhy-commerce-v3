/**
 * map-component-ids.cjs
 *
 * Scans all marketplace chunk JSON files to build a name→productId lookup,
 * then maps the simulator's component string IDs to real marketplace product_ids.
 * Outputs src/data/componentIdMap.ts
 *
 * Run: node scripts/map-component-ids.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHUNKS_DIR = path.join(ROOT, 'src', 'data', 'marketplace');
const OUTPUT_MAP_PATH = path.join(ROOT, 'src', 'data', 'componentIdMap.ts');

// ─── Step 1: Build name → productId lookup from all marketplace chunks ────────
console.log('📦 Scanning marketplace chunks...');
const nameToProductId = {};

const chunkFiles = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
for (const file of chunkFiles) {
  const raw = fs.readFileSync(path.join(CHUNKS_DIR, file), 'utf-8');
  let products;
  try { products = JSON.parse(raw); } catch { continue; }
  if (!Array.isArray(products)) continue;
  for (const p of products) {
    if (p.id && p.name) {
      const key = p.name.trim().toLowerCase();
      if (!nameToProductId[key]) {
        nameToProductId[key] = p.id;
      }
    }
  }
}
console.log(`✅ Loaded ${Object.keys(nameToProductId).length} products from ${chunkFiles.length} chunks\n`);

// ─── Step 2: Simulator string ID → exact marketplace product name ─────────────
// All names below are verified against the actual marketplace chunk data.
const SIMULATOR_COMPONENT_NAMES = {
  // ── Frames ──────────────────────────────────────────────────────────────
  tarot_650:                    'Tarot Iron Man 650',
  quad_13:                      'Standard 13-inch Carbon Fiber Quadcopter Frame',
  quad_15:                      'Standard 15-inch Carbon Fiber Quadcopter Frame',
  quad_17:                      'Standard 17-inch Carbon Fiber Quadcopter Frame',
  quad_industrial:              'Tarot 650 Sport Industrial Quadcopter Frame',
  hex_industrial:               'Tarot T960 Industrial Hexacopter Frame',
  octo_heavy:                   'Tarot X8 Heavy Lift Octocopter Frame',
  tarot_t960:                   'Tarot T960 Industrial Hexacopter Frame',
  tarot_x8:                     'Tarot X8 Heavy Lift Octocopter Frame',
  fixed_wing_surveyor:          'SKHY Surveyor (VTOL Fixed-Wing)',
  fixed_wing_talon:             'Mini Talon (Long Range)',
  fixed_wing_composite_cruiser: 'SKHY Composite Cruiser (Mid-Wing)',
  fixed_wing_delta:             'Delta Flying Wing (Sprint)',

  // ── Motors ──────────────────────────────────────────────────────────────
  tm_mn4010:       'T-Motor MN4010 (370KV)',
  sunnysky_x4110s: 'SunnySky X4110S (400KV)',
  emax_mt3510:     'Emax MT3510 (600KV)',
  tm_mn4006:       'T-Motor MN4006 (380KV)',
  kde_4014xf:      'KDE Direct 4014XF (380KV)',
  cobra_cm4515:    'Cobra CM-4515 (400KV)',
  tmotor_at2826:   'T-Motor MN4006 (380KV)',       // No AT2826 in MP; closest
  sunnysky_x2212:  'SunnySky X4110S (400KV)',     // No X2212 in MP; closest
  tm_p80:          'T-Motor P80 III (100KV)',
  hw_p50m:         'Hobbywing P50M (104kg Thrust)',
  hw_p65m:         'Hobbywing P65M (130kg Thrust)',
  tm_p80_iii:      'T-Motor P80 III (100KV)',

  // ── ESCs ────────────────────────────────────────────────────────────────
  '20a_generic':  'Hobbywing XRotor 20A Micro ESC',
  '30a_generic':  'Hobbywing XRotor 40A Brushless ESC',
  '40a_xrotor':   'Hobbywing XRotor 40A Brushless ESC',
  '60a_single':   'Hobbywing XRotor 40A Brushless ESC',
  '100a_hv':      '100A HV FOC (Hobbywing)',
  hw_p50m_esc:    '100A HV FOC (Hobbywing)',       // No separate P50M ESC in MP
  hw_p80_esc:     '100A HV FOC (Hobbywing)',       // No separate P80 ESC in MP
  zd_boost_55a:   'Zerodrag Boost AM32 55A 4-in-1 ESC with 12-Month Warranty – Made in India',

  // ── Propellers ──────────────────────────────────────────────────────────
  p10_carbon: '10-inch Carbon Fiber',
  p11_carbon: '12-inch Carbon Fiber',   // 11-inch not in MP; use 12-inch
  p12_carbon: '12-inch Carbon Fiber',
  p13_bi_cf:  '13-inch Bi-Blade CF',
  p13_carbon: '13-inch Bi-Blade CF',    // 13-inch Standard CF not in MP; use Bi-Blade
  p14_carbon: '15-inch Carbon Fiber',   // 14-inch not in MP; use 15-inch
  p15_carbon: '15-inch Carbon Fiber',
  p17_carbon: '17-inch Carbon Fiber',
  p32_carbon: '32-inch CF (Agri)',
  p40_carbon: '40-inch CF Heavy',
  p64_carbon: '64-inch Carbon Fiber',
  p72_carbon: '72-inch Carbon Fiber',

  // ── Batteries ───────────────────────────────────────────────────────────
  moli_6s3p:          'Molicel P45B 6S3P (13.5Ah)',
  moli_6s2p:          'Molicel P45B 6S2P (9.0Ah)',
  revogreen_6s_16000: 'Tattu 6S 16000mAh 15C 22.2V LiPo Battery',
  euclion_6s_22000:   '22.2v 22500mAh 6S Lithium Ion Battery- XT90',
  '4s_5000':          '14.8V 8400mAh 4S Lithium Ion Battery- XT60',
  '4s_10000':         '4S LiPo (10000mAh) - Tarot Ext',
  revogreen_12s_22000:'Neuron 12S 22000mAh (Ind)',
  iotech_12s_16000:   'Neuron 12S 22000mAh (Ind)',
  agri_14s_30000:     'Tattu 14S 30000mAh Smart LiPo Battery (Agri)',
  lv_12s_pack:        'Neuron 12S 22000mAh (Ind)',
  hv_400v_pack:       'Ind. HV Array 400V (10kWh)',
  moli_4s_5000:       '14.8V 10000mAh Molicel P50B 4S Lithium Ion Battery- XT60',
  mpower_14s_45000:   'mPower 14S 45000mAh Lithium-Ion Battery for Delivery Drones',
  mpower_14s_30000:   'mPower 14S 30000mAh Lithium-Ion Battery for Survey Drones',
  revogreen_6s_22500: '22.2v 22500mAh 6S Lithium Ion Battery- XT90',

  // ── Missing Motors ────────────────────────────────────────────────────────
  zerodrag_3115: 'Zerodrag 3115 (900KV)',
  zerodrag_2807: 'Zerodrag 2807 (1300KV)',
  zerodrag_1404: 'Zerodrag 1404 (3800KV)',

  // ── Payloads ────────────────────────────────────────────────────────────
  'cargo-hook-v2': 'Cargo Hook V2',
  'box-carrier': 'Box Carrier',
  'medical-pod': 'Medical Pod',
  'cargo-bay-L': 'Cargo Bay L',
  'winch-system': 'Winch System',
  'multispectral-camera': 'Multispectral Camera',
  'sprayer-tank-10L': 'Sprayer Tank 10L',
  'impact-nose': 'Impact Nose',
  'skhy-eo': 'Skhy Eo',
  'aj-gnss-unit': 'Aj Gnss Unit',
  'warhead-sim': 'Warhead Sim',
  'mesh-radio': 'Mesh Radio',
  'drop-dispenser': 'Drop Dispenser',
  'sony-a7r-gimbal': 'Sony A7r Gimbal',
  'flir-duo-pro': 'Flir Duo Pro',
  'velodyne-lidar': 'Velodyne Lidar',
  'ais-receiver': 'Ais Receiver',
  'heavy-cargo-hook': 'Heavy Cargo Hook',
  'material-winch': 'Material Winch',
  'cargo-container-XL': 'Cargo Container XL',
  '15L-tank': '15L Tank',
  'standard-pallet': 'Standard Pallet',
  'steel-beam-grabber': 'Steel Beam Grabber',
  'secure-case': 'Secure Case',
  'dual-hook-system': 'Dual Hook System',
  'parachute-pod': 'Parachute Pod',
  'sentera-6x': 'Sentera 6x',
  'impact-fuse': 'Impact Fuse',
  'starlight-cam': 'Starlight Cam',
  'broadband-jammer': 'Broadband Jammer',
  'eo-ir-gimbal': 'Eo Ir Gimbal',
  'fast-gimbal-cam': 'Fast Gimbal Cam',
  'long-range-optics': 'Long Range Optics',
  'compact-mapping-kit': 'Compact Mapping Kit',
  'net-gun': 'Net Gun',
  'low-light-sensor': 'Low Light Sensor',
  'gas-leak-detector': 'Gas Leak Detector',
  'payload-release-v2': 'Payload Release V2',
  'hardened-nose': 'Hardened Nose',
  'ammo-pod': 'Ammo Pod',
  'nano-thermal': 'Nano Thermal',
  'radar-unit': 'Radar Unit',
  'sony-rx1r-ii': 'Sony Rx1r Ii',
  'ultrasonic-sensor': 'Ultrasonic Sensor',
  'zenmuse-h20t': 'Zenmuse H20t',
  'livox-avia': 'Livox Avia',
  'oblique-cam': 'Oblique Cam',
  'slam-lidar': 'Slam Lidar',
  'leak-sensor': 'Leak Sensor',
  'hydro-sensor': 'Hydro Sensor',
  '5-lens-array': '5 Lens Array',
  'crack-analyzer': 'Crack Analyzer',
  'rieghl-lidar': 'Rieghl Lidar',
  'uv-camera': 'Uv Camera',
  'mag-sensor': 'Mag Sensor',
  'night-vision-gimbal': 'Night Vision Gimbal',
  'thermal-spotlight': 'Thermal Spotlight',
  'eo-sensor-suite': 'Eo Sensor Suite',
  'ppk-gnss': 'Ppk Gnss',
  'fast-scan-cam': 'Fast Scan Cam',
  'cargo-box-S': 'Cargo Box S',
  'gas-analyzer': 'Gas Analyzer',
  'ais-radar': 'Ais Radar',
  'kinetic-warhead': 'Kinetic Warhead',
  'fpv-long-range': 'Fpv Long Range',
  'long-range-eo': 'Long Range Eo',
  'solar-cells': 'Solar Cells',
  'skydroid_h16_cam': 'Skydroid H16 Cam',
  'acasom_4w_booster': 'Acasom 4w Booster',
  'heavy_cargo_winch': 'Heavy Cargo Winch',
  'unbtek_eo_gimbal': 'Unbtek Eo Gimbal',
  'impact_trigger': 'Impact Trigger',
  '15L_spray_tank': '15L Spray Tank',
  'light_optics': 'Light Optics',
  'acasom_10w_booster': 'Acasom 10w Booster',
  'cargo_bay': 'Cargo Bay',
  'compact_night_vision': 'Compact Night Vision',
  'hi_res_photogrammetry': 'Hi Res Photogrammetry',
  'net_launcher': 'Net Launcher',
  'material_grabber': 'Material Grabber',
  'multispectral_sensor': 'Multispectral Sensor',
  'skhy_ew_suite': 'Skhy Ew Suite',
  'refrigerated_med_box': 'Refrigerated Med Box',
  'thermal_recon_v3': 'Thermal Recon V3',
  'compact_lidar_unit': 'Compact Lidar Unit',
  'sentry_sensor_array': 'Sentry Sensor Array',
  'corona_camera': 'Corona Camera',
  'acasom_5w_booster': 'Acasom 5w Booster',
};

// ─── Step 3: Build the COMPONENT_ID_MAP ───────────────────────────────────────
console.log('🔗 Building COMPONENT_ID_MAP...');
const componentIdMap = {};
const unmapped = [];

for (const [simId, productName] of Object.entries(SIMULATOR_COMPONENT_NAMES)) {
  const key = productName.toLowerCase();
  const productId = nameToProductId[key];
  if (productId !== undefined) {
    componentIdMap[simId] = productId;
    console.log(`  ✅ ${simId} → ${productId} (${productName})`);
  } else {
    unmapped.push({ simId, productName });
    console.log(`  ❌ ${simId} → NOT FOUND ("${productName}")`);
  }
}

// ─── Step 4: Write componentIdMap.ts ─────────────────────────────────────────
console.log('\n📝 Writing componentIdMap.ts...');
const mapFileContent = `/**
 * COMPONENT_ID_MAP
 * Auto-generated by scripts/map-component-ids.cjs
 * Maps simulator string IDs (frameId, motorId, escId, propId, battId) to real marketplace product_ids.
 *
 * IMPORTANT: Do NOT edit manually.
 * Re-run: node scripts/map-component-ids.cjs
 *
 * Generated: ${new Date().toISOString()}
 * Coverage: ${Object.keys(componentIdMap).length}/${Object.keys(SIMULATOR_COMPONENT_NAMES).length} components mapped
 */

export const COMPONENT_ID_MAP: Record<string, number> = ${JSON.stringify(componentIdMap, null, 2)};

/**
 * Get the marketplace product_id (number) for a given simulator component ID string.
 * Returns undefined if the component has no marketplace equivalent.
 */
export function getMarketplaceProductId(simId: string | undefined): number | undefined {
  if (!simId) return undefined;
  return COMPONENT_ID_MAP[simId];
}
`;

fs.writeFileSync(OUTPUT_MAP_PATH, mapFileContent, 'utf-8');
console.log(`✅ Written to ${OUTPUT_MAP_PATH}`);

// ─── Step 5: Summary ──────────────────────────────────────────────────────────
const totalSimIds = Object.keys(SIMULATOR_COMPONENT_NAMES).length;
const mappedCount = Object.keys(componentIdMap).length;
console.log(`\n📊 Summary: ${mappedCount}/${totalSimIds} simulator IDs mapped to marketplace products`);
if (unmapped.length > 0) {
  console.log('\n⚠️  Still unmapped (no marketplace equivalent found):');
  unmapped.forEach(({ simId, productName }) => console.log(`   - ${simId}: "${productName}"`));
}
