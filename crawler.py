import os
import base64
import json
import re
from pathlib import Path
from datetime import datetime

# VERSION: 20260103223027
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

def process_string_into_tags(input_str, is_filename=False):
    if is_filename and "_" not in input_str: return []
    tags = []
    if is_filename:
        root, ext = os.path.splitext(input_str)
        if ext:
            tags.append("<" + ext[1:].upper() + ">")
        input_str = root
    segments = re.split(r'[_\\/]', input_str)
    for s in segments:
        s = s.strip()
        if not s or (s.startswith('(') and s.endswith(')')): continue
        tags.append(s.upper())
    return tags

def load_cfg():
    if not os.path.exists(CFG_FILE): 
        return []
    parsed_entries = []
    try:
        with open(CFG_FILE, "r", encoding="utf-8-sig") as f:
            for line in f:
                line = line.strip()
                if not line: continue
                parts = line.split('|')
                scan_p = parts[0].strip()
                out_p = parts[1].strip() if len(parts) > 1 else None
                parsed_entries.append({"scan": scan_p, "output": out_p})
        return parsed_entries
    except Exception as e:
        print(f"Warning: Could not read config: {e}")
        return []

def save_cfg(config_entries):
    try:
        with open(CFG_FILE, "w", encoding="utf-8") as f:
            for entry in config_entries:
                line = entry['scan']
                if entry.get('output'):
                    line += f"|{entry['output']}"
                f.write(line + "\n")
    except Exception as e:
        print(f"\nError: Could not save config file: {e}")

def scan_directory(scan_dir, is_mobile):
    results = []
    for root, dirs, files in os.walk(scan_dir):
        dirs[:] = [d for d in dirs if not d.startswith('_')]
        rel_path = os.path.relpath(root, scan_dir)
        folder_tags = ["ROOT"] if rel_path == "." else process_string_into_tags(rel_path)
        for file in files:
            if file.lower().endswith(EXTENSIONS):
                full_path = os.path.join(root, file)
                name_base = os.path.splitext(file)[0]
                file_tags = process_string_into_tags(file, is_filename=True)
                combined = list(set(folder_tags + file_tags))
                src = get_image_source(full_path, is_mobile)
                if src:
                    results.append({
                        "n": file.upper(),
                        "t": combined,
                        "p": src
                    })
    return results

def main():
    global CFG_FILE
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        CFG_FILE = os.path.join(script_dir, CFG_FILE)

        config_entries = load_cfg()
        
        print("\n--- DIRECTORY SELECTION ---")
        if not config_entries:
            print("(No saved paths found in config)")
        else:
            for i, entry in enumerate(config_entries):
                out_info = f" [Out: {entry['output']}]" if entry['output'] else ""
                print(f"{i+1}) {entry['scan']}{out_info}")
        
        user_input = input(f"\nSelect #, enter path (scan|out), '.' (current), or '*' (all): ").strip()
        
        to_scan = []
        target_output_raw = None

        if user_input == "*":
            to_scan = [e['scan'] for e in config_entries]
        elif user_input == ".":
            to_scan = [script_dir]
        elif user_input.isdigit() and 0 < int(user_input) <= len(config_entries):
            selected = config_entries[int(user_input)-1]
            to_scan = [selected['scan']]
            target_output_raw = selected['output']
        else:
            parts = user_input.split('|')
            new_scan = os.path.abspath(os.path.expanduser(parts[0].strip().replace('"', '')))
            new_out = parts[1].strip().replace('"', '') if len(parts) > 1 else None
            
            if os.path.exists(new_scan):
                to_scan = [new_scan]
                target_output_raw = new_out
                match = next((e for e in config_entries if e['scan'] == new_scan), None)
                if not match:
                    config_entries.append({"scan": new_scan, "output": new_out})
                    save_cfg(config_entries)
                elif match['output'] != new_out:
                    match['output'] = new_out
                    save_cfg(config_entries)
            else:
                print(f"Error: Path not found -> {new_scan}")
                input("Press Enter to exit...")
                return

        print("\n--- OUTPUT MODE ---")
        print("1) JSON (File Paths)")
        print("2) JSON (Embedded Base64)")
        mode = input("Choice: ").strip()
        is_mobile = (mode == '2')

        final_data = []
        seen_sources = set()
        for d in to_scan:
            print(f"Scanning: {d}...")
            found = scan_directory(d, is_mobile)
            for item in found:
                if item['p'] not in seen_sources:
                    final_data.append(item)
                    seen_sources.add(item['p'])

        # --- SMART PATH LOGIC ---
        # 1. Start with default name
        filename = f"data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
        final_out_path = os.path.join(script_dir, filename)

        if target_output_raw:
            # Resolve the '.' to the script directory
            if target_output_raw.startswith("."):
                target_output_raw = os.path.join(script_dir, target_output_raw[2:] if target_output_raw.startswith("./") or target_output_raw.startswith(".\\") else target_output_raw[1:])
            
            # Check if user provided a specific .json filename
            if target_output_raw.lower().endswith(".json"):
                final_out_path = os.path.abspath(target_output_raw)
                save_dir = os.path.dirname(final_out_path)
            else:
                save_dir = os.path.abspath(target_output_raw)
                final_out_path = os.path.join(save_dir, filename)
            
            # Ensure the directory exists
            os.makedirs(save_dir, exist_ok=True)

        with open(final_out_path, "w", encoding="utf-8") as f:
            json.dump(final_data, f, indent=2)
        
        print(f"\nSuccess! Generated {final_out_path} with {len(final_data)} entries.")
        input("\nPress Enter to exit...")

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        input("\nPress Enter to close and see error...")

if __name__ == "__main__":
    main()
