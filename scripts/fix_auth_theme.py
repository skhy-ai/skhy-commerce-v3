import os
import re

files_to_process = [
    r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Login.tsx',
    r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Register.tsx',
    r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\CustomerRegister.tsx',
    r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\ForgotPassword.tsx',
    r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\ResetPassword.tsx',
]

def process_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace gradients and colorful elements
    content = content.replace("bg-gradient-to-br from-gray-900 via-gray-800 to-black", "bg-[#050a14]")
    content = content.replace("bg-gradient-to-br from-gray-800/50 to-gray-900/50", "bg-[#0a0a0a]")
    
    # Button replacements
    content = content.replace("bg-gradient-to-r from-blue-500 to-purple-600 text-white", "bg-[#00f0ff] text-black")
    content = content.replace("hover:from-blue-600 hover:to-purple-700", "hover:bg-white hover:text-black")
    
    # Text colors
    content = content.replace("text-blue-400", "text-[#00f0ff]")
    content = content.replace("hover:text-blue-300", "hover:text-white")
    content = content.replace("text-blue-500", "text-[#00f0ff]")
    
    # Focus rings / inputs
    content = content.replace("focus:ring-blue-500", "focus:border-[#00f0ff] focus:ring-0")
    content = content.replace("bg-blue-500/20 text-blue-400", "bg-[#00f0ff]/10 text-[#00f0ff]")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for fp in files_to_process:
    process_file(fp)

print("Updated login/register themes.")
