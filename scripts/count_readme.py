"""Conservative README prose count: visible Markdown text, excluding fenced setup code.

Includes headings, link labels, inline identifiers, numerals and status statements.
Whitespace tokens after stripping Markdown syntax; count line itself excluded.
"""
from pathlib import Path
import re
p = Path(__file__).resolve().parents[1] / 'README.md'
text = p.read_text()
prose = re.sub(r'```.*?```', '', text, flags=re.S)
prose = re.sub(r'^README prose word count:.*$', '', prose, flags=re.M)
prose = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', prose)
prose = re.sub(r'[#*`]', '', prose)
n = len(prose.split())
text = re.sub(r'README prose word count:.*', f'README prose word count: {n} (headings and link labels included; fenced setup code and this count line excluded).', text, count=1)
p.write_text(text)
print(f'README prose words: {n}')
