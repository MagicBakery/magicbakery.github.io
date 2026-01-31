import os
import base64
import json
import re
from pathlib import Path
from datetime import datetime

# VERSION: 20260131903
# 20260131: Sort tags ("t") alphabetically within each entry
# 20260131: Sort final output entries by .p
# 20260113: File Extensions go to a tag .EXT
# 20251228: The CFG file can specify an optional output filename after |

EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.url', '.pdf')
CFG_FILE = os.path.splitext(os.path.basename(__file__))[0] + ".cfg"

def get_url_from_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                if line.strip().upper().startswith("URL="):
                    return line.strip()[4:]
    except Exception: return None
    return None

def get_image_source(full_path, is_mobile):
    if full_path.lower().endswith('.url'):
        return get_url_from_file(full_path)
    if is_mobile:
        try:
            with open(full_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode('utf-8')
                ext = os.path.splitext(full_path)[1][1:].lower()
                return f"data:image/{'jpeg' if ext=='jpg' else ext};base64,{b64}"
        except Exception: return None
    else: 
        return Path(full_path).as_uri()

def parse_metadata_from_name(filename):
    """
    Extracts {ID|s|x|y} patterns.
    Returns (cleaned_name, metadata_dict)
    """
    metadata = {}
    filename = os.path.splitext(filename)[0]
    # Find content inside curly braces
    match = re.search(r'\{(.*?)\}', filename)
    if match:
        content = match.group(1)
        parts = content.split('+')
        
        # Part 1 is ID
        if len(parts) > 0: metadata['id'] = parts[0].strip()
        
        # Subsequent parts search for s, x, y prefixes
        for p in parts[1:]:
            p = p.strip().lower()
            if p.startswith('s'): metadata['s'] = float(p[1:])
            elif p.startswith('x'): metadata['x'] = float(p[1:])
            elif p.startswith('y'): metadata['y'] = float(p[1:])
            
        # Remove the curly brace block from the filename for tag processing
        filename = filename.replace(match.group(0), "")
    filename = filename.strip('_ ').strip()
    return filename, metadata

def process_string_into_tags(input_str, is_filename=False):
    if is_filename and "_" not in input_str: return []
    tags = []
    if is_filename:
        root, ext = os.path.splitext(input_str)
        input_str = root
    
    # Split by underscores, slashes, and backslashes
    segments = re.split(r'[_\\/]', input_str)
    for s in segments:
        s = s.strip()
        # Ignore empty or text in parentheses
        if not s or (s.startswith('(') and s.endswith(')')): continue
        tags.append(s.upper())
    return tags

def load_cfg():
    if not os.path.exists(CFG_FILE): return []
    parsed_entries = []
    try:
        with open(CFG_FILE, "r", encoding="utf-8-sig") as f:
            for line in f:
                line = line.strip()
                if not line: continue
                parts = line.split('|')
                parsed_entries.append({"scan": parts[0].strip(), "output": parts[1].strip() if len(parts) > 1 else None})
        return parsed_entries
    except Exception: return []

def save_cfg(config_entries):
    try:
        with open(CFG_FILE, "w", encoding="utf-8") as f:
            for entry in config_entries:
                line = entry['scan'] + (f"|{entry['output']}" if entry.get('output') else "")
                f.write(line + "\n")
    except Exception: pass

def scan_directory(scan_dir, is_mobile):
    results = []
    for root, dirs, files in os.walk(scan_dir):
        dirs[:] = [d for d in dirs if not d.startswith('_')]
        rel_path = os.path.relpath(root, scan_dir)
        folder_tags = ["ROOT"] if rel_path == "." else process_string_into_tags(rel_path)
        
        for file in files:
            if file.lower().endswith(EXTENSIONS):
                full_path = os.path.join(root, file)
                
                # Extract Metadata {ID|s|x|y}
                clean_name, meta = parse_metadata_from_name(file)
                
                # Tagging based on cleaned name
                file_tags = process_string_into_tags(clean_name, is_filename=True)
                combined = list(set(folder_tags + file_tags))
                
                src = get_image_source(full_path, is_mobile)
                if src:
                    # Construct Entry
                    entry = {
                        "n": clean_name.upper(),
                        "t": combined
                    }
                    
                    # If ID exists, path moves to 'u', otherwise stays 'p'
                    if 'id' in meta:
                        entry['p'] = meta['id']
                        entry['u'] = src
                    else:
                        entry['p'] = src
                    
                    # Add Scale/Offset if present
                    if 's' in meta: entry['s'] = meta['s']
                    if 'x' in meta: entry['x'] = meta['x']
                    if 'y' in meta: entry['y'] = meta['y']
                    
                    results.append(entry)
    return results

def main():
    global CFG_FILE
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        CFG_FILE = os.path.join(script_dir, CFG_FILE)
        config_entries = load_cfg()
        
        print("\n--- DIRECTORY SELECTION ---")
        for i, entry in enumerate(config_entries):
            print(f"{i+1}) {entry['scan']}")
        
        user_input = input(f"\nSelect #, enter path (scan|out), '.' (current), or '*' (all): ").strip()
        
        to_scan = []
        target_output_raw = None

        if user_input == "*": to_scan = [e['scan'] for e in config_entries]
        elif user_input == ".": to_scan = [script_dir]
        elif user_input.isdigit() and 0 < int(user_input) <= len(config_entries):
            selected = config_entries[int(user_input)-1]
            to_scan, target_output_raw = [selected['scan']], selected['output']
        else:
            parts = user_input.split('|')
            new_scan = os.path.abspath(os.path.expanduser(parts[0].strip().replace('"', '')))
            if os.path.exists(new_scan):
                to_scan, target_output_raw = [new_scan], parts[1].strip() if len(parts) > 1 else None
                if not any(e['scan'] == new_scan for e in config_entries):
                    config_entries.append({"scan": new_scan, "output": target_output_raw})
                    save_cfg(config_entries)
            else:
                print(f"Error: Path not found -> {new_scan}"); return

        print("\n--- OUTPUT MODE ---\n1) JSON (Paths)\n2) JSON (Base64)")
        is_mobile = (input("Choice: ").strip() == '2')

        final_data = []
        seen_ids = set()
        for d in to_scan:
            found = scan_directory(d, is_mobile)
            for item in found:
                # Deduplicate by ID if exists, otherwise by source
                key = item.get('id') or item.get('u') or item.get('p')
                if key not in seen_ids:
                    # --- TAG SORTING ---
                    # Sort the tags list inside "t" alphabetically
                    if "t" in item and isinstance(item["t"], list):
                        item["t"].sort()
                    
                    final_data.append(item)
                    seen_ids.add(key)

        # --- ENTRY SORTING ---
        # Sort the overall list by the 'p' key (case-insensitive)
        final_data.sort(key=lambda x: str(x.get('p', '')).lower())

        filename = f"data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
        final_out_path = os.path.join(script_dir, filename)
        if target_output_raw:
            # Handle standard path logic
            target_output_raw = target_output_raw.replace("./", script_dir + os.sep)
            if target_output_raw.lower().endswith(".json"):
                final_out_path = os.path.abspath(target_output_raw)
            else:
                os.makedirs(target_output_raw, exist_ok=True)
                final_out_path = os.path.join(target_output_raw, filename)

        with open(final_out_path, "w", encoding="utf-8") as f:
            json.dump(final_data, f, indent=2)
        
        print(f"\nSuccess! Generated {final_out_path} with {len(final_data)} entries.")
        input("\nPress Enter to exit...")

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        input("\nPress Enter to close and see error...")

if __name__ == "__main__":
    main()
