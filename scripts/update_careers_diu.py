import sys

file_path = r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the internships array
old_internships_start = "const internships: Role[] = ["
old_internships_end = "    ];\n\n    const leadershipRoles: Role[] = ["
new_internships = """const internships: Role[] = [
        {
            id: 'intern-ai',
            title: 'Acoustic & RF AI Intern',
            type: 'Internship',
            duration: '3 Months',
            compensation: 'Unpaid (High Learning)',
            description: 'Work on our SKHY-A7 and A16 acoustic sentinels and RF fusion nodes. You will help build models that correlate acoustic signatures with RF intelligence to eliminate false positives in contested environments.',
            assignment: 'Design a high-level multi-modal fusion architecture (pseudo-code or diagram) that correlates an incoming acoustic drone signature with RF spectrum data, specifically handling cases where one modality is suddenly jammed.',
            skills: ['Python', 'Signal Processing', 'Sensor Fusion', 'PyTorch']
        },
        {
            id: 'intern-sdr',
            title: 'SDR & Mesh Networking Intern',
            type: 'Internship',
            duration: '3 Months',
            compensation: 'Unpaid (High Learning)',
            description: 'Assist in developing our MANET mesh networking backbone. Work with USRP E310 SDRs and frequency-hopping algorithms to ensure our AB20 and AB40 radios maintain connectivity in GPS-denied, EW-heavy zones.',
            assignment: 'Write a GNU Radio flowgraph or a Python pseudo-code implementation for a basic frequency-hopping spread spectrum (FHSS) synchronization loop that recovers from intermittent jamming.',
            skills: ['SDR', 'GNU Radio', 'C++', 'Networking']
        },
        {
            id: 'intern-hardware',
            title: 'Hardware & Mechanical Intern',
            type: 'Internship',
            duration: '3 Months',
            compensation: 'Unpaid (High Learning)',
            description: 'Focus on the physical defense layer: from AeroGuard aerodynamic cones to the vertical launch canisters of our Interceptor 6, and the reinforced hull of the APEX-24 USV.',
            assignment: 'Design a CAD conceptual mechanism for a waterproof vertical-launch canister system that securely holds a 2kg interceptor and ejects it rapidly upon receiving an electronic trigger.',
            skills: ['CAD/SolidWorks', 'Mechanical Engineering', 'Rapid Prototyping']
        }
    ];"""

# Replace leadershipRoles array
old_leadership_end = "    ];\n\n    const engineeringRoles: Role[] = ["
new_leadership = """const leadershipRoles: Role[] = [
        {
            id: 'lead-vidur',
            title: 'Director of Vidur AI OS',
            type: 'Leadership',
            compensation: 'Significant Equity',
            description: 'Lead the architecture of our Sovereign Edge OS (Vidur). Ensure our air-gapped machine learning models and continuous OTA update pipelines operate securely across our global mesh network without any cloud dependency.',
            assignment: 'Draft a security architecture document detailing how Vidur OS prevents model poisoning and ensures secure OTA updates in a zero-trust, cloud-denied mesh environment.',
            skills: ['Sovereign OS Architecture', 'Zero-Trust Security', 'Edge AI', 'Team Leadership']
        },
        {
            id: 'lead-defense',
            title: 'Chief Drone Swarm Architect',
            type: 'Leadership',
            compensation: 'Significant Equity',
            description: 'Architect the C2 logic for our networked kinetic effectors (Interceptor 5, 6, 7, 11). Design the swarm intelligence that integrates telemetry from our high-altitude Surveyor Drone (aerial radar) for mid-flight interceptor retargeting.',
            assignment: 'Outline a C2 logic flowchart for the mid-flight retargeting of a 5-drone interceptor swarm based on real-time telemetry from a Surveyor Drone when the primary target employs evasive maneuvers.',
            skills: ['Swarm Intelligence', 'C2 Architecture', 'Aerospace Engineering', 'Systems Integration']
        },
        {
            id: 'lead-sales',
            title: 'Director of Public Sector Sales',
            type: 'Leadership',
            compensation: 'Equity + Commission',
            description: 'Drive adoption of Skhy systems within global government and defense sectors. Leverage our asymmetric cost advantage (e.g., $351K for a 50km² perimeter defense) to win contracts against legacy systems like NASAMS or Patriot.',
            assignment: 'Draft an executive summary for a DIU (Defense Innovation Unit) proposal contrasting the cost-effectiveness, passive detection, and rapid deployment of our $351K 50km² perimeter defense against traditional legacy defense systems.',
            skills: ['Govt Procurement', 'Defense Sales', 'Strategic Partnerships', 'Proposal Writing']
        }
    ];"""

# Replace engineeringRoles array
old_engineering_end = "    ];\n\n    const salesRoles: Role[] = ["
new_engineering = """const engineeringRoles: Role[] = [
        {
            id: 'eng-firmware',
            title: 'Lead Edge Firmware Engineer',
            type: 'Engineering',
            compensation: 'Equity',
            description: 'Design mission-critical real-time firmware for our Jamming-Resilient Edge AI & RF Fusion nodes. Work with NVIDIA Orin Nano and Xilinx FPGAs to maximize inference performance per watt in hostile field conditions.',
            assignment: 'Provide an architecture or C++ code sample for an RTOS-based network driver that dynamically switches between multiple MANET radio interfaces (e.g., AB20, AB40) based on Link Quality Indicator (LQI) to maintain OTA channels.',
            skills: ['C/C++', 'RTOS', 'NVIDIA Orin / FPGA', 'Hardware Abstraction']
        },
        {
            id: 'eng-automl',
            title: 'Senior AutoML & Edge AI Engineer',
            type: 'Engineering',
            compensation: 'Equity',
            description: 'Own the AutoML Continuous Improvement Loop. Design systems where edge nodes compress false-positive sensor data, send it via low-bandwidth mesh for retraining, and receive quantized model updates over-the-air.',
            assignment: 'Design a federated learning or continuous AutoML pipeline where edge nodes compress false-positive audio samples, send them via a low-bandwidth mesh, and receive quantized model updates without cloud access.',
            skills: ['AutoML', 'Model Quantization', 'Edge Inference', 'PyTorch']
        },
        {
            id: 'eng-marine',
            title: 'Naval Systems & Maritime Engineer',
            type: 'Engineering',
            compensation: 'Equity',
            description: 'Extend our capabilities into Maritime Domain Awareness. Focus on the APEX-24 Interceptor USV, subsea Distributed Acoustic Sensing (DAS), and Buoy-Mounted Jamming-Resilient Edge AI nodes.',
            assignment: 'Develop a threat classification state machine for the autonomous APEX-24 USV to track, verify, and intercept a \"dark vessel\" using fused AIS data and onboard acoustic sensors.',
            skills: ['Maritime Domain Awareness', 'Robotics/ROS', 'Naval Systems', 'Sensor Fusion']
        }
    ];"""

# Replace salesRoles array
old_sales_end = "    ];\n\n    const toggleRole = (id: string) => {"
new_sales = """const salesRoles: Role[] = [
        {
            id: 'sales-affiliate',
            title: 'Defense Tech Affiliate & Integrator',
            type: 'Sales',
            compensation: 'Tiered Commission',
            description: 'Expand our click-to-buy hardware marketplace footprint. Leverage our 10-tier commission structure to onboard private military contractors, maritime security companies, and critical infrastructure operators.',
            assignment: 'Map out a tiered 30-day go-to-market plan detailing how you would onboard 5 new private maritime security companies as distributors for our APEX-24 USV and Buoy-Mounted Nodes.',
            skills: ['B2B Sales', 'Affiliate Marketing', 'Maritime Security Network', 'Growth Hacking']
        }
    ];"""


import re

# We will use regex to replace the arrays entirely
content = re.sub(r'const internships: Role\[\] = \[.*?\];', new_internships, content, flags=re.DOTALL)
content = re.sub(r'const leadershipRoles: Role\[\] = \[.*?\];', new_leadership, content, flags=re.DOTALL)
content = re.sub(r'const engineeringRoles: Role\[\] = \[.*?\];', new_engineering, content, flags=re.DOTALL)
content = re.sub(r'const salesRoles: Role\[\] = \[.*?\];', new_sales, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
