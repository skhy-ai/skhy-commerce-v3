import re

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\NDA.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add selectedEntity state
state_search = r"const \[step, setStep\] = useState<number>\(1\);"
state_replace = r"const [step, setStep] = useState<number>(1);\n    const [selectedEntity, setSelectedEntity] = useState<'MY' | 'IN'>('MY');"
content = re.sub(state_search, state_replace, content)

# 2. Update token decoding
token_decode_search = r"setFormData\(decoded\);\n\s*setStep\(3\);"
token_decode_replace = r"setFormData(decoded);\n                    if (decoded.selectedEntity) setSelectedEntity(decoded.selectedEntity);\n                    setStep(3);"
content = re.sub(token_decode_search, token_decode_replace, content)

# 3. Replace skhyDetails
skhy_details_search = r"const skhyDetails = \{\s*name: \"SKHY AI SOLUTIONS\",\s*reg: \"202503090021 \(003714996-M\)\",\s*address: \"52, Jalan LEP 6/29, Lestari Putra, 43300 Seri Kembangan, Selangor, Malaysia\"\s*\};"
skhy_details_replace = """const skhyEntities = {
        MY: {
            name: "SKAND TECHNOLOGIES SDN. BHD.",
            reg: "202601038169 (1700264-U)",
            address: "52, Jalan LEP 6/29, Lestari Putra, 43300 Seri Kembangan, Selangor, Malaysia"
        },
        IN: {
            name: "SKAND DEV TECHNOLOGIES (OPC) PRIVATE LIMITED",
            reg: "U62010UP2025OPC235270",
            address: "1386, SHESHPUR, MAHARAJGANJ, Munderi, Maharajganj, Mahrajganj, Uttar Pradesh, India, 273151"
        }
    };
    const skhyDetails = skhyEntities[selectedEntity];"""
content = re.sub(skhy_details_search, skhy_details_replace, content)

# 4. Update UI in Step 1
ui_search = r"<h2 className=\"text-2xl font-bold mb-8 flex items-center gap-3\">\s*<Building2 className=\"text-sky-400\" /> Company Details\s*</h2>"
ui_replace = """<h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <Building2 className="text-sky-400" /> Company Details
                                </h2>

                                <div className="mb-8 p-6 bg-sky-500/5 border border-sky-500/20 rounded-2xl">
                                    <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Contracting Entity *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEntity('MY')}
                                            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${selectedEntity === 'MY' ? 'bg-sky-500/20 border-sky-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                                        >
                                            <span className="font-bold">Malaysia Headquarters</span>
                                            <span className="text-xs opacity-70">SKAND TECHNOLOGIES SDN. BHD.</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEntity('IN')}
                                            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${selectedEntity === 'IN' ? 'bg-sky-500/20 border-sky-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                                        >
                                            <span className="font-bold">India Subsidiary</span>
                                            <span className="text-xs opacity-70">SKAND DEV TECHNOLOGIES (OPC) PVT LTD</span>
                                        </button>
                                    </div>
                                </div>"""
content = re.sub(ui_search, ui_replace, content)

# 5. Update token encoding
token_encode_search = r"const token = btoa\(JSON.stringify\(formData\)\);"
token_encode_replace = r"const token = btoa(JSON.stringify({ ...formData, selectedEntity }));"
content = re.sub(token_encode_search, token_encode_replace, content)

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\NDA.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated NDA.tsx with multiple entities successfully.")
