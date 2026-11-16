import { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calculator, ShoppingCart, ShieldAlert, Crosshair, Radio, Video, Satellite, Activity, HelpCircle, Map as MapIcon, Settings, FileSpreadsheet, X, Cpu, Monitor, Loader2 } from 'lucide-react';
import { wattsToDbm, calcPathLoss, INITIAL_BANDS, RFBand } from '../../utils/rfUtils';
import { useCart } from '../../contexts/CartContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ─── Hardware catalogs ─────────────────────────────────────────────────────
interface HWOption { id: string; name: string; price: number; txPowerW?: number; rxSensDbm?: number; rangeKm?: number; freqMhz?: number; note?: string; imageUrl?: string; }

const GCS_OPTIONS: HWOption[] = [
  { id: 'siyi_mk15', name: 'SIYI MK15 Mini (~15 km)', price: 849, txPowerW: 1.0, rangeKm: 15, freqMhz: 2400, note: '5.5" HD, 1080p@60fps, IP53', imageUrl: 'https://ae01.alicdn.com/kf/S7e0f2b311fc94b9f8f4112e4d02ff85fW.jpg' },
  { id: 'herelink_1_1', name: 'Herelink 1.1 (~20 km)', price: 1099, txPowerW: 1.0, rangeKm: 20, freqMhz: 2400, note: '5.46" 1080p, ArduPilot/PX4', imageUrl: 'https://ae01.alicdn.com/kf/Sc1f2e3d4a5b6c7d8e9f0a1b2.jpg' },
  { id: 'skydroid_h16', name: 'Skydroid H16 (~10 km)', price: 699, txPowerW: 1.0, rangeKm: 10, freqMhz: 2400, note: '7" display, 1080p, IP67', imageUrl: 'https://ae01.alicdn.com/kf/S7e0f2b311fc94b9f8f4112e4d02ff85fW.jpg' },
  { id: 'skydroid_h16pro', name: 'Skydroid H16 Pro (~30 km)', price: 1599, txPowerW: 2.0, rangeKm: 30, freqMhz: 2400, note: '7" display, 20000mAh, IP67', imageUrl: 'https://ae01.alicdn.com/kf/S7e0f2b311fc94b9f8f4112e4d02ff85fW.jpg' },
  { id: 'siyi_mk32', name: 'SIYI MK32 Enterprise (~30 km)', price: 2199, txPowerW: 2.0, rangeKm: 30, freqMhz: 2400, note: '7" 1080p, dual operators', imageUrl: 'https://ae01.alicdn.com/kf/Sd2e3f4a5b6c7d8e9.jpg' },
];

const AIR_UNIT_OPTIONS: HWOption[] = [
  { id: 'dji_o3', name: 'DJI O3 Air Unit', price: 229, txPowerW: 0.28, rangeKm: 10, freqMhz: 5800, note: '1080p/100fps, 30ms latency, 4K record', imageUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=400' },
  { id: 'caddx_vista', name: 'Caddx Vista (DJI Eco)', price: 149, txPowerW: 0.25, rangeKm: 4, freqMhz: 5800, note: '720p/120fps, 21ms latency, 29g', imageUrl: 'https://ae01.alicdn.com/kf/Se3f4a5b6c7d8e9f0.jpg' },
  { id: 'siyi_zr10_air', name: 'SIYI ZR10 Air Unit', price: 650, txPowerW: 1.0, rangeKm: 15, freqMhz: 2400, note: '4K, 10x optical zoom, gimbal', imageUrl: 'https://ae01.alicdn.com/kf/S10f76378eafa4b8aa29910c2669b925b4.jpg' },
  { id: 'skydroid_t10', name: 'Skydroid T10 Air Module', price: 299, txPowerW: 0.5, rangeKm: 10, freqMhz: 2400, note: '1080p, 16ch, IP67, MAVLink', imageUrl: 'https://ae01.alicdn.com/kf/S7e0f2b311fc94b9f8f4112e4d02ff85fW.jpg' },
  { id: 'herelink_air', name: 'Herelink Air Unit', price: 399, txPowerW: 1.0, rangeKm: 20, freqMhz: 2400, note: 'Pairs with Herelink GCS', imageUrl: 'https://ae01.alicdn.com/kf/Sc1f2e3d4a5b6c.jpg' },
];

const TELEMETRY_OPTIONS: HWOption[] = [
  { id: 'rfd900x', name: 'RFD900x (868/915 MHz)', price: 280, txPowerW: 1.0, rxSensDbm: -121, rangeKm: 40, freqMhz: 915, note: '40 km range, FHSS, 250kbps' },
  { id: 'holybro_sik', name: 'Holybro SiK 915MHz 100mW', price: 55, txPowerW: 0.1, rxSensDbm: -117, rangeKm: 3, freqMhz: 915, note: 'MAVLink, UART, ArduPilot standard' },
  { id: 'holybro_microhard', name: 'Microhard pDDL 900MHz', price: 499, txPowerW: 1.0, rxSensDbm: -118, rangeKm: 20, freqMhz: 900, note: 'AES-256, 10 Mbps, IP modem' },
  { id: 'digi_xtend', name: 'Digi XTend 900 (1W)', price: 189, txPowerW: 1.0, rxSensDbm: -100, rangeKm: 70, freqMhz: 900, note: '70 km LOS, 115 kbps' },
  { id: 'tbs_crossfire', name: 'TBS Crossfire (900 MHz)', price: 119, txPowerW: 2.0, rxSensDbm: -130, rangeKm: 30, freqMhz: 868, note: '1.8ms latency, CRSF protocol' },
  { id: 'expresslrs', name: 'ExpressLRS 2.4 GHz', price: 59, txPowerW: 0.25, rxSensDbm: -112, rangeKm: 15, freqMhz: 2400, note: '< 0.5ms latency, open source' },
  { id: 'silvus_streamcaster', name: 'Silvus StreamCaster 4200', price: 15000, txPowerW: 4.0, rxSensDbm: -105, rangeKm: 100, freqMhz: 1400, note: 'UHF/L/S Band, MANET Mesh, 100 Mbps' },
];

const VIDEO_LINK_OPTIONS: HWOption[] = [
  { id: 'dji_o3_video', name: 'DJI O3+ Digital Link', price: 229, txPowerW: 0.28, rangeKm: 10, freqMhz: 5800, note: '1080p/100fps, 30ms, video+RC' },
  { id: 'siyi_mk15_video', name: 'SIYI MK15 Video Link', price: 440, txPowerW: 1.0, rangeKm: 15, freqMhz: 2400, note: '1080p/60fps, 180ms, integrated' },
  { id: 'skydroid_h16_video', name: 'Skydroid H16 Video Link', price: 699, txPowerW: 1.0, rangeKm: 10, freqMhz: 2400, note: '1080p, 7" display, IP67' },
  { id: 'connex_prosight', name: 'Amimon Connex ProSight', price: 999, txPowerW: 0.5, rangeKm: 2, freqMhz: 5200, note: 'Zero-latency (<1ms), 1080p/60fps' },
  { id: 'herelink_video', name: 'Herelink Video Downlink', price: 199, txPowerW: 1.0, rangeKm: 20, freqMhz: 2400, note: '720p/1080p, 110ms, HDMI out' },
  { id: 'analog_5g', name: 'Analog 5.8 GHz 600mW', price: 35, txPowerW: 0.6, rangeKm: 2, freqMhz: 5800, note: 'Sub-1ms latency, budget option' },
  { id: 'dji_o4_pro', name: 'DJI O4 Pro Digital Link', price: 999, txPowerW: 2.0, rangeKm: 20, freqMhz: 5800, note: '4K/60fps, 24ms, 20km range' },
];

export default function RFJammerSimulator() {
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const [isGeneratingBOM, setIsGeneratingBOM] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading process for the simulator
    const duration = 1500;
    const interval = 30;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => setIsLoading(false), 200);
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const [bands, setBands] = useState<RFBand[]>(INITIAL_BANDS);
  const [envFactor, setEnvFactor] = useState(2.0);
  const [activeBandId, setActiveBandId] = useState(5);
  const [targetDistKm, setTargetDistKm] = useState(3.0);
  const [altitudeM, setAltitudeM] = useState(100);
  const [ctrlDistKm, setCtrlDistKm] = useState(5.0);

  // Relay State
  // "ground-relay" feature added here: relayMode can be "fixed-wing" or "ground"
  const [relayEnabled, setRelayEnabled] = useState(false);
  const [relayMode, setRelayMode] = useState<'fixed-wing' | 'ground'>('fixed-wing');
  const [relayAltKm, setRelayAltKm] = useState(5.0);
  const [relayOffsetKm, setRelayOffsetKm] = useState(0.0);
  const [relayDepthKm, setRelayDepthKm] = useState(0.0);
  const [relayPower, setRelayPower] = useState(10.0);

  // Hardware config state
  const [selectedGcs, setSelectedGcs] = useState<string>('siyi_mk15');
  const [selectedAirUnit, setSelectedAirUnit] = useState<string>('dji_o3');
  const [selectedTelemetry, setSelectedTelemetry] = useState<string>('rfd900x');
  const [selectedVideoLink, setSelectedVideoLink] = useState<string>('dji_o3_video');
  const [showBom, setShowBom] = useState(false);

  const [showCalc, setShowCalc] = useState(false);
  const [showPhysicsHelp, setShowPhysicsHelp] = useState(false);

  const activeBand = useMemo(() => {
    return bands.find(b => b.id === activeBandId) || bands[0] || INITIAL_BANDS[0];
  }, [bands, activeBandId]);

  // Derive TX power from selected hardware
  const gcsHw = GCS_OPTIONS.find(o => o.id === selectedGcs)!;
  const airHw = AIR_UNIT_OPTIONS.find(o => o.id === selectedAirUnit)!;
  const telHw = TELEMETRY_OPTIONS.find(o => o.id === selectedTelemetry)!;
  const vidHw = VIDEO_LINK_OPTIONS.find(o => o.id === selectedVideoLink)!;
  // RC uplink power = GCS tx; Video downlink power = Air unit tx
  const rcPower = gcsHw?.txPowerW ?? 1.0;
  const videoPower = airHw?.txPowerW ?? 0.28;

  // Derived BOM calculation
  const bomTotal = useMemo(() => {
    return (gcsHw?.price || 0) + (airHw?.price || 0) + (telHw?.price || 0) + (vidHw?.price || 0);
  }, [gcsHw, airHw, telHw, vidHw]);

  const stringToId = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) + 200000;
  };

  const handleGenerateBOM = async () => {
    setIsGeneratingBOM(true);
    try {
      if (gcsHw) await addToCart(stringToId(gcsHw.id), 1, { id: stringToId(gcsHw.id), name: gcsHw.name, base_price: gcsHw.price });
      if (airHw) await addToCart(stringToId(airHw.id), 1, { id: stringToId(airHw.id), name: airHw.name, base_price: airHw.price });
      if (telHw) await addToCart(stringToId(telHw.id), 1, { id: stringToId(telHw.id), name: telHw.name, base_price: telHw.price });
      if (vidHw) await addToCart(stringToId(vidHw.id), 1, { id: stringToId(vidHw.id), name: vidHw.name, base_price: vidHw.price });

      for (const band of bands) {
        // Since we don't have an 'active' flag in the interface yet, let's assume it should match part of the logic
        // or just use the current active band for the BOM if needed. 
        // For now, let's just use the band.id === activeBandId to add the current module.
        if (band.id === activeBandId) {
          const jammerName = `SKHY RF Jammer Module (${band.freq} MHz, ${band.power}W)`;
          const jammerId = stringToId(jammerName);
          const price = (band.power || 0) * 15; // Estimating module price based on wattage
          await addToCart(jammerId, 1, { id: jammerId, name: jammerName, base_price: price });
        }
      }

      setCartOpen(true);
    } catch (error) {
      console.error("Failed to generate BOM:", error);
    } finally {
      setIsGeneratingBOM(false);
    }
  };

  // Derived logic
  const calcData = useMemo(() => {
    // Shared Physics
    const rcPowerDbm = wattsToDbm(Number(rcPower) || 0);
    const videoPowerDbm = wattsToDbm(Number(videoPower) || 0);
    const jammerPowerDbm = wattsToDbm(Number(activeBand?.power) || 0);

    const dJam = targetDistKm * 1000;
    const h = altitudeM;
    const dSlantJam = Math.sqrt(dJam ** 2 + h ** 2);

    const dCtrl = ctrlDistKm * 1000;
    const dGroundCtrl = Math.sqrt(Math.max(0, dCtrl ** 2 - h ** 2));

    const linkLoss = calcPathLoss(dCtrl, activeBand.freq, 2.1);

    // Uplink (GCS -> Drone)
    const jamLossUp = calcPathLoss(dSlantJam, activeBand.freq, envFactor);
    const jammerRxUp = jammerPowerDbm + activeBand.gain - jamLossUp;
    const linkRxUp = rcPowerDbm + 4.3 - linkLoss;

    // Downlink (Drone -> GCS)
    const distJamToGcs = dJam + dGroundCtrl;
    const jamLossDown = calcPathLoss(distJamToGcs, activeBand.freq, envFactor);
    const jammerRxDown = jammerPowerDbm + activeBand.gain - jamLossDown;
    const linkRxDown = videoPowerDbm + 4.3 - linkLoss;

    // Ground relay altitude force to 5m
    const actualRelayAltM = relayMode === 'ground' ? 5 : (relayAltKm * 1000);
    // Uses higher path loss factor (e.g. 2.5) for ground to ground
    const relayEnvFactor = relayMode === 'ground' ? 2.5 : 2.0;

    let relayRxUp = -999, relayRxDown = -999;
    let bestLinkRxUp = linkRxUp, bestLinkRxDown = linkRxDown;
    let dRelayLegUp = 0, dRelayLegDown = 0;

    const rX = relayOffsetKm * 1000;
    const rZ = relayDepthKm * 1000;

    if (relayEnabled) {
      // Relay for Uplink (GCS -> Relay -> Drone)
      const dX_drone = targetDistKm * 1000;
      const dZ_drone = 0;
      dRelayLegUp = Math.sqrt((rX - dX_drone) ** 2 + (actualRelayAltM - h) ** 2 + (rZ - dZ_drone) ** 2);
      const rLossUp = calcPathLoss(dRelayLegUp, activeBand.freq, relayEnvFactor);
      relayRxUp = wattsToDbm(relayPower) + 4.3 - rLossUp;
      bestLinkRxUp = Math.max(linkRxUp, relayRxUp);

      // Relay for Downlink (Drone -> Relay -> GCS)
      const dX_gcs = targetDistKm * 1000 + dGroundCtrl;
      const dZ_gcs = 0;
      dRelayLegDown = Math.sqrt((rX - dX_gcs) ** 2 + actualRelayAltM ** 2 + (rZ - dZ_gcs) ** 2);
      const rLossDown = calcPathLoss(dRelayLegDown, activeBand.freq, relayEnvFactor);
      relayRxDown = wattsToDbm(relayPower) + 4.3 - rLossDown;
      bestLinkRxDown = Math.max(linkRxDown, relayRxDown);
    }

    const sirUp = bestLinkRxUp - jammerRxUp;
    const sirDown = bestLinkRxDown - jammerRxDown;

    const statusUp = sirUp < 0 ? "JAMMED" : sirUp < 5 ? "UNSTABLE" : "ESTABLISHED";
    const statusDown = sirDown < 0 ? "JAMMED" : sirDown < 5 ? "UNSTABLE" : "ESTABLISHED";

    return {
      up: { targetPowerDbm: rcPowerDbm, jammerPowerDbm, jammerLoss: jamLossUp, jammerRx: jammerRxUp, linkRx: linkRxUp, relayRx: relayRxUp, bestLinkRx: bestLinkRxUp, sir: sirUp, status: statusUp, dRelayLeg: dRelayLegUp, dJammerPath: dSlantJam },
      down: { targetPowerDbm: videoPowerDbm, jammerPowerDbm, jammerLoss: jamLossDown, jammerRx: jammerRxDown, linkRx: linkRxDown, relayRx: relayRxDown, bestLinkRx: bestLinkRxDown, sir: sirDown, status: statusDown, dRelayLeg: dRelayLegDown, dJammerPath: distJamToGcs },
      linkLoss, dCtrl, jammerPowerDbm, envFactor,
      status: (sirUp < 0 || sirDown < 0) ? "JAMMED" : (sirUp < 5 || sirDown < 5) ? "UNSTABLE" : "ESTABLISHED"
    };
  }, [activeBand, envFactor, targetDistKm, altitudeM, ctrlDistKm, rcPower, videoPower, relayEnabled, relayAltKm, relayOffsetKm, relayDepthKm, relayPower, relayMode]);

  // Chart Data
  const chartData = useMemo(() => {
    const points = 50;
    const maxDist = 25;
    const labels = [];
    const dataJamUp = [];
    const dataDirUp = [];
    const dataRelayUp = [];
    const dataJamDown = [];
    const dataDirDown = [];
    const dataRelayDown = [];

    const dCtrl = ctrlDistKm * 1000;
    const linkLoss = calcPathLoss(dCtrl, activeBand.freq, 2.1);
    const linkRxUp = wattsToDbm(rcPower) + 4.3 - linkLoss;
    const linkRxDown = wattsToDbm(videoPower) + 4.3 - linkLoss;

    for (let i = 0; i <= points; i++) {
      const dKm = Math.max(0.1, (i / points) * maxDist);
      labels.push(dKm.toFixed(1));

      const distToJammerM = dKm * 1000;
      const slantDistM = Math.sqrt(distToJammerM ** 2 + altitudeM ** 2);

      // Uplink points
      const jamLossUp = calcPathLoss(slantDistM, activeBand.freq, envFactor);
      const jRxUp = wattsToDbm(activeBand.power) + activeBand.gain - jamLossUp;

      let rRxUp = -999;
      if (relayEnabled) {
        const rX = relayOffsetKm * 1000;
        const rY = relayMode === 'ground' ? 5 : (relayAltKm * 1000);
        const rZ = relayDepthKm * 1000;
        const relayEnvF = relayMode === 'ground' ? 2.5 : 2.0;
        const dRelay = Math.sqrt((rX - distToJammerM) ** 2 + (rY - altitudeM) ** 2 + (rZ - 0) ** 2);
        const rLoss = calcPathLoss(dRelay, activeBand.freq, relayEnvF);
        rRxUp = wattsToDbm(relayPower) + 4.3 - rLoss;
      }

      // Downlink points
      const distJammerToCtrlM = distToJammerM + dCtrl;
      const jamLossDown = calcPathLoss(distJammerToCtrlM, activeBand.freq, envFactor);
      const jRxDown = wattsToDbm(activeBand.power) + activeBand.gain - jamLossDown;

      let rRxDown = -999;
      if (relayEnabled) {
        const rX = relayOffsetKm * 1000;
        const cX = distToJammerM + dCtrl;
        const rY = relayMode === 'ground' ? 5 : (relayAltKm * 1000);
        const rZ = relayDepthKm * 1000;
        const relayEnvF = relayMode === 'ground' ? 2.5 : 2.0;
        const dRelay = Math.sqrt((rX - cX) ** 2 + rY ** 2 + (rZ - 0) ** 2);
        const rLoss = calcPathLoss(dRelay, activeBand.freq, relayEnvF);
        rRxDown = wattsToDbm(relayPower) + 4.3 - rLoss;
      }

      dataJamUp.push(jRxUp);
      dataDirUp.push(linkRxUp);
      if (relayEnabled) dataRelayUp.push(rRxUp);

      dataJamDown.push(jRxDown);
      dataDirDown.push(linkRxDown);
      if (relayEnabled) dataRelayDown.push(rRxDown);
    }

    const datasets = [
      { label: 'Jammer Rx @ Drone (dBm)', borderColor: '#ef4444', backgroundColor: '#ef4444', borderWidth: 2, pointRadius: 0, data: dataJamUp, tension: 0.4 },
      { label: 'Uplink Rx @ Drone (dBm)', borderColor: '#10b981', backgroundColor: '#10b981', borderWidth: 2, pointRadius: 0, data: dataDirUp, borderDash: [5, 5] },
      { label: 'Jammer Rx @ GCS (dBm)', borderColor: '#b91c1c', backgroundColor: '#b91c1c', borderWidth: 2, pointRadius: 0, data: dataJamDown, tension: 0.4 },
      { label: 'Downlink Rx @ GCS (dBm)', borderColor: '#0ea5e9', backgroundColor: '#0ea5e9', borderWidth: 2, pointRadius: 0, data: dataDirDown, borderDash: [5, 5] }
    ];

    if (relayEnabled) {
      datasets.push({ label: 'Relay Uplink Rx (dBm)', borderColor: '#f59e0b', backgroundColor: '#f59e0b', borderWidth: 2, pointRadius: 0, data: dataRelayUp, borderDash: [] });
      datasets.push({ label: 'Relay Downlink Rx (dBm)', borderColor: '#d97706', backgroundColor: '#d97706', borderWidth: 2, pointRadius: 0, data: dataRelayDown, borderDash: [] });
    }

    return { labels, datasets };
  }, [activeBand, envFactor, rcPower, videoPower, altitudeM, ctrlDistKm, relayEnabled, relayAltKm, relayOffsetKm, relayDepthKm, relayPower, relayMode]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)} dBm` } }
    },
    scales: {
      x: { title: { display: true, text: 'Distance from Jammer (km)', color: '#64748b' }, grid: { color: '#334155' } },
      y: { title: { display: true, text: 'Signal Power (dBm)', color: '#64748b' }, grid: { color: '#334155' }, min: -120, max: 0 }
    }
  };

  // Three.js
  const mountRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    scene.fog = new THREE.FogExp2(0x1e293b, 0.0006);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 200000);
    camera.position.set(800, 400, 800);
    camera.lookAt(0, 200, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(200, 300, 100);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(50000, 500, 0x64748b, 0x334155);
    scene.add(grid);

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(50000, 50000), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }));
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const tower = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 8), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    tower.position.y = 20;
    scene.add(tower);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 20), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    pole.position.y = 10;
    scene.add(pole);

    const domeMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5), domeMat);
    scene.add(dome);

    const rxGroup = new THREE.Group();
    const matRx = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const body = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 6), matRx);
    rxGroup.add(body);
    [45, -45].forEach(deg => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(18, 1, 1.5), matRx);
      arm.rotation.y = deg * Math.PI / 180;
      rxGroup.add(arm);
    });
    const props = [{ x: 6, z: 6 }, { x: -6, z: -6 }, { x: 6, z: -6 }, { x: -6, z: 6 }].map(p => {
      const prop = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 12), matDark);
      prop.position.set(p.x, 1.5, p.z);
      rxGroup.add(prop);
      return prop;
    });
    scene.add(rxGroup);

    const txTarget = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 8), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    scene.add(txTarget);
    const matTx = txTarget.material as THREE.MeshStandardMaterial;

    const relayGroup = new THREE.Group();
    const fixedWingGroup = new THREE.Group();
    const matRelay = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.2 });
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 25, 12), matRelay);
    fus.rotation.x = Math.PI / 2;
    fixedWingGroup.add(fus);
    const wings = new THREE.Mesh(new THREE.BoxGeometry(40, 0.5, 5), matRelay);
    wings.position.set(0, 1, -2);
    fixedWingGroup.add(wings);
    const tailV = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 4), matRelay);
    tailV.position.set(0, 3, -10);
    fixedWingGroup.add(tailV);
    const tailH = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 3), matRelay);
    tailH.position.set(0, 1, -10);
    fixedWingGroup.add(tailH);
    relayGroup.add(fixedWingGroup);

    const roverGroup = new THREE.Group();
    const roverBody = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 12), matRelay);
    roverBody.position.y = 2;
    roverGroup.add(roverBody);
    const matTyre = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    [{ x: 4.5, z: 4 }, { x: -4.5, z: 4 }, { x: 4.5, z: -4 }, { x: -4.5, z: -4 }].forEach(p => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1, 16), matTyre);
      w.rotation.z = Math.PI / 2;
      w.position.set(p.x, 2, p.z);
      roverGroup.add(w);
    });
    const roverAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5), matRelay);
    roverAntenna.position.set(0, 6, -3);
    roverGroup.add(roverAntenna);
    relayGroup.add(roverGroup);

    scene.add(relayGroup);

    // Lines
    const lineMatJamUp = new THREE.LineDashedMaterial({ color: 0xff0000, dashSize: 20, gapSize: 10, opacity: 0.8, transparent: true });
    const lineMatJamDown = new THREE.LineDashedMaterial({ color: 0xff0000, dashSize: 20, gapSize: 10, opacity: 0.8, transparent: true });
    const lineMatTx = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const lineMatRelayUp = new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 40, gapSize: 20, opacity: 0.5, transparent: true });
    const lineMatRelayDown = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
    const lineMatAlt = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.3 });

    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)];
    const lineJamUp = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMatJamUp);
    const lineJamDown = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMatJamDown);
    const lineTx = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMatTx);
    const lineRelayUp = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMatRelayUp);
    const lineRelayDown = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMatRelayDown);
    const lineAlt = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMatAlt);

    scene.add(lineJamUp);
    scene.add(lineJamDown);
    scene.add(lineTx);
    scene.add(lineRelayUp);
    scene.add(lineRelayDown);
    scene.add(lineAlt);

    let camState = { r: 800, theta: Math.PI / 4, phi: Math.PI / 3 };

    threeRef.current = { scene, camera, renderer, dome, rxGroup, txTarget, relayGroup, fixedWingGroup, roverGroup, matRx, matTx, props, lines: { lineJamUp, lineJamDown, lineTx, lineRelayUp, lineRelayDown, lineAlt }, camState };

    const animate = () => {
      requestAnimationFrame(animate);
      camera.position.x = camState.r * Math.sin(camState.phi) * Math.cos(camState.theta);
      camera.position.z = camState.r * Math.sin(camState.phi) * Math.sin(camState.theta);
      camera.position.y = camState.r * Math.cos(camState.phi);
      camera.lookAt(0, 200, 0);

      dome.material.opacity = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;
      props.forEach(p => p.rotation.y += 0.5);

      lineJamUp.computeLineDistances();
      lineJamDown.computeLineDistances();
      if (lineRelayUp.visible) lineRelayUp.computeLineDistances();

      renderer.render(scene, camera);
    };
    animate();

    let isDragging = false, lastMouse = { x: 0, y: 0 };
    const onDown = (e: any) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; };
    const onUp = () => isDragging = false;
    const onMove = (e: any) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      lastMouse = { x: e.clientX, y: e.clientY };
      camState.theta -= dx * 0.01;
      camState.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, camState.phi - dy * 0.01));
    };
    const onWheel = (e: any) => {
      e.preventDefault();
      camState.r = Math.max(50, Math.min(50000, camState.r + e.deltaY * 5));
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      canvasEl.removeEventListener('mousedown', onDown);
      canvasEl.removeEventListener('wheel', onWheel);
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Sync 3D scene
  useEffect(() => {
    if (!threeRef.current) return;
    const { dome, rxGroup, txTarget, relayGroup, fixedWingGroup, roverGroup, matRx, matTx, lines } = threeRef.current;
    const scale = 0.1;

    const rxX = targetDistKm * 1000 * scale;
    const rxY = altitudeM * scale;
    rxGroup.position.set(rxX, rxY, 0);

    const txSlantM = ctrlDistKm * 1000;
    let txGroundM = 0;
    if (txSlantM > altitudeM) txGroundM = Math.sqrt(txSlantM ** 2 - altitudeM ** 2);
    const txX = rxX + (txGroundM * scale);
    txTarget.position.set(txX, 5, 0);

    const actualRelayAltM = relayMode === 'ground' ? 5 : (relayAltKm * 1000);
    const relayX = relayOffsetKm * 1000 * scale;
    const relayY = actualRelayAltM * scale;
    const relayZ = relayDepthKm * 1000 * scale;
    relayGroup.position.set(relayX, relayY, relayZ);
    relayGroup.rotation.z = relayMode === 'ground' ? 0 : -Math.PI / 8;

    fixedWingGroup.visible = relayMode === 'fixed-wing';
    roverGroup.visible = relayMode === 'ground';

    relayGroup.visible = relayEnabled;
    lines.lineRelayUp.visible = relayEnabled;
    lines.lineRelayDown.visible = relayEnabled;

    lines.lineJamUp.geometry.setFromPoints([new THREE.Vector3(0, 20, 0), rxGroup.position]);
    lines.lineJamDown.geometry.setFromPoints([new THREE.Vector3(0, 20, 0), txTarget.position]);

    lines.lineTx.geometry.setFromPoints([txTarget.position, rxGroup.position]);
    lines.lineAlt.geometry.setFromPoints([rxGroup.position, new THREE.Vector3(rxX, 0, 0)]);
    if (relayEnabled) {
      lines.lineRelayUp.geometry.setFromPoints([txTarget.position, relayGroup.position]);
      lines.lineRelayDown.geometry.setFromPoints([relayGroup.position, rxGroup.position]);
    }

    const upStrongerRelay = relayEnabled && (calcData.up.relayRx > calcData.up.linkRx);
    const downStrongerRelay = relayEnabled && (calcData.down.relayRx > calcData.down.linkRx);

    // Apply Up status to Drone and Down status to Controller (GCS)
    if (calcData.up.sir < 0) {
      matRx.color.setHex(0xef4444);
      lines.lineJamUp.material.color.setHex(0xff0000); lines.lineJamUp.material.opacity = 1;
    } else if (calcData.up.sir < 5) {
      matRx.color.setHex(0xf59e0b);
      lines.lineJamUp.material.color.setHex(0xf59e0b); lines.lineJamUp.material.opacity = 0.5;
    } else {
      matRx.color.setHex(0x3b82f6);
      lines.lineJamUp.material.color.setHex(0xffaaaa); lines.lineJamUp.material.opacity = 0.1;
    }

    if (calcData.down.sir < 0) {
      matTx.color.setHex(0xef4444);
      lines.lineJamDown.material.color.setHex(0xff0000); lines.lineJamDown.material.opacity = 1;
    } else if (calcData.down.sir < 5) {
      matTx.color.setHex(0xf59e0b);
      lines.lineJamDown.material.color.setHex(0xf59e0b); lines.lineJamDown.material.opacity = 0.5;
    } else {
      matTx.color.setHex(0x10b981);
      lines.lineJamDown.material.color.setHex(0xffaaaa); lines.lineJamDown.material.opacity = 0.1;
    }

    if (upStrongerRelay || downStrongerRelay) {
      lines.lineRelayDown.material.color.setHex(0xf59e0b); lines.lineRelayDown.material.opacity = 1;
      lines.lineTx.material.color.setHex(0x105030); lines.lineTx.material.opacity = 0.2;
    } else {
      lines.lineTx.material.color.setHex(0x10b981); lines.lineTx.material.opacity = 1;
      lines.lineRelayDown.material.color.setHex(0x554000); lines.lineRelayDown.material.opacity = 0.3;
    }

    const targetPathLoss = wattsToDbm(activeBand.power) + activeBand.gain - (-60);
    const logD = (targetPathLoss - 20 * Math.log10(activeBand.freq) + 27.55) / (10 * envFactor);
    const r = Math.pow(10, logD) * scale;
    dome.scale.set(r, r, r);

  }, [targetDistKm, altitudeM, ctrlDistKm, activeBand, envFactor, relayEnabled, relayAltKm, relayOffsetKm, relayDepthKm, relayMode, calcData]);

  const handleBandChange = (id: number, field: string, val: any) => {
    setBands(bands.map(b => b.id === id ? { ...b, [field]: val } : b));
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans h-full flex flex-col md:flex-row overflow-hidden select-none">

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="flex flex-col items-center justify-center gap-4 text-cyan-400 mb-8">
              <Radio className="w-16 h-16 animate-pulse" />
              <h2 className="text-2xl font-bold uppercase tracking-widest animate-pulse text-center">Initializing Simulator</h2>
              <div className="text-slate-400 font-mono text-sm text-center">Loading Physics Engine & RF Environment...</div>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-cyan-500 transition-all duration-200 ease-out relative"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute top-0 bottom-0 right-0 w-8 bg-white/30 blur" />
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>{Math.round(loadingProgress)}%</span>
              <span>SYSTEM BOOT</span>
            </div>
          </div>
        </div>
      )}

      {showCalc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Calculator className="w-5 h-5" />
                <h2 className="text-lg font-bold uppercase tracking-wide">Detailed Calculation Validation</h2>
              </div>
              <button onClick={() => setShowCalc(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-sm space-y-6">
              <div className="mb-6">
                <h3 className="text-white font-bold border-b border-slate-700 pb-1 mb-2">1. Simulation Parameters</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p><span className="text-slate-400">Frequency:</span> {activeBand.freq} MHz</p>
                    <p><span className="text-slate-400">Jammer Power:</span> {activeBand.power} W ({calcData.jammerPowerDbm.toFixed(1)} dBm)</p>
                    <p><span className="text-slate-400">Jammer Gain:</span> {activeBand.gain} dBi</p>
                    <p><span className="text-slate-400">Env Factor (n):</span> {calcData.envFactor}</p>
                  </div>
                  <div>
                    <p><span className="text-slate-400">Up Tx (GCS):</span> {rcPower} W</p>
                    <p><span className="text-slate-400">Down Tx (Drone):</span> {videoPower} W</p>
                    <p><span className="text-slate-400">Target Altitude:</span> {altitudeM} m</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-red-900/10 p-3 rounded border border-red-900/30">
                <h3 className="text-red-400 font-bold mb-2">2. Interference Signal (Jammer)</h3>
                <p className="mb-1"><span className="text-slate-400">Path Up:</span> Jammer &rarr; Quadcopter ({calcData.up.dJammerPath.toFixed(1)} m)</p>
                <p className="font-bold mb-2">Up Rx Power = <span className="text-white">{calcData.up.jammerRx.toFixed(2)} dBm</span></p>
                <p className="mb-1"><span className="text-slate-400">Path Down:</span> Jammer &rarr; Controller ({calcData.down.dJammerPath.toFixed(1)} m)</p>
                <p className="font-bold">Down Rx Power = <span className="text-white">{calcData.down.jammerRx.toFixed(2)} dBm</span></p>
              </div>

              <div className="mb-6 bg-green-900/10 p-3 rounded border border-green-900/30">
                <h3 className="text-green-400 font-bold mb-2">3. Active Link (Direct)</h3>
                <p className="mb-1"><span className="text-slate-400">Distance (d):</span> {calcData.dCtrl.toFixed(1)} m</p>
                <p className="font-bold mb-2">Up Rx Power = <span className="text-white">{calcData.up.linkRx.toFixed(2)} dBm</span></p>
                <p className="font-bold">Down Rx Power = <span className="text-white">{calcData.down.linkRx.toFixed(2)} dBm</span></p>
              </div>

              {relayEnabled && (
                <div className="mb-6 bg-amber-900/10 p-3 rounded border border-amber-900/30">
                  <h3 className="text-amber-400 font-bold mb-2">4. Relay Path Check</h3>
                  <p className="mb-1"><span className="text-slate-400">Re-Tx Power:</span> {relayPower} W</p>
                  <p className="font-bold mb-2">Relay Up Rx Power = <span className="text-white">{calcData.up.relayRx.toFixed(2)} dBm</span></p>
                  <p className="font-bold">Relay Down Rx Power = <span className="text-white">{calcData.down.relayRx.toFixed(2)} dBm</span></p>
                </div>
              )}

              <div>
                <h3 className="text-white font-bold border-b border-slate-700 pb-1 mb-2">5. Final Validation (SIR)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-800 rounded text-center">
                    <div className="text-xs text-slate-400 mb-1">UPLINK</div>
                    <div className="text-2xl font-mono font-bold mb-2">
                      {(calcData.up.bestLinkRx || 0).toFixed(1)} - ({(calcData.up.jammerRx || 0).toFixed(1)}) = <br /><span className={calcData.up.sir < 0 ? 'text-red-500' : 'text-green-500'}>{(calcData.up.sir || 0).toFixed(1)} dB</span>
                    </div>
                    <div className="text-sm">Status: <span className="font-bold">{calcData.up.status || 'N/A'}</span></div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded text-center">
                    <div className="text-xs text-slate-400 mb-1">DOWNLINK</div>
                    <div className="text-2xl font-mono font-bold mb-2">
                      {(calcData.down.bestLinkRx || 0).toFixed(1)} - ({(calcData.down.jammerRx || 0).toFixed(1)}) = <br /><span className={calcData.down.sir < 0 ? 'text-red-500' : 'text-green-500'}>{(calcData.down.sir || 0).toFixed(1)} dB</span>
                    </div>
                    <div className="text-sm">Status: <span className="font-bold">{calcData.down.status || 'N/A'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full md:w-[420px] flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col h-full overflow-y-auto z-20">
        <div className="p-6 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded"><MapIcon className="w-8 h-8 text-slate-800" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-wider uppercase text-white">Penetrate the RF jammer domain</h1>
              <div className="text-[10px] text-slate-400 font-mono">SPEC: 8-Band 50W/100W IP66</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <MapIcon className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase">Environment Analysis</h3>
            </div>
            <label className="text-xs text-slate-400 block mb-1">Deployment Scenario</label>
            <select value={envFactor} onChange={e => setEnvFactor(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white outline-none focus:border-cyan-500">
              <option value="2.0">Free Space / Ideal (Vendor Spec)</option>
              <option value="2.5">Suburban (Trees/Houses)</option>
              <option value="3.0">Urban (Buildings/Clutter)</option>
              <option value="3.5">Dense Urban (High Rise)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <Settings className="w-4 h-4" />
              <h2 className="font-bold uppercase text-xs tracking-wide">Band Configuration</h2>
            </div>
            <div className="space-y-2">
              {bands.map(b => (
                <div key={b.id} onClick={() => setActiveBandId(b.id)} className={`relative p-3 rounded border transition-all cursor-pointer ${b.id === activeBandId ? 'bg-slate-700 border-red-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'}`}>
                  <div className="pl-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        {b.id === activeBandId && <Crosshair className="w-3 h-3 text-red-400" />} {b.name} ({b.freq}MHz)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 mb-1">Power (W)</div>
                        <select value={b.power} onChange={e => handleBandChange(b.id, 'power', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded px-1 py-1 text-[10px] text-white">
                          <option value={10}>10 W</option>
                          <option value={50}>50 W</option>
                          <option value={100}>100 W</option>
                          <option value={150}>150 W</option>
                          <option value={200}>200 W</option>
                          <option value={300}>300 W</option>
                        </select>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 mb-1">Gain: {b.gain} dBi</div>
                        <input type="range" min="0" max="20" step="1" value={b.gain} onChange={e => handleBandChange(b.id, 'gain', Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-slate-400 mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <ShieldAlert className="w-4 h-4" />
              <h2 className="font-bold uppercase text-xs tracking-wide">Target Simulation</h2>
            </div>
            <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-500/20 space-y-4">
              <div>
                <div className="flex justify-between mb-1"><label className="text-xs font-medium text-slate-300">Quadcopter Distance</label><span className="text-white font-mono text-xs">{targetDistKm.toFixed(2)} km</span></div>
                <input type="range" min="0.1" max="10.0" step="0.1" value={targetDistKm} onChange={e => setTargetDistKm(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-slate-400" />
              </div>
              <div>
                <div className="flex justify-between mb-1"><label className="text-xs font-medium text-slate-300">Altitude</label><span className="text-white font-mono text-xs">{altitudeM} m</span></div>
                <input type="range" min="10" max="2000" step="10" value={altitudeM} onChange={e => setAltitudeM(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-cyan-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1"><label className="text-xs font-medium text-slate-300">Controller Distance (Tx)</label><span className="text-white font-mono text-xs">{ctrlDistKm.toFixed(1)} km</span></div>
                <input type="range" min="0.1" max="25.0" step="0.1" value={ctrlDistKm} onChange={e => setCtrlDistKm(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg accent-green-500" />
              </div>

              <div className="bg-slate-900/50 p-2 rounded border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Satellite className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase">Signal Relay</span>
                  </div>
                  <button onClick={() => setRelayEnabled(!relayEnabled)} className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold transition-colors ${relayEnabled ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                    {relayEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                {relayEnabled && (
                  <div className="space-y-2 mt-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Relay Type</span>
                      </div>
                      <select value={relayMode} onChange={e => setRelayMode(e.target.value as 'fixed-wing' | 'ground')} className="w-full bg-slate-800 border-slate-600 rounded p-1 text-xs text-white">
                        <option value="fixed-wing">Fixed Wing (High Altitude)</option>
                        <option value="ground">Ground Node (5m Altitude)</option>
                      </select>
                    </div>
                    {relayMode === 'fixed-wing' && (
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Altitude</span><span className="text-white font-mono">{relayAltKm.toFixed(1)} km</span>
                        </div>
                        <input type="range" min="4.0" max="9.0" step="0.1" value={relayAltKm} onChange={e => setRelayAltKm(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-amber-500" />
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Offset from Jammer (X)</span><span className="text-white font-mono">{relayOffsetKm.toFixed(1)} km</span>
                      </div>
                      <input type="range" min="0.0" max="10.0" step="0.5" value={relayOffsetKm} onChange={e => setRelayOffsetKm(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-amber-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Depth from Jammer (Z)</span><span className="text-white font-mono">{relayDepthKm.toFixed(1)} km</span>
                      </div>
                      <input type="range" min="-10.0" max="10.0" step="0.5" value={relayDepthKm} onChange={e => setRelayDepthKm(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-amber-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Relay Power</span><span className="text-white font-mono">{relayPower.toFixed(1)} W</span>
                      </div>
                      <input type="range" min="1.0" max="50.0" step="1.0" value={relayPower} onChange={e => setRelayPower(Number(e.target.value))} className="w-full h-1 bg-slate-600 rounded accent-amber-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Hardware Configuration */}
              <div className="border-t border-slate-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Settings className="w-4 h-4" />
                    <h2 className="font-bold uppercase text-xs tracking-wide">Hardware Configuration</h2>
                  </div>
                  <button
                    onClick={() => setShowBom(!showBom)}
                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors border ${showBom ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-purple-500 hover:text-purple-300'
                      }`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    BOM ${bomTotal.toLocaleString()}
                  </button>
                </div>

                <div className="space-y-3">

                  {/* GCS */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                      <Monitor className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Ground Control Station (GCS)</span>
                    </div>
                    <select
                      value={selectedGcs}
                      onChange={e => setSelectedGcs(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white outline-none focus:border-green-500 mb-2"
                    >
                      {GCS_OPTIONS.map(o => (
                        <option key={o.id} value={o.id}>{o.name} — ${o.price}</option>
                      ))}
                    </select>
                    {gcsHw && (
                      <div className="flex flex-wrap gap-2 text-[9px]">
                        <span className="bg-green-900/40 text-green-300 px-2 py-0.5 rounded border border-green-800">TX: {gcsHw.txPowerW}W</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">Range: {gcsHw.rangeKm}km</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">{gcsHw.freqMhz}MHz</span>
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-600 w-full text-[9px]">{gcsHw.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Air Unit */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                      <Cpu className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Air Unit (Video TX)</span>
                    </div>
                    <select
                      value={selectedAirUnit}
                      onChange={e => setSelectedAirUnit(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white outline-none focus:border-blue-500 mb-2"
                    >
                      {AIR_UNIT_OPTIONS.map(o => (
                        <option key={o.id} value={o.id}>{o.name} — ${o.price}</option>
                      ))}
                    </select>
                    {airHw && (
                      <div className="flex flex-wrap gap-2 text-[9px]">
                        <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800">TX: {airHw.txPowerW}W</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">Range: {airHw.rangeKm}km</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">{airHw.freqMhz}MHz</span>
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-600 w-full text-[9px]">{airHw.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Telemetry */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-amber-400">
                      <Radio className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Telemetry TX/RX Link</span>
                    </div>
                    <select
                      value={selectedTelemetry}
                      onChange={e => setSelectedTelemetry(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white outline-none focus:border-amber-500 mb-2"
                    >
                      {TELEMETRY_OPTIONS.map(o => (
                        <option key={o.id} value={o.id}>{o.name} — ${o.price}</option>
                      ))}
                    </select>
                    {telHw && (
                      <div className="flex flex-wrap gap-2 text-[9px]">
                        <span className="bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded border border-amber-800">TX: {telHw.txPowerW}W</span>
                        {telHw.rxSensDbm && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">Sens: {telHw.rxSensDbm}dBm</span>}
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">Range: {telHw.rangeKm}km</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">{telHw.freqMhz}MHz</span>
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-600 w-full text-[9px]">{telHw.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Video Link */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                      <Video className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Video Downlink System</span>
                    </div>
                    <select
                      value={selectedVideoLink}
                      onChange={e => setSelectedVideoLink(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-xs text-white outline-none focus:border-cyan-500 mb-2"
                    >
                      {VIDEO_LINK_OPTIONS.map(o => (
                        <option key={o.id} value={o.id}>{o.name} — ${o.price}</option>
                      ))}
                    </select>
                    {vidHw && (
                      <div className="flex flex-wrap gap-2 text-[9px]">
                        <span className="bg-cyan-900/40 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">TX: {vidHw.txPowerW}W</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">Range: {vidHw.rangeKm}km</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-600">{vidHw.freqMhz}MHz</span>
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-600 w-full text-[9px]">{vidHw.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Active signal summary */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded border bg-green-900/30 border-green-500">
                      <div className="text-[10px] text-slate-300 mb-1 flex items-center gap-1"><Radio className="w-3 h-3" /> GCS RC TX (Up)</div>
                      <div className="text-white font-mono text-xs font-bold">{rcPower.toFixed(2)} W</div>
                      <div className="text-slate-500 text-[9px]">{gcsHw?.name?.split(' ')[0]} {gcsHw?.name?.split(' ')[1]}</div>
                    </div>
                    <div className="p-2 rounded border bg-blue-900/30 border-blue-500">
                      <div className="text-[10px] text-slate-300 mb-1 flex items-center gap-1"><Video className="w-3 h-3" /> Air Unit TX (Down)</div>
                      <div className="text-white font-mono text-xs font-bold">{videoPower.toFixed(2)} W</div>
                      <div className="text-slate-500 text-[9px]">{airHw?.name?.split(' ')[0]} {airHw?.name?.split(' ')[1]}</div>
                    </div>
                  </div>

                  {/* BOM Breakdown */}
                  {showBom && (
                    <div className="bg-purple-900/10 border border-purple-800/40 rounded-lg p-3">
                      <h4 className="text-purple-400 font-bold text-[10px] uppercase mb-2 flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> Bill of Materials</h4>
                      <div className="space-y-1 text-[10px]">
                        {[
                          { label: 'GCS', hw: gcsHw },
                          { label: 'Air Unit', hw: airHw },
                          { label: 'Telemetry', hw: telHw },
                          { label: 'Video Link', hw: vidHw },
                        ].map(({ label, hw }) => (
                          <div key={label} className="flex justify-between items-center py-0.5 border-b border-slate-800">
                            <span className="text-slate-400">{label}</span>
                            <span className="text-slate-300 font-mono text-[9px] max-w-[140px] truncate text-right">{hw?.name}</span>
                            <span className="text-white font-bold ml-2">${hw?.price.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-purple-400 font-bold">Total (Comms Only)</span>
                          <span className="text-purple-300 font-mono font-bold text-sm">${bomTotal.toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateBOM}
                        disabled={isGeneratingBOM}
                        className="mt-3 w-full py-2 px-3 rounded-md font-bold text-xs flex items-center justify-center transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50"
                      >
                        {isGeneratingBOM ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding to Cart...</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4 mr-2" /> Add Configuration to Cart</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 h-screen overflow-hidden flex flex-col relative">
        <div ref={mountRef} className="flex-1 relative w-full h-full cursor-move z-0">
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row gap-4 justify-between pointer-events-none">
            <div className="flex gap-4 pointer-events-auto">
              {/* Uplink Status */}
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl min-w-[140px]">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">UPLINK (GCS &rarr; Drone)</div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${calcData.up.status === 'ESTABLISHED' ? 'bg-green-500' : calcData.up.status === 'UNSTABLE' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  <span className={`text-sm font-bold ${calcData.up.status === 'ESTABLISHED' ? 'text-green-100' : 'text-red-100'}`}>{calcData.up.status}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-300">SIR: {calcData.up.sir.toFixed(1)} dB</div>
                {relayEnabled && calcData.up.relayRx > calcData.up.linkRx && (
                  <div className="text-[9px] text-amber-500 flex items-center gap-1 mt-1 font-bold"><Satellite className="w-3 h-3" /> Relay</div>
                )}
              </div>

              {/* Downlink Status */}
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl min-w-[140px]">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">DOWNLINK (Drone &rarr; GCS)</div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${calcData.down.status === 'ESTABLISHED' ? 'bg-green-500' : calcData.down.status === 'UNSTABLE' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  <span className={`text-sm font-bold ${calcData.down.status === 'ESTABLISHED' ? 'text-green-100' : 'text-red-100'}`}>{calcData.down.status}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-300">SIR: {calcData.down.sir.toFixed(1)} dB</div>
                {relayEnabled && calcData.down.relayRx > calcData.down.linkRx && (
                  <div className="text-[9px] text-amber-500 flex items-center gap-1 mt-1 font-bold"><Satellite className="w-3 h-3" /> Relay</div>
                )}
              </div>

              <button onClick={() => setShowCalc(true)} className="self-start bg-slate-700 hover:bg-slate-600 text-cyan-400 px-3 py-2 rounded text-xs uppercase font-bold border border-cyan-500/30 flex items-center gap-2 shadow-xl">
                <FileSpreadsheet className="w-4 h-4" /> Calc
              </button>
            </div>
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">System Status</div>
              <div className="text-xl font-mono font-bold text-white">{calcData.status}</div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
            <div className="flex flex-col gap-2 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-lg">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 opacity-50"></span><span className="text-[10px] text-slate-300">Jamming Zone (-60dBm)</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-green-500"></span><span className="text-[10px] text-slate-300">Direct Link</span></div>
              {relayEnabled && (
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-amber-500"></span><span className="text-[10px] text-slate-300">Relay Node</span></div>
              )}
            </div>
          </div>
        </div>

        <div className="h-1/3 min-h-[250px] bg-slate-900 border-t border-slate-700 p-4 relative z-30 flex flex-col">
          <div className="flex items-center justify-between mb-1 text-cyan-400 flex-shrink-0">
            <div className="flex items-center gap-2"><Activity className="w-4 h-4" /><h3 className="font-bold uppercase text-xs tracking-wide">Physics Graph</h3></div>
            <button onClick={() => setShowPhysicsHelp(!showPhysicsHelp)} className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"><HelpCircle className="w-3 h-3" /> Info</button>
          </div>
          {showPhysicsHelp && (
            <div className="absolute top-10 left-4 right-4 bg-slate-800 p-4 rounded text-xs text-slate-300 border-l-2 border-cyan-500 z-40 shadow-xl">
              <h4 className="font-bold text-white mb-2">Thresholds</h4>
              <p className="mb-2">Receiver needs <strong>Good Signal</strong> &gt; <strong>Interference</strong> + 5dB.</p>
            </div>
          )}
          <div className="flex-1 w-full relative">
            <Line data={chartData} options={chartOptions as any} />
          </div>
        </div>
      </div>

      {/* Simulator Interlinking Section removed because of central router ScenarioPlanner */}
    </div>
  );
}
