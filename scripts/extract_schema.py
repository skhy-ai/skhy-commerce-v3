import json
import os

# Path to the output file from the SQL execution
output_file = r'C:\Users\localasus2023\.gemini\antigravity\brain\b5878b5b-6264-41b0-9a39-719863ef14b2\.system_generated\steps\396\output.txt'
target_file = r'c:\Projects\skhyai-website\skhy-ai-website-main\supabase\migrations\latest_schema_details.sql'

def extract_ddl():
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            wrapper_json = json.load(f)
        
        content = wrapper_json.get('result', '')
        
        # The output contains some wrapping text from the MCP tool
        # We need to find the JSON part between the markers
        start_marker = '<untrusted-data-3588973c-6292-429c-bc53-652fc5552be4>'
        end_marker = '</untrusted-data-3588973c-6292-429c-bc53-652fc5552be4>'
        
        start_idx = content.find(start_marker)
        if start_idx != -1:
            start_idx += len(start_marker)
        
        end_idx = content.find(end_marker)
        
        if start_idx == -1 or end_idx == -1:
            # Try to find the first '[' and last ']' if markers aren't there
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            
        json_str = content[start_idx:end_idx].strip()
        data = json.loads(json_str)
        
        ddl_parts = []
        for item in data:
            if item and isinstance(item, dict) and item.get('complete_ddl'):
                ddl_parts.append(item['complete_ddl'])
        
        full_ddl = "\n".join(ddl_parts)
        
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(full_ddl)
            
        print(f"Successfully wrote {len(ddl_parts)} DDL chunks to {target_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    extract_ddl()
