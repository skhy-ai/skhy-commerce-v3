import { HWOption } from '../../types/simulators/transmission';

export const GCS_OPTIONS: HWOption[] = [
    { id: 'siyi_mk15', name: 'SIYI MK15 Mini (~15 km)', price: 849, txPowerW: 1.0, rangeKm: 15, freqMhz: 2400, note: '5.5" HD, 1080p@60fps, IP53', imageUrl: 'https://ae01.alicdn.com/kf/S7e0f2b311fc94b9f8f4112e4d02ff85fW.jpg' },
    { id: 'herelink_1_1', name: 'Herelink 1.1 (~20 km)', price: 1099, txPowerW: 1.0, rangeKm: 20, freqMhz: 2400, note: '5.46" 1080p, ArduPilot/PX4', imageUrl: 'https://ae01.alicdn.com/kf/Sc1f2e3d4a5b6c7d8e9f0a1b2.jpg' },
    { id: 'skydroid_h16pro', name: 'Skydroid H16 Pro (~30 km)', price: 1599, txPowerW: 2.0, rangeKm: 30, freqMhz: 2400, note: '7" display, 20000mAh, IP67', imageUrl: 'https://ae01.alicdn.com/kf/S7e0f2b311fc94b9f8f4112e4d02ff85fW.jpg' },
    { id: 'siyi_mk32', name: 'SIYI MK32 Enterprise (~30 km)', price: 2199, txPowerW: 2.0, rangeKm: 30, freqMhz: 2400, note: '7" 1080p, dual operators', imageUrl: 'https://ae01.alicdn.com/kf/Sd2e3f4a5b6c7d8e9.jpg' },
    { id: 'flyspark_fiber', name: 'FlySpark Opticallink (Fiber)', price: 3500, txPowerW: 0.0, rangeKm: 30, freqMhz: 0, note: 'Immune to RF Jamming, Zero Emission', imageUrl: 'https://flyspark.in/wp-content/uploads/2023/01/Opticallink-GBD.jpg' },
    { id: 'xfiber_gcu', name: 'X-Fiber GCU (Modular)', price: 4200, txPowerW: 0.0, rangeKm: 50, freqMhz: 0, note: 'LC Optical Fiber, TBS Interface', imageUrl: 'https://xflight-fpv.com/uploads/product/xfiber.jpg' },
];

export const AIR_UNIT_OPTIONS: HWOption[] = [
    { id: 'dji_o3', name: 'DJI O3 Air Unit', price: 229, txPowerW: 0.28, rangeKm: 10, freqMhz: 5800, note: '1080p/100fps, 30ms latency, 4K record' },
    { id: 'siyi_zr10_air', name: 'SIYI ZR10 Air Unit', price: 650, txPowerW: 1.0, rangeKm: 15, freqMhz: 2400, note: '4K, 10x optical zoom, gimbal' },
    { id: 'ideaforge_switch_air', name: 'ideaForge Switch Payload', price: 5000, txPowerW: 2.0, rangeKm: 15, freqMhz: 2400, note: 'Long Range Surveillance' },
    { id: 'asteria_a400_link', name: 'Asteria A400 Data Link', price: 3200, txPowerW: 1.5, rangeKm: 5, freqMhz: 2400, note: 'AES-128 Encrypted' },
];

export const TELEMETRY_OPTIONS: HWOption[] = [
    { id: 'rfd900x', name: 'RFD900x (868/915 MHz)', price: 280, txPowerW: 1.0, rxSensDbm: -121, rangeKm: 40, freqMhz: 915, note: '40 km range, FHSS, 250kbps' },
    { id: 'acasom_20w', name: 'ACASOM 20W GaN Amp', price: 850, txPowerW: 20.0, rxSensDbm: -110, rangeKm: 150, freqMhz: 2400, note: 'High Power Industrial' },
    { id: 'silvus_streamcaster', name: 'Silvus StreamCaster 4200', price: 15000, txPowerW: 4.0, rxSensDbm: -105, rangeKm: 100, freqMhz: 1400, note: 'MANET Mesh, 100 Mbps' },
];

export const VIDEO_LINK_OPTIONS: HWOption[] = [
    { id: 'dji_o3_video', name: 'DJI O3+ Digital Link', price: 229, txPowerW: 0.28, rangeKm: 10, freqMhz: 5800, note: '1080p/100fps, 30ms, video+RC' },
    { id: 'siyi_mk15_video', name: 'SIYI MK15 Video Link', price: 440, txPowerW: 1.0, rangeKm: 15, freqMhz: 2400, note: '1080p/60fps, 180ms, integrated' },
    { id: 'skydroid_h16_video', name: 'Skydroid H16 Video Link', price: 699, txPowerW: 1.0, rangeKm: 10, freqMhz: 2400, note: '1080p, 7" display, IP67' },
    { id: 'connex_prosight', name: 'Amimon Connex ProSight', price: 999, txPowerW: 0.5, rangeKm: 2, freqMhz: 5200, note: 'Zero-latency (<1ms), 1080p/60fps' },
    { id: 'herelink_video', name: 'Herelink Video Downlink', price: 199, txPowerW: 1.0, rangeKm: 20, freqMhz: 2400, note: '720p/1080p, 110ms, HDMI out' },
    { id: 'analog_5g', name: 'Analog 5.8 GHz 600mW', price: 35, txPowerW: 0.6, rangeKm: 2, freqMhz: 5800, note: 'Sub-1ms latency, budget option' },
    { id: 'dji_o4_pro', name: 'DJI O4 Pro Digital Link', price: 999, txPowerW: 2.0, rangeKm: 20, freqMhz: 5800, note: '4K/60fps, 24ms, 20km range' },
];
