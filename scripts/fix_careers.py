import re

# Update Careers.tsx
with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Header
header_search = r"<div className=\"col-span-3 text-right\">Location<\/div>"
header_replace = r'<div className="col-span-3 pl-2">Location</div>'
content = re.sub(header_search, header_replace, content)

# Fix row location alignment
row_search = r"<div className=\"hidden md:flex col-span-3 justify-end items-center text-sm text-gray-400\">\s*<MapPin className=\"w-3 h-3 mr-1\" \/> \{role\.location\}\s*<ChevronRight className=\"w-4 h-4 ml-4 text-gray-600 group-hover:text-turquoise-500 transition-colors\" \/>\s*<\/div>"
row_replace = """<div className="hidden md:flex col-span-3 items-center justify-between text-sm text-gray-400 pl-2">
                                                <div className="flex items-start">
                                                    <MapPin className="w-3 h-3 mr-1.5 mt-1 shrink-0" /> 
                                                    <span className="text-left leading-tight">{role.location}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 ml-2 shrink-0 text-gray-600 group-hover:text-turquoise-500 transition-colors" />
                                            </div>"""
content = re.sub(row_search, row_replace, content)

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Update careers.ts
with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\data\careers.ts', 'r', encoding='utf-8') as f:
    data_content = f.read()

data_content = data_content.replace("'Unpaid (High Learning)'", "'TBD'")
data_content = data_content.replace("\"Unpaid (High Learning)\"", "'TBD'")

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\data\careers.ts', 'w', encoding='utf-8') as f:
    f.write(data_content)

print("Updated Careers.tsx layout and careers.ts compensation.")
