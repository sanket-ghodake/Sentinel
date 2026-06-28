#!/usr/bin/env python3
import os
import re

def fix_code_blocks(content):
    lines = content.split('\n')
    new_lines = []
    in_code_block = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('```'):
            # Check if this is a fence
            # Fences start with ```
            # Let's count backticks
            backticks = re.match(r'^`{3,}', stripped)
            if backticks:
                fence_len = len(backticks.group(0))
                # It's a code block toggle
                if in_code_block:
                    # Closing fence
                    in_code_block = False
                else:
                    # Opening fence
                    in_code_block = True
                    # If it has no language specifier, add 'text'
                    if len(stripped) == fence_len:
                        line = line + 'text'
        new_lines.append(line)
    return '\n'.join(new_lines)

def main():
    # File lists to fix MD001, MD036, MD040
    target_dirs = ['docs']
    for target_dir in target_dirs:
        if not os.path.exists(target_dir):
            continue
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                if file.endswith('.md'):
                    path = os.path.join(root, file)
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    original_content = content

                    # 1. Fix fenced code blocks without language
                    content = fix_code_blocks(content)

                    # 2. Specific file fixes
                    basename = os.path.basename(path)

                    if basename == 'spec_001_product_vision.md':
                        content = content.replace('### Primary', '## Primary')
                        content = content.replace('### Secondary', '## Secondary')
                        content = content.replace('### Enterprise', '## Enterprise')
                        content = content.replace('### Open Source', '## Open Source')

                    elif basename == 'idea.md':
                        content = content.replace('### Principle 1', '## Principle 1')
                        content = content.replace('### Principle 2', '## Principle 2')
                        content = content.replace('### Principle 3', '## Principle 3')
                        content = content.replace('### Principle 4', '## Principle 4')
                        content = content.replace('### Principle 5', '## Principle 5')

                    elif basename == 'spec_003.md':
                        content = content.replace('### Apple', '## Apple')
                        content = content.replace('### GitHub', '## GitHub')
                        content = content.replace('### Linear', '## Linear')
                        content = content.replace('### Docker Desktop', '## Docker Desktop')
                        content = content.replace('### Arc Browser', '## Arc Browser')
                        content = content.replace('### Figma', '## Figma')
                        content = content.replace('### GitKraken', '## GitKraken')
                        content = content.replace('### Beyond Compare', '## Beyond Compare')

                    elif basename == 'spec_001.md':
                        content = content.replace('### Primary', '## Primary')
                        content = content.replace('### Secondary', '## Secondary')
                        content = content.replace('### Enterprise', '## Enterprise')
                        content = content.replace('### Open Source', '## Open Source')

                    elif basename == 'review_till_spec_003_5.md':
                        content = content.replace('**Participants (simulated design review)**', '## Participants (simulated design review)')
                        content = content.replace('Desktop becomes\n\n**Command Center**', 'Desktop becomes **Command Center**')
                        content = content.replace('Extension becomes\n\n**Assistant**', 'Extension becomes **Assistant**')

                    if content != original_content:
                        print(f"Fixed lint errors in {path}")
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(content)

if __name__ == '__main__':
    main()
