import sys
import re

file_path = r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Search state and lucide icon
content = content.replace(
    "import { ArrowLeft, ArrowRight, Rocket, GraduationCap, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';",
    "import { ArrowLeft, ArrowRight, Rocket, GraduationCap, CheckCircle2, Search } from 'lucide-react';"
)
content = content.replace(
    "    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);",
    "    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);\n    const [searchQuery, setSearchQuery] = useState('');\n\n    const filterRoles = (roles: Role[]) => {\n        if (!searchQuery) return roles;\n        const query = searchQuery.toLowerCase();\n        return roles.filter(r => \n            r.title.toLowerCase().includes(query) ||\n            r.description.toLowerCase().includes(query) ||\n            r.skills.some(s => s.toLowerCase().includes(query)) ||\n            r.assignment.toLowerCase().includes(query)\n        );\n    };"
)

# 2. Add Search Input UI and Banner
old_header = """                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-turquoise-400">
                        Join the Frontline of Sovereign AI
                    </h1>
                    <div className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto space-y-4">
                        <p>
                            Skhy is building the nervous system for sovereign defense and critical infrastructure. We are actively seeking visionary builders, deep-tech dreamers, and patriots who want to push the boundaries of AI, Edge Computing, and multi-domain sensor fusion.
                        </p>
                        <p className="text-base text-gray-400">
                            Our mission is to deploy fully autonomous, jamming-resilient, and sovereign technologies that protect nations and enterprises from evolving asymmetric threats. When you join Skhy, you're not just taking a job—you're securing the future.
                        </p>
                    </div>
                </div>"""

new_banner = """                <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/careers_banner.png')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050a14] via-[#050a14]/80 to-transparent"></div>
                    <div className="relative z-10 p-10 md:p-16 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                            Join the Frontline of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-turquoise-400">Sovereign AI</span>
                        </h1>
                        <div className="text-lg md:text-xl text-gray-300 space-y-4">
                            <p>
                                Skhy is building the nervous system for sovereign defense and critical infrastructure. We are actively seeking visionary builders, deep-tech dreamers, and patriots who want to push the boundaries of AI, Edge Computing, and multi-domain sensor fusion.
                            </p>
                            <p className="text-base text-gray-400">
                                Our mission is to deploy fully autonomous, jamming-resilient, and sovereign technologies that protect nations and enterprises from evolving asymmetric threats. When you join Skhy, you're not just taking a job—you're securing the future.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="mb-12">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search roles, skills, or assignments..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-turquoise-500 transition-colors"
                        />
                    </div>
                </div>"""
content = content.replace(old_header, new_banner)

# 3. Update category rendering
content = content.replace('<div className="grid md:grid-cols-2 gap-8 mb-16">', '<div className="flex flex-col gap-16 mb-24">')

old_intern_wrapper = """                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Internships</h2>
                                <p className="text-sm text-gray-400">3 Months • Unpaid • High Impact</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {internships.map(role => ("""
new_intern_wrapper = """                    {filterRoles(internships).length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Internships</h2>
                                <p className="text-base text-gray-400">3 Months • Unpaid • High Impact</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {filterRoles(internships).map(role => ("""
content = content.replace(old_intern_wrapper, new_intern_wrapper)

old_eng_wrapper = """                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Engineering Roles</h2>
                                <p className="text-sm text-gray-400">1 year • Equity • High Impact</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {engineeringRoles.map(role => ("""
new_eng_wrapper = """                    </div>
                    )}
                    
                    {filterRoles(engineeringRoles).length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Engineering Roles</h2>
                                <p className="text-base text-gray-400">Equity Based • High Impact</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {filterRoles(engineeringRoles).map(role => ("""
content = content.replace(old_eng_wrapper, new_eng_wrapper)


old_lead_wrapper = """                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-turquoise-500/20 flex items-center justify-center text-turquoise-400">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Senior Leadership</h2>
                                <p className="text-sm text-gray-400">Equity Based • Founding Team</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {leadershipRoles.map(role => ("""
new_lead_wrapper = """                    </div>
                    )}

                    {filterRoles(leadershipRoles).length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                            <div className="w-12 h-12 rounded-lg bg-turquoise-500/20 flex items-center justify-center text-turquoise-400">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Senior Leadership</h2>
                                <p className="text-base text-gray-400">Equity Based • Founding Team</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {filterRoles(leadershipRoles).map(role => ("""
content = content.replace(old_lead_wrapper, new_lead_wrapper)


old_sales_wrapper = """                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Sales & Growth</h2>
                                <p className="text-sm text-gray-400">Commission Based • Global Reach</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {salesRoles.map(role => ("""
new_sales_wrapper = """                    </div>
                    )}

                    {filterRoles(salesRoles).length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Sales & Growth</h2>
                                <p className="text-base text-gray-400">Commission Based • Global Reach</p>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {filterRoles(salesRoles).map(role => ("""
content = content.replace(old_sales_wrapper, new_sales_wrapper)

content = content.replace("                        </div>\n                    </div>\n                </div>\n\n                {/* Application Bar */}", "                        </div>\n                    </div>\n                    )}\n                </div>\n\n                {/* Application Bar */}")

# 4. Increase RoleCard Font Sizes
old_role_card = r'const RoleCard: React\.FC<\{.*?export default Careers;'
new_role_card = """const RoleCard: React.FC<{
    role: Role;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ role, isSelected, onSelect }) => {
    return (
        <div
            className={`border-b border-white/10 last:border-0 py-8 transition-colors ${
                isSelected ? 'bg-white/5 rounded-xl' : ''
            }`}
        >
            <div className="flex items-start gap-4 cursor-pointer px-4" onClick={() => onSelect()}>
                <div className={`mt-1.5 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-turquoise-500 border-turquoise-500' : 'border-gray-500'
                }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-black" />}
                </div>
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-white tracking-wide">{role.title}</h3>
                        <span className="text-sm font-bold text-turquoise-400 uppercase tracking-widest mt-1 md:mt-0">{role.compensation}</span>
                    </div>
                    
                    <p className="text-base text-gray-300 mb-6 leading-relaxed max-w-4xl">{role.description}</p>
                    
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Required Skills</h4>
                        <ul className="list-disc list-inside text-base text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-y-2">
                            {role.skills.map(skill => (
                                <li key={skill} className="text-gray-400"><span className="text-gray-200">{skill}</span></li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-turquoise-500/5 border-l-2 border-turquoise-500 p-4 rounded-lg">
                        <h4 className="text-sm font-bold text-turquoise-400 uppercase tracking-wider mb-2">Required Assignment</h4>
                        <p className="text-base text-gray-300 italic">{role.assignment}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Careers;"""

content = re.sub(old_role_card, new_role_card, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
