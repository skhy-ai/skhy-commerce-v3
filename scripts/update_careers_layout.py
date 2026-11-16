import sys
import re

file_path = r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove expandedRole state
content = content.replace(
    "    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);\n    const [expandedRole, setExpandedRole] = useState<string | null>(null);",
    "    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);"
)

# 2. Update all RoleCard usages to remove isExpanded and onExpand
old_role_card_usage = """                                <RoleCard
                                    key={role.id}
                                    role={role}
                                    isSelected={selectedRoles.includes(role.id)}
                                    onSelect={() => toggleRole(role.id)}
                                    isExpanded={expandedRole === role.id}
                                    onExpand={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                                />"""
new_role_card_usage = """                                <RoleCard
                                    key={role.id}
                                    role={role}
                                    isSelected={selectedRoles.includes(role.id)}
                                    onSelect={() => toggleRole(role.id)}
                                />"""
content = content.replace(old_role_card_usage, new_role_card_usage)

# 3. Replace RoleCard component implementation
old_role_card_pattern = r'const RoleCard: React\.FC<\{.*?export default Careers;'

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
                <div className={`mt-1.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-turquoise-500 border-turquoise-500' : 'border-gray-500'
                }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                </div>
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white tracking-wide">{role.title}</h3>
                        <span className="text-xs font-bold text-turquoise-400 uppercase tracking-widest mt-1 md:mt-0">{role.compensation}</span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-6 leading-relaxed max-w-4xl">{role.description}</p>
                    
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Required Skills</h4>
                        <ul className="list-disc list-inside text-sm text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-y-2">
                            {role.skills.map(skill => (
                                <li key={skill} className="text-gray-400"><span className="text-gray-200">{skill}</span></li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-turquoise-500/5 border-l-2 border-turquoise-500 p-4">
                        <h4 className="text-xs font-bold text-turquoise-400 uppercase tracking-wider mb-2">Required Assignment</h4>
                        <p className="text-sm text-gray-300 italic">{role.assignment}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Careers;"""

content = re.sub(old_role_card_pattern, new_role_card, content, flags=re.DOTALL)

# 4. Remove space-y-4 class from the containers that hold the RoleCards so the borders touch nicely.
content = content.replace('className="space-y-4"', 'className="flex flex-col"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
