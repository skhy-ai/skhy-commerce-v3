import sys

file_path = r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update Interface
content = content.replace(
    "    description: string;\n    skills: string[];",
    "    description: string;\n    assignment: string;\n    skills: string[];"
)

# Intern AI
content = content.replace(
    "skills: ['Python', 'PyTorch/TensorFlow', 'Signal Processing']",
    "assignment: 'Write a Python script that extracts Mel-frequency cepstral coefficients (MFCCs) from an audio file. Bonus: outline how you would compress a neural network to classify these features on an edge device.',\n            skills: ['Python', 'PyTorch/TensorFlow', 'Signal Processing']"
)

# Intern Embedded
content = content.replace(
    "skills: ['C/C++', 'RTOS', 'Hardware Debugging']",
    "assignment: 'Write C/C++ pseudo-code for a real-time interrupt handler that reads data from a mock I2C sensor while maintaining a strict 10ms execution deadline.',\n            skills: ['C/C++', 'RTOS', 'Hardware Debugging']"
)

# Intern Frontend
content = content.replace(
    "skills: ['React', 'TypeScript', 'WebGL/Three.js']",
    "assignment: 'Create a small React component that connects to a mock WebSocket and visualizes an incoming stream of coordinate data (x, y) on a simple HTML5 Canvas or WebGL context.',\n            skills: ['React', 'TypeScript', 'WebGL/Three.js']"
)

# Lead Vidur
content = content.replace(
    "skills: ['System Architecture', 'LLM Security', 'Team Leadership']",
    "assignment: 'Write a 1-page architecture brief on how you would design a secure Over-The-Air (OTA) update system for air-gapped Edge AI nodes in a contested environment with intermittent connectivity.',\n            skills: ['System Architecture', 'LLM Security', 'Team Leadership']"
)

# Lead Defense
content = content.replace(
    "skills: ['RF Engineering', 'Defense Protocols', 'Network Security']",
    "assignment: 'Provide a brief analysis (max 500 words) on mitigating RF jamming for a drone swarm using frequency hopping and decentralized MANET mesh topology.',\n            skills: ['RF Engineering', 'Defense Protocols', 'Network Security']"
)

# Lead Sales
content = content.replace(
    "skills: ['Govt Procurement', 'Defense Sales', 'Strategic Partnerships']",
    "assignment: 'Draft a cold outreach email to a DoD or Ministry of Defense procurement officer pitching a fully autonomous, jamming-resilient perimeter defense system (like our Skhy acoustic network).',\n            skills: ['Govt Procurement', 'Defense Sales', 'Strategic Partnerships']"
)

# Eng Embedded
content = content.replace(
    "skills: ['C/C++', 'RTOS', 'ARM/FPGA', 'Low-level Optimization']",
    "assignment: 'Provide a C++ code sample or detailed explanation of a lock-free queue implementation suitable for passing high-frequency sensor data between threads on an RTOS.',\n            skills: ['C/C++', 'RTOS', 'ARM/FPGA', 'Low-level Optimization']"
)

# Eng ML
content = content.replace(
    "skills: ['PyTorch/TensorFlow', 'Model Optimization', 'Signal Processing', 'Computer Vision']",
    "assignment: 'Submit a notebook or script demonstrating the quantization of a standard PyTorch vision or audio model (e.g., MobileNet) from FP32 to INT8 using Post-Training Quantization (PTQ).',\n            skills: ['PyTorch/TensorFlow', 'Model Optimization', 'Signal Processing', 'Computer Vision']"
)

# Eng Fullstack
content = content.replace(
    "skills: ['React/TypeScript', 'Node.js/Python', 'PostgreSQL', 'WebSockets', 'Cloud Infrastructure']",
    "assignment: 'Design a system architecture diagram and provide a short write-up on how you would scale a WebSocket-based backend to handle 10,000 incoming telemetry streams per second from edge sensors.',\n            skills: ['React/TypeScript', 'Node.js/Python', 'PostgreSQL', 'WebSockets', 'Cloud Infrastructure']"
)

# Sales Affiliate
content = content.replace(
    "skills: ['B2B Sales', 'Affiliate Marketing', 'Defense Network', 'Growth Hacking']",
    "assignment: 'Create a mock 30-day go-to-market plan outlining how you would onboard 5 new defense or security distributors using our 10-tier commission structure.',\n            skills: ['B2B Sales', 'Affiliate Marketing', 'Defense Network', 'Growth Hacking']"
)

# Update handleApply Email body
content = content.replace(
    "const body = encodeURIComponent(`Hi Skhy Team,\\n\\nI am interested in the following roles: ${rolesList}.\\n\\n[Please attach your resume and a brief introduction]`);",
    "const body = encodeURIComponent(`Hi Skhy Team,\\n\\nI am interested in the following roles: ${rolesList}.\\n\\n[Please attach your resume and a brief introduction]\\n\\n[Link to Assignment Submission: Insert GitHub/Notion/Drive Link Here]`);"
)

# Update RoleCard UI
old_ui = """                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">{role.description}</p>
                    <div className="flex flex-wrap gap-2">"""
new_ui = """                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">{role.description}</p>
                    <div className="bg-turquoise-500/10 border border-turquoise-500/20 rounded-lg p-4 mb-4">
                        <h4 className="text-xs font-bold text-turquoise-400 uppercase tracking-wider mb-2">Required Assignment</h4>
                        <p className="text-sm text-gray-300 italic">{role.assignment}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">"""
content = content.replace(old_ui, new_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
