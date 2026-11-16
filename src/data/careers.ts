export interface Role {
    id: string;
    title: string;
    department: 'Engineering' | 'Leadership' | 'Sales' | 'Internships';
    location: string;
    type: string;
    compensation: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    assignment: string;
}

export const allRoles: Role[] = [
    {
        id: 'intern-ai',
        title: 'Acoustic & RF AI Intern',
        department: 'Internships',
        location: 'Remote / Hybrid (Pune, India HQ)',
        type: '3 Months',
        compensation: 'TBD',
        description: 'Join our sensing core team to work on cutting-edge acoustic sentinels and RF fusion nodes. You will help build and train models that correlate acoustic signatures with RF intelligence to eliminate false positives in contested environments.',
        responsibilities: [
            'Develop and train machine learning models for acoustic signature classification.',
            'Integrate acoustic sensor data with RF spectrum intelligence for multimodal threat detection.',
            'Optimize inference pipelines for deployment on resource-constrained edge devices.',
            'Assist in field testing and data collection for drone signature datasets.'
        ],
        requirements: [
            'Currently pursuing a degree in Computer Science, Electrical Engineering, or related field.',
            'Strong proficiency in Python and deep learning frameworks like PyTorch or TensorFlow.',
            'Familiarity with digital signal processing (DSP) and time-series data analysis.',
            'Passion for defense technology and sovereign AI systems.'
        ],
        assignment: `Draft a technical specification and Python pseudo-code for an edge-deployable multi-modal sensor fusion pipeline. Assume input streams are (1) 44.1kHz audio data capturing acoustic drone signatures and (2) IQ data from an RF sensor. Your architecture must handle temporal synchronization between streams, demonstrate how you would construct a unified feature vector, and include a fallback logic mechanism for when the RF band becomes heavily jammed (e.g. SNIR drops below -10dB). Discuss how you would keep inference latency under 50ms on an NVIDIA Jetson Orin Nano.`
    },
    {
        id: 'intern-sdr',
        title: 'SDR & Mesh Networking Intern',
        department: 'Internships',
        location: 'On-site (Pune, India HQ)',
        type: '3 Months',
        compensation: 'TBD',
        description: 'Assist in developing our MANET mesh networking backbone. You will work hands-on with USRP SDRs and frequency-hopping algorithms to ensure our tactical radios maintain connectivity in GPS-denied, EW-heavy zones.',
        responsibilities: [
            'Prototype and test frequency-hopping spread spectrum (FHSS) synchronization loops.',
            'Implement MAC-layer protocols for low-latency ad-hoc mesh networks.',
            'Conduct RF lab testing to evaluate packet loss under simulated jamming conditions.',
            'Assist firmware engineers in porting SDR algorithms to FPGA/embedded platforms.'
        ],
        requirements: [
            'Experience with Software Defined Radio (SDR) platforms (e.g., USRP, HackRF) and GNU Radio.',
            'Solid understanding of wireless communications and RF propagation theory.',
            'Proficiency in C++ and Python.',
            'Ability to work on-site in a hardware lab environment.'
        ],
        assignment: `Develop a comprehensive design document (and accompanying Python pseudo-code or GNU Radio flowgraph design) for a Frequency-Hopping Spread Spectrum (FHSS) sync loop tailored for a USRP E310 SDR. The assignment must detail the MAC-layer preamble sequence, the hopping pseudo-random number generator (PRNG) logic shared between nodes, and specifically how the receiver node resynchronizes if it misses 3 consecutive hops due to active barrage jamming.`
    },
    {
        id: 'intern-hardware',
        title: 'Hardware & Mechanical Intern',
        department: 'Internships',
        location: 'On-site (Pune, India HQ)',
        type: '3 Months',
        compensation: 'TBD',
        description: 'Focus on the physical defense layer. You will assist in designing aerodynamic cones, vertical launch canisters for interceptors, and ruggedized enclosures for autonomous surface vehicles operating in extreme environments.',
        responsibilities: [
            'Design and iterate on CAD models for rapid prototyping using 3D printing and CNC machining.',
            'Conduct structural and thermal simulations on hardware enclosures.',
            'Design and test deployment mechanisms, including canister ejection systems.',
            'Collaborate with the manufacturing team to transition prototypes to low-rate initial production.'
        ],
        requirements: [
            'Strong proficiency in CAD software (SolidWorks, Fusion 360, or equivalent).',
            'Solid understanding of mechanical engineering principles, materials science, and kinetics.',
            'Hands-on experience with rapid prototyping tools and machine shop equipment.',
            'Detail-oriented approach to designing ruggedized systems for defense applications.'
        ],
        assignment: `Create a conceptual CAD assembly report for an IP67-rated vertical-launch canister. The canister must house a 2kg interceptor drone. Detail the electronic release mechanism (e.g., solenoid or pyrotechnic latch) required to eject the drone within 100ms of a C2 trigger. Include a brief analysis of the thermal and shock constraints assuming deployment in high-salinity maritime environments and structural requirements to survive a 10G shock load.`
    },
    {
        id: 'lead-vidur',
        title: 'Director of Sovereign Edge OS',
        department: 'Leadership',
        location: 'Remote',
        type: 'Full-time',
        compensation: 'Significant Equity',
        description: 'Lead the architecture of our Sovereign Edge OS. You will ensure our air-gapped machine learning models and continuous OTA update pipelines operate securely across our global mesh network without any cloud dependency, establishing a new standard in zero-trust edge infrastructure.',
        responsibilities: [
            'Architect the core operating system layer for distributed, air-gapped edge computing nodes.',
            'Design and implement zero-trust security models preventing unauthorized access and model poisoning.',
            'Build robust, peer-to-peer over-the-air (OTA) update mechanisms utilizing low-bandwidth mesh networks.',
            'Lead and scale a team of elite systems engineers and kernel developers.'
        ],
        requirements: [
            '10+ years of experience in systems engineering, OS architecture, or low-level embedded software.',
            'Proven track record in designing zero-trust architectures and air-gapped systems.',
            'Deep expertise in Linux kernel customization, secure boot, and cryptographic protocols.',
            'Exceptional leadership skills and experience scaling engineering teams in high-stakes environments.'
        ],
        assignment: `Write a 2-page architectural RFC for a Zero-Trust OTA update pipeline tailored for a distributed mesh of air-gapped nodes (Skhy Sentinel Nodes). The architecture must detail how nodes authenticate firmware and quantized ML model updates utilizing hardware roots of trust (e.g. TPM 2.0). Address how the system mitigates rollback attacks, prevents model poisoning when updates are propagated peer-to-peer over a low-bandwidth MANET, and handles interrupted transmissions.`
    },
    {
        id: 'lead-defense',
        title: 'Chief Drone Swarm Architect',
        department: 'Leadership',
        location: 'Remote / On-site (Pune, India HQ)',
        type: 'Full-time',
        compensation: 'Significant Equity',
        description: 'Architect the Command and Control (C2) logic for our networked kinetic effectors. You will design the swarm intelligence that seamlessly integrates telemetry from our high-altitude aerial radar drones to execute mid-flight interceptor retargeting against evasive targets.',
        responsibilities: [
            'Design the overarching C2 architecture for autonomous, multi-agent drone swarms.',
            'Develop algorithms for dynamic task allocation, collision avoidance, and swarm cohesion.',
            'Integrate real-time radar telemetry for predictive target tracking and mid-flight retargeting.',
            'Lead the integration of kinetic effector systems and oversee live-fire field demonstrations.'
        ],
        requirements: [
            'Advanced degree in Aerospace Engineering, Robotics, or Computer Science.',
            'Extensive experience with autonomous flight systems, PX4/ArduPilot, and swarm intelligence.',
            'Strong background in control theory, sensor fusion, and multi-agent systems.',
            'Ability to navigate complex regulatory environments regarding autonomous kinetic systems.'
        ],
        assignment: `Provide a detailed systems architecture and algorithmic flowchart for a kinetic effector swarm (5 interceptor drones) executing a cooperative mid-flight retargeting maneuver. The swarm relies on an overarching top-down radar drone for macro telemetry, but must transition to decentralized on-board vision tracking in the terminal phase. Explain your approach to dynamic task allocation (e.g., using market-based or auction algorithms), collision avoidance during the terminal dive, and state estimation filters (e.g., Extended Kalman Filters) to handle evasive maneuvers by the target.`
    },
    {
        id: 'lead-sales',
        title: 'Director of Public Sector Sales',
        department: 'Leadership',
        location: 'Remote / Kuala Lumpur Sales Office',
        type: 'Full-time',
        compensation: 'Equity + Commission',
        description: 'Drive the adoption of Skhy AI systems within global government and defense sectors. You will leverage our asymmetric cost advantage—deploying a 50km² perimeter defense for a fraction of the cost of legacy systems—to aggressively capture market share and win strategic contracts.',
        responsibilities: [
            'Develop and execute the go-to-market strategy for the public sector and defense agencies.',
            'Build and maintain relationships with key stakeholders, procurement officers, and defense contractors.',
            'Lead the response to RFPs, OTAs, and other government procurement vehicles (e.g., DIU proposals).',
            'Translate complex technical advantages into compelling, mission-critical value propositions.'
        ],
        requirements: [
            'Requires either working in defense procurement or experience with defense sales.',
            'Proven track record of closing multi-million dollar contracts within the public sector.',
            'Deep understanding of government acquisition processes and funding cycles.',
            'Existing network of contacts within defense innovation units, prime contractors, or allied military organizations.'
        ],
        assignment: `Prepare a mock response to a DIU (Defense Innovation Unit) Commercial Solutions Opening (CSO) focused on C-UAS for critical infrastructure. Your 2-page executive summary must aggressively contrast Skhy AI's $351K, 50km² passive mesh perimeter defense against a legacy $4M+ active-radar SHORAD system. Include a specific stakeholder mapping strategy detailing how you would navigate procurement officers, end-users, and prime contractors to transition from a prototype OTA (Other Transaction Authority) to a scalable Program of Record.`
    },
    {
        id: 'eng-firmware',
        title: 'Lead Edge Firmware Engineer',
        department: 'Engineering',
        location: 'Hybrid (Pune, India HQ)',
        type: 'Full-time',
        compensation: 'Equity',
        description: 'Design mission-critical real-time firmware for our Jamming-Resilient Edge AI & RF Fusion nodes. Working closely with NVIDIA Orin Nano and Xilinx FPGAs, you will maximize inference performance per watt to ensure sustained operation in hostile, power-constrained field conditions.',
        responsibilities: [
            'Develop bare-metal and RTOS-based firmware for heterogeneous edge computing platforms.',
            'Optimize hardware abstraction layers (HAL) for seamless integration with varied sensor suites.',
            'Implement dynamic network driver switching to maintain OTA channels in EW-contested environments.',
            'Profile and optimize power consumption to maximize battery life for remote nodes.'
        ],
        requirements: [
            'Deep expertise in C/C++ for embedded systems and RTOS (e.g., FreeRTOS, Zephyr).',
            'Experience with NVIDIA Jetson (Orin Nano) ecosystems and FPGA interfacing.',
            'Strong understanding of hardware-software co-design and low-level device drivers.',
            'Familiarity with RF communication protocols and mesh networking.'
        ],
        assignment: `Write a bare-metal or FreeRTOS C++ architectural outline and pseudo-code for a resilient network abstraction layer. The system must seamlessly failover between a primary 5GHz MANET radio and a secondary Sub-1GHz LoRa fallback module. The logic should evaluate Link Quality Indicator (LQI), Packet Error Rate (PER), and detected RSSI noise floor to trigger a context switch under 10ms when broadband EW jamming is detected. Describe how you manage memory and thread priorities during the failover to prevent dropping critical C2 packets.`
    },
    {
        id: 'eng-automl',
        title: 'Senior AutoML & Edge AI Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        compensation: 'Equity',
        description: 'Own the AutoML Continuous Improvement Loop. You will design resilient systems where edge nodes compress false-positive sensor data, transmit it via low-bandwidth mesh networks for localized retraining, and receive quantized model updates completely over-the-air without cloud reliance.',
        responsibilities: [
            'Design continuous learning and federated learning pipelines optimized for edge deployments.',
            'Develop techniques for extreme data compression to transmit samples over narrow bandwidths.',
            'Implement model quantization and pruning to accelerate inference on edge devices.',
            'Collaborate with firmware engineers to deploy updated models via peer-to-peer mesh networks.'
        ],
        requirements: [
            'Extensive experience with PyTorch, TensorFlow, and Edge AI frameworks (e.g., TensorRT, ONNX).',
            'Strong background in model compression, quantization, and federated learning.',
            'Proficiency in designing automated machine learning (AutoML) pipelines.',
            'Understanding of bandwidth-constrained communication systems.'
        ],
        assignment: `Architect a decentralized Federated Learning (FL) pipeline optimized for highly degraded, low-bandwidth mesh environments. Edge nodes must capture false-positive acoustic events, apply extreme compression (explain your choice of autoencoder or feature extraction), and transmit them to a local command node. Detail how the command node aggregates these edge cases to retrain the model, applies post-training INT8 quantization (via TensorRT/ONNX), and pushes the delta weights back to the edge nodes.`
    },
    {
        id: 'eng-marine',
        title: 'Naval Systems & Maritime Engineer',
        department: 'Engineering',
        location: 'Hybrid / On-site (Pune, India HQ / Kuala Lumpur)',
        type: 'Full-time',
        compensation: 'Equity',
        description: 'Extend our capabilities into Maritime Domain Awareness. You will focus on the development of autonomous surface vehicles (USVs), subsea Distributed Acoustic Sensing (DAS) systems, and buoy-mounted jamming-resilient Edge AI nodes to secure coastal and critical maritime infrastructure.',
        responsibilities: [
            'Design and integrate sensor payloads (AIS, acoustic, optical) for autonomous surface vehicles.',
            'Develop threat classification state machines for maritime vessel tracking and interception.',
            'Engineer ruggedized, waterproof solutions for buoy-mounted edge computing nodes.',
            'Conduct sea trials and validate systems in harsh maritime environments.'
        ],
        requirements: [
            'Degree in Marine Engineering, Naval Architecture, Robotics, or a related field.',
            'Experience with Maritime Domain Awareness systems and AIS data integration.',
            'Proficiency in ROS/ROS2 and autonomous navigation algorithms.',
            'Hands-on experience deploying and testing hardware in marine environments.'
        ],
        assignment: `Design a comprehensive ROS2-based threat classification state machine for a kinetic Autonomous Surface Vehicle (USV). The scenario: The USV detects an incoming rigid-hull inflatable boat (RHIB) operating as a "dark vessel" (AIS spoofed/disabled). Map out the exact logic flow correlating subsea hydrophone data with above-water electro-optical (EO/IR) feeds. Detail the transition criteria between "Patrol", "Investigate", "Track", and "Intercept" states, including obstacle avoidance logic utilizing the nav2 stack.`
    },
    {
        id: 'sales-affiliate',
        title: 'Defense Tech Affiliate & Integrator',
        department: 'Sales',
        location: 'Remote',
        type: 'Contract',
        compensation: 'Commission-based',
        description: 'Expand our click-to-buy hardware marketplace footprint. You will aggressively onboard private military contractors, maritime security companies, and critical infrastructure operators as distributors and end-users.',
        responsibilities: [
            'Identify and recruit high-value affiliates and integration partners within the defense sector.',
            'Manage the partner lifecycle from initial outreach and onboarding to sustained growth.',
            'Develop go-to-market materials and sales playbooks for affiliate channels.',
            'Utilize our commission structure to incentivize network expansion.'
        ],
        requirements: [
            'Proven experience in B2B sales, affiliate marketing, or channel management.',
            'Existing relationships within the private military, maritime security, or critical infrastructure sectors.',
            'Strong understanding of growth hacking and viral expansion strategies.',
            'Ability to operate independently in a fast-paced, high-commission contractor role.'
        ],
        assignment: `Develop a tactical 30-day go-to-market and onboarding playbook targeting Private Military Contractors (PMCs) and Maritime Security firms operating in high-piracy vectors. Outline your cold-outreach strategy, the precise value proposition you would leverage to disrupt their reliance on legacy human-in-the-loop security, and a step-by-step roadmap for converting them into active hardware distributors for Skhy AI's autonomous surface vehicles and buoy sensors.`
    }
];
