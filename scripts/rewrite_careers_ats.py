import sys

file_path = r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx'

content = """import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, MapPin, Briefcase, ChevronRight, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Role {
    id: string;
    title: string;
    department: 'Engineering' | 'Leadership' | 'Sales' | 'Internships';
    location: string;
    type: string;
    compensation: string;
    description: string;
    assignment: string;
    skills: string[];
}

const allRoles: Role[] = [
    {
        id: 'intern-ai',
        title: 'Acoustic & RF AI Intern',
        department: 'Internships',
        location: 'Remote / Hybrid',
        type: '3 Months',
        compensation: 'Unpaid (High Learning)',
        description: 'Work on our SKHY-A7 and A16 acoustic sentinels and RF fusion nodes. You will help build models that correlate acoustic signatures with RF intelligence to eliminate false positives in contested environments.',
        assignment: 'Design a high-level multi-modal fusion architecture (pseudo-code or diagram) that correlates an incoming acoustic drone signature with RF spectrum data, specifically handling cases where one modality is suddenly jammed.',
        skills: ['Python', 'Signal Processing', 'Sensor Fusion', 'PyTorch']
    },
    {
        id: 'intern-sdr',
        title: 'SDR & Mesh Networking Intern',
        department: 'Internships',
        location: 'On-site',
        type: '3 Months',
        compensation: 'Unpaid (High Learning)',
        description: 'Assist in developing our MANET mesh networking backbone. Work with USRP E310 SDRs and frequency-hopping algorithms to ensure our MANET radios maintain connectivity in GPS-denied, EW-heavy zones.',
        assignment: 'Write a GNU Radio flowgraph or a Python pseudo-code implementation for a basic frequency-hopping spread spectrum (FHSS) synchronization loop that recovers from intermittent jamming.',
        skills: ['SDR', 'GNU Radio', 'C++', 'Networking']
    },
    {
        id: 'intern-hardware',
        title: 'Hardware & Mechanical Intern',
        department: 'Internships',
        location: 'On-site',
        type: '3 Months',
        compensation: 'Unpaid (High Learning)',
        description: 'Focus on the physical defense layer: from AeroGuard aerodynamic cones to the vertical launch canisters of our Interceptors, and the reinforced hull of the autonomous surface vehicle.',
        assignment: 'Design a CAD conceptual mechanism for a waterproof vertical-launch canister system that securely holds a 2kg interceptor and ejects it rapidly upon receiving an electronic trigger.',
        skills: ['CAD/SolidWorks', 'Mechanical Engineering', 'Rapid Prototyping']
    },
    {
        id: 'lead-vidur',
        title: 'Director of Sovereign Edge OS',
        department: 'Leadership',
        location: 'Remote',
        type: 'Full-time',
        compensation: 'Significant Equity',
        description: 'Lead the architecture of our Sovereign Edge OS. Ensure our air-gapped machine learning models and continuous OTA update pipelines operate securely across our global mesh network without any cloud dependency.',
        assignment: 'Draft a security architecture document detailing how a sovereign edge operating system prevents model poisoning and ensures secure OTA updates in a zero-trust, cloud-denied mesh environment.',
        skills: ['Sovereign OS Architecture', 'Zero-Trust Security', 'Edge AI', 'Team Leadership']
    },
    {
        id: 'lead-defense',
        title: 'Chief Drone Swarm Architect',
        department: 'Leadership',
        location: 'Remote / On-site',
        type: 'Full-time',
        compensation: 'Significant Equity',
        description: 'Architect the C2 logic for our networked kinetic effectors. Design the swarm intelligence that integrates telemetry from our high-altitude aerial radar drone for mid-flight interceptor retargeting.',
        assignment: 'Outline a C2 logic flowchart for the mid-flight retargeting of a 5-drone interceptor swarm based on real-time telemetry from an aerial top-down radar drone when the primary target employs evasive maneuvers.',
        skills: ['Swarm Intelligence', 'C2 Architecture', 'Aerospace Engineering', 'Systems Integration']
    },
    {
        id: 'lead-sales',
        title: 'Director of Public Sector Sales',
        department: 'Leadership',
        location: 'Remote',
        type: 'Full-time',
        compensation: 'Equity + Commission',
        description: 'Drive adoption of Skhy systems within global government and defense sectors. Leverage our asymmetric cost advantage to win contracts against legacy systems.',
        assignment: 'Draft an executive summary for a DIU (Defense Innovation Unit) proposal contrasting the cost-effectiveness, passive detection, and rapid deployment of our $351K 50km² perimeter defense against traditional legacy defense systems.',
        skills: ['Govt Procurement', 'Defense Sales', 'Strategic Partnerships', 'Proposal Writing']
    },
    {
        id: 'eng-firmware',
        title: 'Lead Edge Firmware Engineer',
        department: 'Engineering',
        location: 'Hybrid',
        type: 'Full-time',
        compensation: 'Equity',
        description: 'Design mission-critical real-time firmware for our Jamming-Resilient Edge AI & RF Fusion nodes. Work with NVIDIA Orin Nano and Xilinx FPGAs to maximize inference performance per watt in hostile field conditions.',
        assignment: 'Provide an architecture or C++ code sample for an RTOS-based network driver that dynamically switches between multiple MANET radio interfaces based on Link Quality Indicator (LQI) to maintain OTA channels.',
        skills: ['C/C++', 'RTOS', 'NVIDIA Orin / FPGA', 'Hardware Abstraction']
    },
    {
        id: 'eng-automl',
        title: 'Senior AutoML & Edge AI Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        compensation: 'Equity',
        description: 'Own the AutoML Continuous Improvement Loop. Design systems where edge nodes compress false-positive sensor data, send it via low-bandwidth mesh for retraining, and receive quantized model updates over-the-air.',
        assignment: 'Design a federated learning or continuous AutoML pipeline where edge nodes compress false-positive audio samples, send them via a low-bandwidth mesh, and receive quantized model updates without cloud access.',
        skills: ['AutoML', 'Model Quantization', 'Edge Inference', 'PyTorch']
    },
    {
        id: 'eng-marine',
        title: 'Naval Systems & Maritime Engineer',
        department: 'Engineering',
        location: 'On-site',
        type: 'Full-time',
        compensation: 'Equity',
        description: 'Extend our capabilities into Maritime Domain Awareness. Focus on autonomous surface vehicles, subsea Distributed Acoustic Sensing (DAS), and Buoy-Mounted Jamming-Resilient Edge AI nodes.',
        assignment: 'Develop a threat classification state machine for an autonomous surface vehicle (USV) to track, verify, and intercept a "dark vessel" using fused AIS data and onboard acoustic sensors.',
        skills: ['Maritime Domain Awareness', 'Robotics/ROS', 'Naval Systems', 'Sensor Fusion']
    },
    {
        id: 'sales-affiliate',
        title: 'Defense Tech Affiliate & Integrator',
        department: 'Sales',
        location: 'Remote',
        type: 'Contract',
        compensation: 'Tiered Commission',
        description: 'Expand our click-to-buy hardware marketplace footprint. Leverage our 10-tier commission structure to onboard private military contractors, maritime security companies, and critical infrastructure operators.',
        assignment: 'Map out a tiered 30-day go-to-market plan detailing how you would onboard 5 new private maritime security companies as distributors for autonomous interception surface vessels and buoy-mounted sensor nodes.',
        skills: ['B2B Sales', 'Affiliate Marketing', 'Maritime Security Network', 'Growth Hacking']
    }
];

const Careers: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

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

    const handleApply = (role: Role) => {
        const subject = encodeURIComponent(`Application for: ${role.title}`);
        const body = encodeURIComponent(`Hi Skhy Team,\\n\\nI am applying for the ${role.title} position.\\n\\n[Please attach your resume and a brief introduction]\\n\\n[Link to Assignment Submission: Insert GitHub/Notion/Drive Link Here]`);
        window.location.href = `mailto:contact@skhy.systems?subject=${subject}&body=${body}`;
    };

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
                                    <div key={role.id} className="group">
                                        <div 
                                            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] cursor-pointer transition-colors"
                                            onClick={() => setSelectedRole(role)}
                                        >
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
                                    </div>
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

            {/* Job Details Modal / Side Panel */}
            {selectedRole && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRole(null)}>
                    <div 
                        className="w-full max-w-2xl bg-[#0a111a] border-l border-white/10 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{selectedRole.title}</h2>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 uppercase tracking-widest font-bold">
                                        <span className="flex items-center text-turquoise-400"><Briefcase className="w-4 h-4 mr-2" /> {selectedRole.department}</span>
                                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {selectedRole.location}</span>
                                        <span>{selectedRole.type}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedRole(null)}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">About the Role</h3>
                                    <p className="text-gray-300 leading-relaxed text-base">{selectedRole.description}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Required Skills</h3>
                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                        {selectedRole.skills.map(skill => <li key={skill}>{skill}</li>)}
                                    </ul>
                                </div>

                                <div className="bg-turquoise-500/10 border border-turquoise-500/20 rounded-lg p-5">
                                    <h3 className="text-xs font-bold text-turquoise-400 uppercase tracking-widest mb-2">Required Assignment</h3>
                                    <p className="text-gray-300 text-sm italic leading-relaxed">{selectedRole.assignment}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Compensation</h3>
                                    <p className="text-gray-300 font-bold">{selectedRole.compensation}</p>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/10">
                                <button 
                                    onClick={() => handleApply(selectedRole)}
                                    className="w-full bg-turquoise-500 hover:bg-turquoise-400 text-black font-bold py-4 rounded transition-colors flex items-center justify-center uppercase tracking-widest"
                                >
                                    Submit Application <ExternalLink className="w-4 h-4 ml-2" />
                                </button>
                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Ensure your assignment link is included in the application email.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Careers;
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
