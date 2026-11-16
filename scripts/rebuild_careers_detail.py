import os

# Create src/data/careers.ts
careers_ts_content = """export interface Role {
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
        location: 'Remote / Hybrid',
        type: '3 Months',
        compensation: 'Unpaid (High Learning)',
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
        assignment: 'Design a high-level multi-modal fusion architecture (pseudo-code or diagram) that correlates an incoming acoustic drone signature with RF spectrum data, specifically handling cases where one modality is suddenly jammed.'
    },
    {
        id: 'intern-sdr',
        title: 'SDR & Mesh Networking Intern',
        department: 'Internships',
        location: 'On-site',
        type: '3 Months',
        compensation: 'Unpaid (High Learning)',
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
        assignment: 'Write a GNU Radio flowgraph or a Python pseudo-code implementation for a basic frequency-hopping spread spectrum (FHSS) synchronization loop that recovers from intermittent jamming.'
    },
    {
        id: 'intern-hardware',
        title: 'Hardware & Mechanical Intern',
        department: 'Internships',
        location: 'On-site',
        type: '3 Months',
        compensation: 'Unpaid (High Learning)',
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
        assignment: 'Design a CAD conceptual mechanism for a waterproof vertical-launch canister system that securely holds a 2kg interceptor and ejects it rapidly upon receiving an electronic trigger.'
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
        assignment: 'Draft a security architecture document detailing how a sovereign edge operating system prevents model poisoning and ensures secure OTA updates in a zero-trust, cloud-denied mesh environment.'
    },
    {
        id: 'lead-defense',
        title: 'Chief Drone Swarm Architect',
        department: 'Leadership',
        location: 'Remote / On-site',
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
        assignment: 'Outline a C2 logic flowchart for the mid-flight retargeting of a 5-drone interceptor swarm based on real-time telemetry from an aerial top-down radar drone when the primary target employs evasive maneuvers.'
    },
    {
        id: 'lead-sales',
        title: 'Director of Public Sector Sales',
        department: 'Leadership',
        location: 'Remote',
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
        assignment: 'Draft an executive summary for a DIU (Defense Innovation Unit) proposal contrasting the cost-effectiveness, passive detection, and rapid deployment of our $351K 50km² perimeter defense against traditional legacy defense systems.'
    },
    {
        id: 'eng-firmware',
        title: 'Lead Edge Firmware Engineer',
        department: 'Engineering',
        location: 'Hybrid',
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
        assignment: 'Provide an architecture or C++ code sample for an RTOS-based network driver that dynamically switches between multiple MANET radio interfaces based on Link Quality Indicator (LQI) to maintain OTA channels.'
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
        assignment: 'Design a federated learning or continuous AutoML pipeline where edge nodes compress false-positive audio samples, send them via a low-bandwidth mesh, and receive quantized model updates without cloud access.'
    },
    {
        id: 'eng-marine',
        title: 'Naval Systems & Maritime Engineer',
        department: 'Engineering',
        location: 'On-site',
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
        assignment: 'Develop a threat classification state machine for an autonomous surface vehicle (USV) to track, verify, and intercept a "dark vessel" using fused AIS data and onboard acoustic sensors.'
    },
    {
        id: 'sales-affiliate',
        title: 'Defense Tech Affiliate & Integrator',
        department: 'Sales',
        location: 'Remote',
        type: 'Contract',
        compensation: 'Tiered Commission',
        description: 'Expand our click-to-buy hardware marketplace footprint. Leveraging our innovative 10-tier commission structure, you will aggressively onboard private military contractors, maritime security companies, and critical infrastructure operators as distributors and end-users.',
        responsibilities: [
            'Identify and recruit high-value affiliates and integration partners within the defense sector.',
            'Manage the partner lifecycle from initial outreach and onboarding to sustained growth.',
            'Develop go-to-market materials and sales playbooks for affiliate channels.',
            'Utilize the 10-tier commission structure to incentivize network expansion.'
        ],
        requirements: [
            'Proven experience in B2B sales, affiliate marketing, or channel management.',
            'Existing relationships within the private military, maritime security, or critical infrastructure sectors.',
            'Strong understanding of growth hacking and viral expansion strategies.',
            'Ability to operate independently in a fast-paced, high-commission contractor role.'
        ],
        assignment: 'Map out a tiered 30-day go-to-market plan detailing how you would onboard 5 new private maritime security companies as distributors for autonomous interception surface vessels and buoy-mounted sensor nodes.'
    }
];
"""

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\data\careers.ts', 'w', encoding='utf-8') as f:
    f.write(careers_ts_content)

# Update src/pages/Careers.tsx
careers_tsx_content = """import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { allRoles } from '../data/careers';

const Careers: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

    const departments = ['Engineering', 'Leadership', 'Sales', 'Internships'];

    const toggleDepartment = (dept: string) => {
        setSelectedDepartments(prev => 
            prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
        );
    };

    const filteredRoles = useMemo(() => {
        return allRoles.filter(role => {
            const matchesSearch = !searchQuery || 
                role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                role.description.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesDept = selectedDepartments.length === 0 || selectedDepartments.includes(role.department);
            
            return matchesSearch && matchesDept;
        });
    }, [searchQuery, selectedDepartments]);

    return (
        <div className="min-h-screen bg-[#050a14] text-white selection:bg-[#00f0ff] selection:text-black">
            <Navbar />

            {/* Banner Section */}
            <div className="pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
                <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-turquoise-400 mb-6 transition-colors text-sm uppercase tracking-widest font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </button>
                
                <div className="relative mb-8 rounded-xl overflow-hidden shadow-2xl border border-white/10 h-64 md:h-80 flex items-center">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/careers_banner.png')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050a14] via-[#050a14]/90 to-transparent"></div>
                    <div className="relative z-10 p-8 md:p-12 max-w-2xl">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white leading-tight">
                            Careers at <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-turquoise-400">Skhy AI</span>
                        </h1>
                        <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed">
                            Join our mission to deploy fully autonomous, jamming-resilient technologies that protect nations from evolving asymmetric threats.
                        </p>
                    </div>
                </div>
            </div>

            {/* ATS Layout Section */}
            <div className="px-4 md:px-8 max-w-7xl mx-auto pb-24">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Sidebar - Filters */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 sticky top-24">
                            <h2 className="text-lg font-bold mb-6 flex items-center uppercase tracking-widest text-gray-300">
                                <Filter className="w-4 h-4 mr-2 text-turquoise-500" /> Filter Roles
                            </h2>
                            
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Keywords..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded px-10 py-2 text-sm text-white focus:outline-none focus:border-turquoise-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Department</label>
                                <div className="space-y-3">
                                    {departments.map(dept => (
                                        <label key={dept} className="flex items-center cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${selectedDepartments.includes(dept) ? 'bg-turquoise-500 border-turquoise-500' : 'bg-black/50 border-gray-600 group-hover:border-turquoise-400'}`}>
                                                {selectedDepartments.includes(dept) && <CheckCircle2 className="w-3 h-3 text-black" />}
                                            </div>
                                            <span className={`text-sm ${selectedDepartments.includes(dept) ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>{dept}</span>
                                            {/* Hide default checkbox */}
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={selectedDepartments.includes(dept)} 
                                                onChange={() => toggleDepartment(dept)} 
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Main Content - Job List */}
                    <div className="w-full lg:w-3/4">
                        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                            
                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-black/40 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <div className="col-span-6">Role Title</div>
                                <div className="col-span-3">Department</div>
                                <div className="col-span-3 text-right">Location</div>
                            </div>

                            {/* Job Rows */}
                            <div className="divide-y divide-white/5">
                                {filteredRoles.length > 0 ? filteredRoles.map(role => (
                                    <Link key={role.id} to={`/careers/${role.id}`} target="_blank" rel="noopener noreferrer" className="group block">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] cursor-pointer transition-colors">
                                            <div className="col-span-12 md:col-span-6">
                                                <h3 className="text-lg font-bold text-turquoise-400 group-hover:text-turquoise-300 transition-colors">{role.title}</h3>
                                                <div className="flex items-center text-xs text-gray-500 mt-1 md:hidden">
                                                    <span className="mr-3">{role.department}</span>
                                                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {role.location}</span>
                                                </div>
                                            </div>
                                            <div className="hidden md:block col-span-3 text-sm text-gray-400">
                                                {role.department}
                                            </div>
                                            <div className="hidden md:flex col-span-3 justify-end items-center text-sm text-gray-400">
                                                <MapPin className="w-3 h-3 mr-1" /> {role.location}
                                                <ChevronRight className="w-4 h-4 ml-4 text-gray-600 group-hover:text-turquoise-500 transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="p-8 text-center text-gray-500">
                                        No roles found matching your criteria.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Careers;
"""
with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx', 'w', encoding='utf-8') as f:
    f.write(careers_tsx_content)

# Create src/pages/CareerDetail.tsx
career_detail_content = """import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { allRoles } from '../data/careers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Briefcase, MapPin, ExternalLink } from 'lucide-react';

const CareerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const role = allRoles.find(r => r.id === id);

    useEffect(() => {
        if (!role) {
            navigate('/careers');
        }
        window.scrollTo(0, 0);
    }, [role, navigate]);

    if (!role) return null;

    const handleApply = () => {
        const subject = encodeURIComponent(`Application for: ${role.title}`);
        const body = encodeURIComponent(`Hi Skhy Team,\\n\\nI am applying for the ${role.title} position.\\n\\n[Please attach your resume and a brief introduction]\\n\\n[Link to Assignment Submission: Insert GitHub/Notion/Drive Link Here]`);
        window.location.href = `mailto:contact@skhy.systems?subject=${subject}&body=${body}`;
    };

    return (
        <div className="min-h-screen bg-[#050a14] text-white selection:bg-[#00f0ff] selection:text-black">
            <Navbar />
            
            <div className="pt-24 pb-24 px-4 md:px-8 max-w-4xl mx-auto">
                <Link to="/careers" className="inline-flex items-center text-gray-400 hover:text-turquoise-400 mb-8 transition-colors text-sm uppercase tracking-widest font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Careers
                </Link>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
                    <div className="mb-12 border-b border-white/10 pb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{role.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 uppercase tracking-widest font-bold">
                            <span className="flex items-center text-turquoise-400"><Briefcase className="w-4 h-4 mr-2" /> {role.department}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {role.location}</span>
                            <span className="px-3 py-1 border border-white/20 rounded-full">{role.type}</span>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">About the Role</h2>
                            <p className="text-gray-300 leading-relaxed text-lg">{role.description}</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Key Responsibilities</h2>
                            <ul className="list-disc list-outside ml-5 text-gray-300 space-y-3 text-base">
                                {role.responsibilities.map((req, idx) => <li key={idx} className="pl-2">{req}</li>)}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">What We're Looking For</h2>
                            <ul className="list-disc list-outside ml-5 text-gray-300 space-y-3 text-base">
                                {role.requirements.map((req, idx) => <li key={idx} className="pl-2">{req}</li>)}
                            </ul>
                        </section>

                        <section className="bg-turquoise-500/10 border-l-4 border-turquoise-500 rounded-r-lg p-6 md:p-8">
                            <h2 className="text-sm font-bold text-turquoise-400 uppercase tracking-widest mb-3">Required Assignment</h2>
                            <p className="text-gray-300 text-base italic leading-relaxed">{role.assignment}</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Compensation</h2>
                            <p className="text-gray-300 font-bold text-lg">{role.compensation}</p>
                        </section>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/10">
                        <button 
                            onClick={handleApply}
                            className="w-full md:w-auto bg-turquoise-500 hover:bg-turquoise-400 text-black font-bold py-4 px-12 rounded transition-colors flex items-center justify-center uppercase tracking-widest"
                        >
                            Submit Application <ExternalLink className="w-5 h-5 ml-3" />
                        </button>
                        <p className="text-xs text-gray-500 mt-4">
                            Ensure your assignment link is included in the application email.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CareerDetail;
"""
with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\CareerDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(career_detail_content)

# Update App.tsx
with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\App.tsx', 'r', encoding='utf-8') as f:
    app_tsx_content = f.read()

app_tsx_content = app_tsx_content.replace(
    "const Careers = lazy(() => import('./pages/Careers'));",
    "const Careers = lazy(() => import('./pages/Careers'));\nconst CareerDetail = lazy(() => import('./pages/CareerDetail'));"
)

app_tsx_content = app_tsx_content.replace(
    '<Route path="/careers" element={<Careers />} />',
    '<Route path="/careers" element={<Careers />} />\n                  <Route path="/careers/:id" element={<CareerDetail />} />'
)

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_tsx_content)

print("Files created and updated successfully.")
