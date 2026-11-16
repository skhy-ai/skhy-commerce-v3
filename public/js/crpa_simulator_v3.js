SKHY_UTILS.injectLoadingOverlay("Initializing Simulator", "Loading DSP Models...");
SKHY_UTILS.startLoading(() => {
    console.log("CRPA Simulator Ready");
}, 1.5);

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

// --- Model Definition ---
const models = {
    'AJGPS301': { name: 'Skhy AJGPS 301', channels: 4, url: 'https://www.skhy.com/ajgps301' },
    'AJGPS302': { name: 'Skhy AJGPS 302', channels: 4, url: 'https://www.skhy.com/ajgps302' },
    'AJGPS303': { name: 'Skhy AJGPS 303', channels: 4, url: 'https://www.skhy.com/ajgps303' },
    'AJGPS601': { name: 'Skhy AJGPS 601', channels: 8, url: 'https://www.skhy.com/ajgps601' },
    'AJGPS602': { name: 'Skhy AJGPS 602', channels: 8, url: 'https://www.skhy.com/ajgps602' }
};

// --- System Configuration ---
let systemType = 8; // 8 or 4
let isNullingOn = false;

// Band State
const bandState = {
    gps: { active: true, bands: ['L1'], color: '#10b981', angle: Math.PI / 4 },
    glo: { active: false, bands: [], color: '#d946ef', angle: Math.PI * 0.75 },
    gal: { active: false, bands: [], color: '#3b82f6', angle: -Math.PI / 6 }
};

// Performance Specs (dB tolerances)
const specs = {
    ch1: 105,
    ch3: 90,
    ch6: 80
};

// Jammers State (Up to 7 for 8-ch system)
const MAX_JAMMERS = 7;
const jammers = [];
const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#06b6d4'];

// Initialize Jammers
for (let i = 0; i < MAX_JAMMERS; i++) {
    jammers.push({
        id: i,
        active: false,
        angle: Math.PI + (i * 0.5),
        target: Math.PI + (i * 0.5),
        color: colors[i]
    });
}

let width, height;

// --- DOM Elements ---
const ui = {
    grid: document.getElementById('jammerGrid'),
    btnNulling: document.getElementById('toggleNulling'),
    stateText: document.getElementById('systemStateText'),
    gpsBar: document.getElementById('gpsBar'),
    gpsVal: document.getElementById('gpsSnrVal'),
    jamBar: document.getElementById('jamBar'),
    jamVal: document.getElementById('jamBarVal'),
    readoutModel: document.getElementById('readoutModel'),
    readoutElements: document.getElementById('readoutElements'),
    readoutBands: document.getElementById('readoutBands'),
    readoutNulls: document.getElementById('readoutNulls'),
    slider1: document.getElementById('slider1ch'),
    slider3: document.getElementById('slider3ch'),
    slider6: document.getElementById('slider6ch'),
    val1: document.getElementById('val1ch'),
    val3: document.getElementById('val3ch'),
    val6: document.getElementById('val6ch'),
    warn6: document.getElementById('warn6ch'),
    label6: document.getElementById('label6ch'),
    modelSelect: document.getElementById('modelSelect'),
    modelUrl: document.getElementById('modelUrl')
};

// --- Initialization ---

function init() {
    // Populate Dropdown
    for (const [key, data] of Object.entries(models)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = data.name;
        // Default select AJGPS601 (as originally 8ch was default)
        if (key === 'AJGPS601') opt.selected = true;
        ui.modelSelect.appendChild(opt);
    }

    // Attach Event Listener
    ui.modelSelect.addEventListener('change', (e) => {
        selectModel(e.target.value);
    });

    // Initialize Jammers Buttons
    ui.grid.innerHTML = '';
    jammers.forEach((j, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn jammer-btn btn-gray';
        btn.innerText = `J${i + 1}`;
        btn.onclick = () => toggleJammer(i);
        btn.id = `btn-j-${i}`;
        ui.grid.appendChild(btn);
    });

    // Set initial state
    selectModel('AJGPS601');
}

function selectModel(modelKey) {
    const m = models[modelKey];
    if (!m) return;

    // Notify Parent React App of change
    const productIds = {
        'AJGPS602': 900015,
        'AJGPS601': 900014,
        'AJGPS303': 900013,
        'AJGPS302': 900013,
        'AJGPS301': 900013
    };
    SKHY_UTILS.notifyParentSelection('anti-gps', productIds[modelKey] || 900014, m.name);

    // Update URL
    ui.modelUrl.href = m.url;

    // Update Readout Name
    ui.readoutModel.innerText = m.name;

    // Configure System Logic (4ch vs 8ch)
    setSystem(m.channels);
}

function toggleBand(sys, band, el) {
    const sysObj = bandState[sys];
    const idx = sysObj.bands.indexOf(band);

    if (idx > -1) {
        sysObj.bands.splice(idx, 1);
        el.classList.remove('active');
    } else {
        sysObj.bands.push(band);
        el.classList.add('active');
    }

    sysObj.active = sysObj.bands.length > 0;
    updateReadout();
}

function setSystem(channels) {
    systemType = channels;
    if (channels === 8) {
        ui.readoutElements.innerText = "8 Elements";
        ui.slider6.disabled = false;
        ui.warn6.classList.add('hidden');
        ui.label6.style.opacity = '1';
    } else {
        ui.readoutElements.innerText = "4 Elements";
        ui.slider6.disabled = true;
        ui.warn6.classList.remove('hidden');
        ui.label6.style.opacity = '0.5';
    }
    updateUI();
}

function updateSpecs() {
    specs.ch1 = parseInt(ui.slider1.value);
    specs.ch3 = parseInt(ui.slider3.value);
    specs.ch6 = parseInt(ui.slider6.value);

    ui.val1.innerText = specs.ch1 + " dB";
    ui.val3.innerText = specs.ch3 + " dB";
    ui.val6.innerText = specs.ch6 + " dB";
}

function toggleJammer(idx) {
    jammers[idx].active = !jammers[idx].active;
    updateUI();
}

ui.btnNulling.onclick = () => {
    isNullingOn = !isNullingOn;
    updateUI();
};

function updateReadout() {
    // Collect all active bands
    let activeStr = [];
    if (bandState.gps.active) activeStr.push("GPS");
    if (bandState.glo.active) activeStr.push("GLO");
    if (bandState.gal.active) activeStr.push("GAL");

    if (activeStr.length === 0) {
        ui.readoutBands.innerText = "None";
        ui.readoutBands.className = "text-red-400";
    } else {
        ui.readoutBands.innerText = activeStr.join(', ');
        ui.readoutBands.className = "text-white";
    }
}

function updateUI() {
    const activeCount = jammers.filter(j => j.active).length;
    ui.readoutNulls.innerText = isNullingOn ? activeCount : "0";

    // Update Jammer Buttons
    jammers.forEach((j, i) => {
        const btn = document.getElementById(`btn-j-${i}`);
        if (j.active) {
            btn.className = "btn jammer-btn active";
            btn.style.backgroundColor = j.color;
            btn.style.borderColor = j.color;
        } else {
            btn.className = "btn jammer-btn btn-gray";
            btn.style.backgroundColor = "";
            btn.style.borderColor = "";
        }
    });

    // Update Nulling Button
    if (activeCount > 0) {
        ui.btnNulling.disabled = false;
        ui.btnNulling.classList.remove('opacity-50', 'cursor-not-allowed');
        if (isNullingOn) {
            ui.btnNulling.textContent = "Deactivate Null-Steering";
            ui.btnNulling.className = "btn btn-green";
        } else {
            ui.btnNulling.textContent = "Activate Null-Steering";
            ui.btnNulling.className = "btn btn-blue";
        }
    } else {
        ui.btnNulling.disabled = true;
        ui.btnNulling.classList.add('opacity-50', 'cursor-not-allowed');
        isNullingOn = false;
        ui.btnNulling.textContent = "Activate Null-Steering";
        ui.btnNulling.className = "btn btn-blue opacity-50 cursor-not-allowed";
    }

    const maxDofs = (systemType === 8) ? 7 : 3;
    const systemOverloaded = activeCount > maxDofs;

    // Status Text
    if (activeCount === 0) {
        ui.stateText.textContent = "NOMINAL";
        ui.stateText.className = "text-green-400 font-bold tracking-widest";
    } else if (!isNullingOn) {
        ui.stateText.textContent = "JAMMING DETECTED";
        ui.stateText.className = "text-red-500 font-bold blink tracking-widest";
    } else if (systemOverloaded) {
        ui.stateText.textContent = "SATURATION (LIMIT EXCEEDED)";
        ui.stateText.className = "text-orange-500 font-bold blink tracking-widest";
    } else {
        ui.stateText.textContent = `MITIGATED (${activeCount} NULLS)`;
        ui.stateText.className = "text-cyan-400 font-bold tracking-widest";
    }
}

// --- Simulation Logic ---

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);

canvas.addEventListener('mousemove', (e) => {
    const activeJammers = jammers.filter(j => j.active);
    if (activeJammers.length === 0) return;

    const dx = e.clientX - width / 2;
    const dy = e.clientY - height / 2;
    const mouseAngle = Math.atan2(dy, dx);

    let closestJammer = null;
    let minDiff = Infinity;

    activeJammers.forEach(jammer => {
        let diff = Math.abs(mouseAngle - jammer.angle);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        if (diff < minDiff) {
            minDiff = diff;
            closestJammer = jammer;
        }
    });

    if (closestJammer && minDiff < 1.0) {
        closestJammer.target = mouseAngle;
    }
});

// --- Rendering ---

function drawAntenna(x, y, size) {
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawArray(cx, cy, radius) {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    const elementCount = (systemType === 8) ? 7 : 3;
    for (let i = 0; i < elementCount; i++) {
        const angle = (i / elementCount) * Math.PI * 2 - (Math.PI / 2);
        const ax = cx + Math.cos(angle) * radius;
        const ay = cy + Math.sin(angle) * radius;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        drawAntenna(ax, ay, 5);
    }
    drawAntenna(cx, cy, 5);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    // Dynamic Label based on channel count
    ctx.fillText((systemType === 8 ? "8-EL CRPA" : "4-EL CRPA"), cx, cy + radius * 2);
}

function drawPattern(cx, cy, scale) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';

    const activeJammers = jammers.filter(j => j.active);
    const maxDofs = (systemType === 8) ? 7 : 3;
    const overloaded = activeJammers.length > maxDofs;

    for (let a = 0; a <= Math.PI * 2; a += 0.05) {
        let gain = 1.0;
        if (isNullingOn && activeJammers.length > 0) {
            if (overloaded) {
                gain = 0.8 + Math.random() * 0.2;
            } else {
                for (let j of activeJammers) {
                    let diff = Math.abs(a - j.angle);
                    if (diff > Math.PI) diff = (2 * Math.PI) - diff;
                    const nullWidth = 0.2;
                    const suppression = Math.exp(-(diff * diff) / (2 * nullWidth * nullWidth));
                    gain *= (1.0 - (suppression * 0.96));
                }
            }
        }
        const r = scale * gain;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawWave(startX, startY, endX, endY, color, speed, intensity) {
    const dist = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const angle = Math.atan2(endY - startY, endX - startX);
    const time = Date.now() / 1000 * speed;

    ctx.fillStyle = color;
    for (let i = 0; i < intensity; i++) {
        const offset = (i / intensity + time) % 1;
        if (offset > 1) continue;
        const px = startX + Math.cos(angle) * (dist * offset);
        const py = startY + Math.sin(angle) * (dist * offset);
        ctx.globalAlpha = 1 - offset;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function drawSystemBlocks(cx, cy) {
    const bx = cx + 240;
    const by = cy;
    const activeCount = jammers.filter(j => j.active).length;

    ctx.strokeStyle = '#475569';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx + 60, cy);
    ctx.lineTo(bx - 50, by);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = isNullingOn ? '#22d3ee' : '#64748b';
    ctx.lineWidth = 2;
    ctx.fillRect(bx - 50, by - 50, 100, 100);
    ctx.strokeRect(bx - 50, by - 50, 100, 100);

    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("AJ PROCESSOR", bx, by - 25);

    if (isNullingOn && activeCount > 0) {
        const maxDofs = (systemType === 8) ? 7 : 3;
        if (activeCount > maxDofs) {
            ctx.fillStyle = '#f97316';
            ctx.fillText("OVERLOAD", bx, by + 5);
        } else {
            ctx.fillStyle = '#22d3ee';
            ctx.fillText("NULLING ON", bx, by + 5);
        }
    } else {
        ctx.fillStyle = '#64748b';
        ctx.fillText("BYPASS", bx, by + 5);
    }

    ctx.beginPath();
    ctx.moveTo(bx + 50, by);
    ctx.lineTo(bx + 140, by);
    let outColor = '#10b981';
    const maxDofs = (systemType === 8) ? 7 : 3;
    if (activeCount > 0 && (!isNullingOn || activeCount > maxDofs)) {
        outColor = '#ef4444';
    }

    // If no satellites active, output is grey
    if (!bandState.gps.active && !bandState.glo.active && !bandState.gal.active) {
        outColor = '#475569';
    }

    ctx.strokeStyle = outColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText("GNSS RCVR", bx + 145, by + 4);
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2 - 80;
    const cy = height / 2;
    const satDist = 350;

    jammers.forEach(j => {
        let diff = j.target - j.angle;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        j.angle += diff * 0.1;
    });

    drawPattern(cx, cy, 160);
    drawArray(cx, cy, 40);

    // Draw Active Satellites
    let totalSatellites = 0;

    // Helper to draw a specific sat constellation
    const drawSat = (sysName, config) => {
        if (!config.active) return;
        totalSatellites++;
        const sx = cx + Math.cos(config.angle) * satDist;
        const sy = cy - Math.sin(config.angle) * satDist; // Y flip

        ctx.fillStyle = config.color;
        ctx.fillRect(sx - 4, sy - 4, 8, 8);

        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sysName, sx, sy - 10);

        drawWave(sx, sy, cx, cy, config.color, 0.5, 4);
    };

    drawSat("GPS", bandState.gps);
    drawSat("GLONASS", bandState.glo);
    drawSat("Galileo", bandState.gal);

    // Draw Jammers
    const activeJammers = jammers.filter(j => j.active);
    activeJammers.forEach(j => {
        const jx = cx + Math.cos(j.angle) * satDist;
        const jy = cy + Math.sin(j.angle) * satDist;
        ctx.fillStyle = j.color;
        ctx.beginPath();
        ctx.moveTo(jx, jy - 8);
        ctx.lineTo(jx + 8, jy + 8);
        ctx.lineTo(jx - 8, jy + 8);
        ctx.fill();
        drawWave(jx, jy, cx, cy, j.color, 2.0, 10);
    });

    drawSystemBlocks(cx, cy);

    // Bars
    const count = activeJammers.length;
    const maxDofs = (systemType === 8) ? 7 : 3;

    let displaySuppression = 0;
    let signalQuality = 80;

    if (totalSatellites === 0) {
        signalQuality = 0;
        ui.gpsBar.className = "signal-bar bg-gray-600";
        ui.gpsVal.innerText = "No Signal";
    } else if (count > 0) {
        if (!isNullingOn) {
            signalQuality = 5;
            ui.jamBar.style.width = '100%';
            ui.jamVal.innerText = "0 dB (Exposure)";
            ui.gpsBar.className = "signal-bar bg-red-600";
        } else if (count > maxDofs) {
            signalQuality = 10;
            ui.jamBar.style.width = '90%';
            ui.jamVal.innerText = "~10 dB (Failed)";
            ui.gpsBar.className = "signal-bar bg-orange-500";
        } else {
            let specVal = specs.ch1;
            if (count >= 6) specVal = specs.ch6;
            else if (count >= 3) specVal = specs.ch3;
            else if (count > 1) {
                const ratio = (count - 1) / 2;
                specVal = specs.ch1 - (ratio * (specs.ch1 - specs.ch3));
            }
            displaySuppression = Math.round(specVal);

            // --- NEW LOGIC START ---
            // Calculate signalQuality based on the suppression level.
            // Higher suppression (e.g. 105 dB) preserves more signal (quality near 90-100%).
            // Lower suppression (e.g. 60 dB) results in lower quality.
            signalQuality = Math.min(95, Math.max(30, displaySuppression * 0.8));
            // --- NEW LOGIC END ---

            ui.jamBar.style.width = '10%';
            ui.jamVal.innerText = `${displaySuppression} dB`;
            ui.gpsBar.className = "signal-bar bg-green-500";
        }
    } else {
        ui.jamBar.style.width = '0%';
        ui.jamVal.innerText = "0 dB";
        ui.gpsBar.className = "signal-bar bg-green-500";
    }

    ui.gpsBar.style.width = `${signalQuality}%`;
    if (totalSatellites > 0) {
        ui.gpsVal.innerText = `${Math.round(signalQuality * 0.4)} dB`;
    }

    requestAnimationFrame(animate);
}

// Start
init();
resize();
animate();
