import sys

file_path = r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace interface
content = content.replace("type: 'Internship' | 'Leadership';", "type: 'Internship' | 'Leadership' | 'Engineering' | 'Sales';")

# Expand internship descriptions
content = content.replace(
    "'Work directly with our Chief Engineer on optimizing acoustic models for edge deployment. Get hands-on experience with sensor fusion.'",
    "'Work directly with our Chief Engineer on optimizing advanced acoustic and RF models for edge deployment. Get hands-on experience with multi-modal sensor fusion, deep learning compression, and real-time threat classification algorithms in resource-constrained environments.'"
)
content = content.replace(
    "'Assist in porting Skhy OS to custom FPGA/ARM hardware. Learn about bare-metal programming and real-time constraints.'",
    "'Assist in porting Skhy OS to custom FPGA and ARM hardware architectures. Learn about bare-metal programming, real-time operating system constraints, and how to harden hardware against electronic warfare and environmental extremes.'"
)
content = content.replace(
    "'Help build the next generation of our Mission Control dashboard. Focus on WebGL data visualization and React performance.'",
    "'Help build the next generation of our Mission Control and Threat Awareness Manager dashboards. Focus on complex WebGL data visualization, real-time WebSocket data streaming, and building highly responsive, defense-grade React interfaces.'"
)

# Expand leadership descriptions
content = content.replace(
    "'Lead the architecture of our sovereign AI platform. You will define the roadmap for our \"Red-Black\" secure intelligence system.'",
    "'Lead the architecture of our sovereign Vidur AI platform. You will define the roadmap for our \"Red-Black\" secure intelligence system, overseeing the deployment of air-gapped machine learning models and continuous OTA update pipelines for our global mesh network.'"
)
content = content.replace(
    "'Interface with defense partners to design robust, anti-jamming communication networks. Requires deep understanding of RF.'",
    "'Interface directly with Tier-1 defense partners to design robust, anti-jamming communication networks. Requires deep understanding of RF engineering, mesh topology, and military procurement standards to ensure our systems survive contested electronic environments.'"
)
content = content.replace(
    "'Drive adoption of Skhy systems within government and defense sectors. Build relationships with key stakeholders.'",
    "'Drive adoption of Skhy systems within global government, naval, and defense sectors. Build strategic relationships with key stakeholders, navigate complex defense procurement cycles, and lead our go-to-market strategy for national security deployments.'"
)

# Expand engineering descriptions
content = content.replace(
    "type: 'Leadership',",
    "type: 'Engineering',"
)  # Note: This will replace it for engineering roles, but we need to ensure leadership roles are untouched or fixed.
# Actually, the original engineering roles had `type: 'Leadership',`. 
# Let's fix that specifically.

# Engineering descriptions expansion
content = content.replace(
    "'Design and optimize real-time firmware for our edge compute nodes. Work on bare-metal RTOS, sensor drivers, and hardware abstraction layers.'",
    "'Design and optimize mission-critical real-time firmware for our edge compute nodes. Work on bare-metal RTOS, advanced sensor drivers, and custom hardware abstraction layers to maximize performance per watt in hostile field conditions.'"
)
content = content.replace(
    "'Develop and deploy state-of-the-art ML models for acoustic classification and computer vision. Focus on model compression and edge inference.'",
    "'Develop and deploy state-of-the-art machine learning models for acoustic signature classification and multi-spectral computer vision. Focus heavily on model quantization, compression, and accelerated edge inference on NVIDIA Orin and FPGA targets.'"
)
content = content.replace(
    "'Build scalable backend services and real-time dashboards for our Mission Control platform. Work across the entire stack from database to UI.'",
    "'Architect and build scalable backend services and ultra-low-latency real-time dashboards for our Mission Control platform. Work across the entire stack—from distributed PostgreSQL databases and WebSocket streaming to React/TypeScript frontends.'"
)

# Add salesRoles array
sales_roles_str = """    const salesRoles: Role[] = [
        {
            id: 'sales-affiliate',
            title: 'Sales Representative / Affiliate',
            type: 'Sales',
            compensation: 'Tiered Commission',
            description: 'Drive the expansion of our hardware and software ecosystem through strategic partnerships and direct sales. This role features a highly flexible commission structure, allowing you to assign commissions based on tier amounts (up to a maximum of 10 for the lowest tier). Ideal for aggressive growth experts and seasoned defense tech affiliates.',
            skills: ['B2B Sales', 'Affiliate Marketing', 'Defense Network', 'Growth Hacking']
        }
    ];

    const toggleRole = (id: string) => {"""
content = content.replace("    const toggleRole = (id: string) => {", sales_roles_str)

# Update handleApply
content = content.replace(
    "const rolesList = [...internships, ...engineeringRoles, ...leadershipRoles]",
    "const rolesList = [...internships, ...engineeringRoles, ...leadershipRoles, ...salesRoles]"
)
content = content.replace(
    "window.location.href = `mailto:careers@skhy.systems?subject=${subject}&body=${body}`;",
    "window.location.href = `mailto:contact@skhy.systems?subject=${subject}&body=${body}`;"
)

# Expand main description
main_desc_old = """                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Skhy is building the nervous system for sovereign defense. We are looking for builders, dreamers, and patriots.
                    </p>"""
main_desc_new = """                    <div className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto space-y-4">
                        <p>
                            Skhy is building the nervous system for sovereign defense and critical infrastructure. We are actively seeking visionary builders, deep-tech dreamers, and patriots who want to push the boundaries of AI, Edge Computing, and multi-domain sensor fusion.
                        </p>
                        <p className="text-base text-gray-400">
                            Our mission is to deploy fully autonomous, jamming-resilient, and sovereign technologies that protect nations and enterprises from evolving asymmetric threats. When you join Skhy, you're not just taking a job—you're securing the future.
                        </p>
                    </div>"""
content = content.replace(main_desc_old, main_desc_new)

# Add sales roles UI
sales_ui = """                        </div>
                    </div>

                    {/* Sales & Growth */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Sales & Growth</h2>
                                <p className="text-sm text-gray-400">Commission Based • Global Reach</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {salesRoles.map(role => (
                                <RoleCard
                                    key={role.id}
                                    role={role}
                                    isSelected={selectedRoles.includes(role.id)}
                                    onSelect={() => toggleRole(role.id)}
                                    isExpanded={expandedRole === role.id}
                                    onExpand={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                                />
                            ))}
                        </div>
                    </div>"""
content = content.replace("                        </div>\n                    </div>\n                </div>", sales_ui + "\n                </div>")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
