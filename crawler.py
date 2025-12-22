import os
import base64
import json
import re
from pathlib import Path
from datetime import datetime

# VERSION: 20251222014400

EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.url')
# Initialize with just the name; we will build the full path inside main
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
    segments = re.split(r'[_\\/]', input_str)
    tags = []
    for s in segments:
        s = s.strip()
        if not s or (s.startswith('(') and s.endswith(')')): continue
        tags.append(s.upper())
    return tags

def load_cfg():
    if not os.path.exists(CFG_FILE): 
        return []
    try:
        with open(CFG_FILE, "r", encoding="utf-8-sig") as f:
            return [line.strip() for line in f if line.strip()]
    except Exception as e:
        print(f"Warning: Could not read config: {e}")
        return []

def save_cfg(paths):
    try:
        with open(CFG_FILE, "w", encoding="utf-8") as f:
            for p in sorted(list(set(paths))):
                f.write(p + "\n")
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
                file_tags = process_string_into_tags(name_base, is_filename=True)
                combined = list(set(folder_tags + file_tags))
                src = get_image_source(full_path, is_mobile)
                if src:
                    results.append({
                        "n": file.upper(),
                        "t": combined,
                        "p": src,
                        "f": Path(root).as_uri() if not is_mobile else ""
                    })
    return results

def main():
    global CFG_FILE  # MUST declare global before any assignments
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        CFG_FILE = os.path.join(script_dir, CFG_FILE)

        paths = load_cfg()
        
        print("\n--- DIRECTORY SELECTION ---")
        if not paths:
            print("(No saved paths found in config)")
        else:
            for i, p in enumerate(paths):
                print(f"{i+1}) {p}")
        
        user_input = input(f"\nSelect #, enter path, '.' (current), or '*' (all): ").strip()
        
        to_scan = []
        if user_input == "*":
            to_scan = paths
        elif user_input == ".":
            to_scan = [script_dir]
        elif user_input.isdigit() and 0 < int(user_input) <= len(paths):
            to_scan = [paths[int(user_input)-1]]
        else:
            new_path = os.path.abspath(os.path.expanduser(user_input.replace('"', '')))
            if os.path.exists(new_path):
                to_scan = [new_path]
                if new_path not in paths:
                    paths.append(new_path)
                    save_cfg(paths)
            else:
                print(f"Error: Path not found -> {new_path}")
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

        out_name = os.path.join(script_dir, f"data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
        with open(out_name, "w", encoding="utf-8") as f:
            json.dump(final_data, f, indent=2)
        
        print(f"\nSuccess! Generated {out_name} with {len(final_data)} entries.")
        input("\nPress Enter to exit...")

    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        input("\nPress Enter to close and see error...")

if __name__ == "__main__":
    main()
