import pptxgen from 'pptxgenjs';

export const generatePitchDeckPPTX = async () => {
    const pres = new pptxgen();

    pres.author = 'SKHY AI';
    pres.company = 'SKHY AI';
    pres.revision = '1.1';
    pres.subject = 'Dual-Use Pitch Deck';
    pres.title = 'SKHY AI Pitch Deck - Vertically Integrated C-UAS System';

    pres.layout = 'LAYOUT_16x9';

    // Master Slide Definition with beautiful dark premium theme
    pres.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: '0A0B10' }, // Harmonic dark navy-black
        objects: [
            // Top grid border element
            { line: { x: 0.5, y: 0.5, w: 9.0, h: 0, line: { color: '1E293B', width: 1.5 } } },
            // Bottom watermark
            { text: { text: 'SKHY AI • CONFIDENTIAL', options: { x: 0.5, y: 6.8, w: 5.0, h: 0.3, fontSize: 10, color: '64748B', fontFace: 'Arial', bold: true } } }
        ]
    });

    const titleStyle: any = { x: 0.5, y: 0.7, w: 9.0, h: 0.8, fontSize: 32, bold: true, color: '00E5FF', fontFace: 'Arial' }; // Cyan accent color
    const contentStyle: any = { x: 0.5, y: 1.7, w: 9.0, h: 4.8, fontSize: 16, color: 'E2E8F0', fontFace: 'Arial', bullet: true, valign: 'top', lineSpacing: 26 };

    // Slide 1: Title Slide (Vertically Integrated C-UAS System)
    const slide1 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide1.addText('SKHY AI', { x: 1, y: 2.0, w: 8, h: 1, fontSize: 64, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial' } as any);
    slide1.addText('A Vertically Integrated C-UAS System', { x: 1, y: 3.1, w: 8, h: 0.8, fontSize: 22, color: '94A3B8', align: 'center', fontFace: 'Arial' } as any);
    slide1.addText('SECURE | RESILIENT | DUAL-USE', { x: 1, y: 4.2, w: 8, h: 0.5, fontSize: 16, color: '00FF9D', align: 'center', fontFace: 'Arial', bold: true } as any);
    slide1.addText('Seed Round Ask: $2.3M', { x: 1, y: 5.2, w: 8, h: 0.4, fontSize: 16, color: 'A855F7', align: 'center', fontFace: 'Arial', bold: true } as any);

    // Slide 2: The Problem
    const slide2 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide2.addText('1. The Covert Sky & Infrastructure Blindspots', titleStyle);
    slide2.addText([
        { text: 'Sensory Blindness:', options: { bold: true, color: 'FF3366' } },
        { text: ' Legacy radar and manual inspections fail to spot stealth drone threats or critical infrastructure anomalies (acoustic micro-leaks in gas pipelines, thermal insulation breakdowns in power grids).' },
        { text: '\nOperational Fragility:', options: { bold: true, color: 'FF3366' } },
        { text: ' GPS-denied environments render standard drones useless. Weather hazards and electronic interference create operational blindness for both tactical units and search-and-rescue (SAR) operators.' },
        { text: '\nThe Sovereignty Trap:', options: { bold: true, color: 'FF3366' } },
        { text: ' Reliance on foreign, remote cloud-based AI creates high latency and catastrophic cybersecurity vulnerabilities for sensitive defense operations and critical national energy utilities.' }
    ], contentStyle);

    // Slide 3: Why Now? The Urgency
    const slide3 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide3.addText('2. Why Now? The Urgency Drivers', titleStyle);
    slide3.addText([
        { text: 'Vulnerable Communications:', options: { bold: true, color: '00E5FF' } },
        { text: ' GPS jamming and electronic clutter are ubiquitous. Standard commercial and defense unmanned assets are rendered completely useless without resilient, on-device intelligence.' },
        { text: '\nCritical Asset Sabotage:', options: { bold: true, color: '00E5FF' } },
        { text: ' Physical sabotage and leakage risks on energy grids, gas pipelines, and offshore infrastructures are at an all-time high. Manual inspections are far too slow.' },
        { text: '\nDisaster & SAR Response:', options: { bold: true, color: '00E5FF' } },
        { text: ' Extreme weather incidents demand immediately deployable, GPS-denied autonomous aerial search & rescue systems to operate during catastrophic communication blackouts.' }
    ], contentStyle);

    // Slide 4: The Layered Ecosystem Solution
    const slide4 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide4.addText('3. A Vertically Integrated C-UAS System', titleStyle);
    slide4.addText([
        { text: 'The Sourcing Layer (Marketplace):', options: { bold: true, color: '00FF9D' } },
        { text: ' Frictionless, direct procurement of vetted dual-use hardware and autonomous subsystem components bypassing multi-year tenders. Features a de-risking Refund Policy.' },
        { text: '\nThe Intelligence OS (Vidur Middleware):', options: { bold: true, color: 'A855F7' } },
        { text: ' The secure brain. Hardware-enforced local AI model routing for defense sensors and remote utility telemetry without external cloud dependencies.' },
        { text: '\nThe Operational Layer (Application Suite):', options: { bold: true, color: '00E5FF' } },
        { text: ' Build Your Own Autonomy (simulation modeling RF propagation & GNSS resilience), Threat Awareness (real-time C2), and Asset Protection (acoustic micro-leaks & thermal grid monitoring).' }
    ], contentStyle);

    // Slide 5: Integrated Product Suite
    const slide5 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide5.addText('4. Integrated Product Suite & Readiness', titleStyle);
    slide5.addText([
        { text: 'Skhy.dev Vidur AI (TRL-7 Middleware Core):', options: { bold: true, color: 'A855F7' } },
        { text: ' Routes models locally on edge devices (Jetson Orin, Raspberry Pi 5) with zero cloud dependency. Zero-Trust sovereign encryption.' },
        { text: '\nBuild Your Own Autonomy (TRL-6 App):', options: { bold: true, color: '00E5FF' } },
        { text: ' Interactive simulator allowing tactical and enterprise users to design, raytrace, and purchase modular systems.' },
        { text: '\nEnterprise & Civilian Solutions (TRL-7 App):', options: { bold: true, color: '00FF9D' } },
        { text: ' Predictive AI for energy asset protection (pipeline leaks, thermal grid inspection), GPS-denied search & rescue telemetry, and post-storm damage mapping.' },
        { text: '\nThreat Awareness Manager (TRL-5 App):', options: { bold: true, color: '94A3B8' } },
        { text: ' Real-time Command Center sensor fusion (Acoustic + MIMO spectrum) field-validated in Delhi.' }
    ], contentStyle);

    // Slide 6: Business & Revenue Model
    const slide6 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide6.addText('5. Business & Revenue Model', titleStyle);
    slide6.addText([
        { text: 'Scalable and Diversified Streams (Break-even projected at Q5):' },
        { text: '\n• Marketplace Commission:', options: { bold: true } },
        { text: ' 15-20% commission per transactional trade ($280M SOM potential).' },
        { text: '\n• Simulator SaaS (Mission Architect):', options: { bold: true } },
        { text: ' $2k/month recurring developer/enterprise subscription ($150M SOM potential).' },
        { text: '\n• Enterprise App Licenses:', options: { bold: true } },
        { text: ' $25k+ per site license for Asset Protection and Threat Awareness ($650M SOM potential).' },
        { text: '\n• Financial Projection:', options: { bold: true } },
        { text: ' High margins on software scaling. Target: 2.5x ROI by Q6.' }
    ], contentStyle);

    // Slide 7: Go-To-Market Strategy
    const slide7 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide7.addText('6. Go-To-Market Strategy', titleStyle);
    slide7.addText([
        { text: 'Zero Friction Acquisition:', options: { bold: true, color: '00E5FF' } },
        { text: ' Bypass complex, multi-year tenders. Buy off-the-shelf components immediately with a de-risking Refund Policy.' },
        { text: '\nBuild vs Trials Retention:', options: { bold: true, color: '00FF9D' } },
        { text: ' Stop endless operational trials. VCs, partners, and defense buyers use our modular hardware to Build Your Own sovereign solution.' },
        { text: '\nPartner & Buyer Unified:', options: { bold: true, color: 'A855F7' } },
        { text: ' Transparent pricing, no hidden costs, shared development framework.' },
        { text: '\nTraction Pipeline:', options: { bold: true, color: 'FFFFFF' } },
        { text: ' $1.1M LOI already signed and secured with strategic Defense System Integrator.' }
    ], contentStyle);

    // Slide 8: Multi-Sector Civilian Expansion (Slide 7B)
    const slide8 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide8.addText('6B. Multi-Sector Civilian Expansion (Dual-Use)', titleStyle);
    slide8.addText([
        { text: 'Energy Asset Protection (Priority Market):', options: { bold: true, color: '00FF9D' } },
        { text: ' High-paying, stable enterprise contracts utilizing acoustic, seismic, and thermal sensor fusion to safeguard vital national grids: acoustic pipeline micro-leaks, autonomous thermal grid scans, and seismic trespassing alerts.' },
        { text: '\nSearch & Rescue (Emergency Grid):', options: { bold: true, color: 'A855F7' } },
        { text: ' Deploying autonomous edge intelligence for emergency services in communications-denied environments: GPS-denied storm/forest flight, on-device thermal survivor detection, and emergency mesh telemetry nodes.' },
        { text: '\nInsurance Claims & Infrastructure (Commercial SaaS):', options: { bold: true, color: '00E5FF' } },
        { text: ' Automating post-disaster property auditing and yield tracking for high-volume insurers: post-storm automated proof-of-loss, sub-centimeter orthomosaic mapping, and direct edge API integrations.' }
    ], contentStyle);

    // Slide 9: Competitive Landscape
    const slide9 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide9.addText('7. Competitive Landscape', titleStyle);
    slide9.addText([
        { text: 'Feature Comparison Grid:' },
        { text: '\n• Sensing Mode:', options: { bold: true } },
        { text: ' SKHY AI uses Airborne Acoustic + MIMO spectra vs Legacy Ground RF and Generic Software-only.' },
        { text: '\n• Jamming Resilience:', options: { bold: true } },
        { text: ' SKHY AI implements proprietary Anti-Jamming PNT vs Legacy systems that are completely vulnerable.' },
        { text: '\n• AI Security:', options: { bold: true } },
        { text: ' SKHY AI utilizes Hardware-Enforced Zero-Trust Security vs Legacy none and Generic cloud-dependent AI.' },
        { text: '\n• Procurement:', options: { bold: true } },
        { text: ' SKHY AI uses a direct "Click-to-Buy" Marketplace vs Legacy 18-24 month tenders and Generic SaaS-only models.' }
    ], contentStyle);

    // Slide 10: Traction & Validation
    const slide10 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide10.addText('8. Traction & Validation Timeline', titleStyle);
    slide10.addText([
        { text: 'Milestones and Proven Success:' },
        { text: '\n• 2024 (Framework):', options: { bold: true, color: '00FF9D' } },
        { text: ' Acoustic AI framework built by Chief Engineer Babu Priyavrat. Core of threat awareness platform.' },
        { text: '\n• Q3 2025 ($1.1M LOI):', options: { bold: true, color: '00FF9D' } },
        { text: ' LOI signed with strategic Defense System Integrator. Acoustic sensor prototype validated to spec.' },
        { text: '\n• Jan 2026 (Vidur AI OS):', options: { bold: true, color: '00FF9D' } },
        { text: ' Vidur AI framework launched. Sovereign middleware glue for air-gapped sensor fusion.' },
        { text: '\n• Q1 2027 (Scale):', options: { bold: true, color: '00FF9D' } },
        { text: ' Multi-layer mesh deployment (high/low altitude & ground units, SOC2).' }
    ], contentStyle);

    // Slide 11: The Builders (Team)
    const slide11 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide11.addText('9. The Builders (Co-Founders & Team)', titleStyle);
    slide11.addText([
        { text: 'Babu Priyavrat (Co-Founder & Chief Engineer):', options: { bold: true, color: '00E5FF' } },
        { text: ' Columbia University. 17+ years in Energy & Industrial AI. Expert in NLP, Big Data, and sensor fusion.' },
        { text: '\nNikki Chow (Co-Founder & CEO):', options: { bold: true, color: '00FF9D' } },
        { text: ' Ex-Shell. 14+ years in Oil & Gas strategy. Drives commercial relations and partnerships with Defense PSUs.' },
        { text: '\nShruti (Part-time Researcher):', options: { bold: true, color: 'A855F7' } },
        { text: ' CSIR Senior Fellow, 8+ years in RF/Microwave. Expert in signal propagation and ML forecasting workflows.' },
        { text: '\nReshma Chavan (Part-time Product):', options: { bold: true, color: '94A3B8' } },
        { text: ' 12+ years in Data Science (IKEA, etc). Drives product strategy, roadmap, and user research.' }
    ], contentStyle);

    // Slide 12: Contact
    const slide12 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide12.addText('10. Join the Mission', titleStyle);
    slide12.addText([
        { text: 'Raising $2.3M Seed Round to scale Sovereign AI OS & dual-use operations.' },
        { text: '\nWebsite:', options: { bold: true } },
        { text: ' https://skhy.systems' },
        { text: '\nEmail:', options: { bold: true } },
        { text: ' contact@skhy.systems' },
        { text: '\nCore Solutions:', options: { bold: true } },
        { text: ' Hardware Sourcing Marketplace | Mission Architect Simulator | Vidur AI Core' }
    ], contentStyle);

    // Slide 13: Appendix: Technical Deep Dive
    const slide13 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide13.addText('11. Appendix: Technical Deep Dive', titleStyle);
    slide13.addText([
        { text: 'System Architecture Layers:' },
        { text: '\n• Application Layer:', options: { bold: true } },
        { text: ' Threat Awareness UTM, GPS-denied navigation, 3D simulation raytracing, and Vidur Client.' },
        { text: '\n• Middleware Layer:', options: { bold: true } },
        { text: ' Skhy Vidur AI Platform featuringCollection (Datac), Hosting (Manager), and Red-Black separation.' },
        { text: '\n• Hardware Layer:', options: { bold: true } },
        { text: ' SKHY A7/A16 Acoustic Sensors, Edge AI Node (67 TOPS), Anti-Jam GPS, and MANET mesh networks.' },
        { text: '\n• Red-Black Separation (IRSA Compliant):', options: { bold: true, color: 'FF3366' } },
        { text: ' Hardware guard FPGA data diode isolates "BLACK" untrusted spectrum ingest (DragonOS) from classified "RED" target classification (Vidur AI).' }
    ], contentStyle);

    // Save the presentation
    await pres.writeFile({ fileName: 'SKHY_AI_Pitch_Deck.pptx' });
};
