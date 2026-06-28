#!/usr/bin/env python3
import sys
import re

# Regex patterns that might indicate SQL Injection in C++
# Look for sql query variables or execute statements combined with formatting or string concatenation
INJECTION_PATTERNS = [
    # Concatenation with + or += on lines referencing SQL statements
    re.compile(r'(SELECT|INSERT|UPDATE|DELETE|select|insert|update|delete).*?\+'),
    # Format strings containing SQL keywords and variables
    re.compile(r'(std::format|fmt::format|sqlite3_mprintf)\(\s*["\'].*?(SELECT|INSERT|UPDATE|DELETE|select|insert|update|delete).*?["\']\s*,\s*[^)]+?\)'),
    # Using stringstream to build queries
    re.compile(r'stringstream.*?<<.*?(SELECT|INSERT|UPDATE|DELETE|select|insert|update|delete)'),
]

def check_file(filepath):
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            for line_num, line in enumerate(f, 1):
                # Skip comments
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                    continue
                for idx, pattern in enumerate(INJECTION_PATTERNS):
                    if pattern.search(line):
                        issues.append((line_num, line.strip(), idx))
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return issues

def main():
    failed = False
    for filepath in sys.argv[1:]:
        issues = check_file(filepath)
        if issues:
            print(f"\033[31m[SQL SECURITY ERROR] Potential SQL Injection in {filepath}:\033[0m")
            for line, content, pattern_idx in issues:
                print(f"  Line {line}: {content}")
                if pattern_idx == 0:
                    print("    -> Avoid C++ string concatenation (+) for SQL queries. Use parameterized placeholder bindings.")
                elif pattern_idx == 1:
                    print("    -> Avoid string formatting (std::format, fmt::format, or sqlite3_mprintf) to insert variables directly. Bind parameters/placeholders.")
                elif pattern_idx == 2:
                    print("    -> Avoid using std::stringstream to construct queries. Use parameterized placeholder interfaces.")
            print()
            failed = True
    if failed:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    main()
