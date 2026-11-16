import re

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\data\careers.ts', 'r', encoding='utf-8') as f:
    d = f.read()

# Replace any occurrence of Skhy AI followed by any number of backslashes and a quote, with just Skhy AI's
d = re.sub(r"Skhy AI\\*'s", "Skhy AI's", d)

# Find the assignments and replace the surrounding single quotes with double quotes
# to prevent any syntax errors from unescaped single quotes inside the string.
# We'll use a regex that finds: assignment: '...' and replaces with assignment: "..."
def replacer(match):
    # The inside of the string is match.group(1)
    inner = match.group(1)
    # Return it wrapped in double quotes
    return f'assignment: "{inner}"'

d = re.sub(r"assignment:\s*'(.*?)'", replacer, d)

with open(r'c:\Projects\skhyai-website\skhy-ai-website-main\src\data\careers.ts', 'w', encoding='utf-8') as f:
    f.write(d)

print("Fixed quotes successfully.")
