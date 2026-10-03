import os
import subprocess
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

DOCS_DIR = r"c:\Users\Eshwar Ajay Sai\Documents\ISutra\ISutra\docs"
OUTPUT_DIR = os.path.join(DOCS_DIR, "pdf")
DOWNLOADS_DIR = r"C:\Users\Eshwar Ajay Sai\Downloads"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# Import CSS from convert_docs_to_pdf
sys.path.insert(0, os.path.abspath("scratch"))
from convert_docs_to_pdf import CSS_STYLES, preprocess_markdown

ORDER = [
    ("ARCHITECTURE_AND_SPECIFICATION.md", "1. System Architecture & Technical Specification"),
    ("API_REFERENCE.md", "2. REST API Reference & Integration Guide"),
    ("USER_WORKFLOW_GUIDE.md", "3. Procurement Officer & User Workflow Manual"),
    ("DEVELOPER_OPERATIONS_GUIDE.md", "4. Developer & Operations Runbook"),
    ("REGULATORY_COMPLIANCE_GUIDE.md", "5. Regulatory & Standards Compliance Framework"),
    ("ISUTRA_SYSTEM_DOCUMENTATION.md", "6. System Capabilities & Verification Summary")
]

combined_html = []
for filename, section_title in ORDER:
    p = os.path.join(DOCS_DIR, filename)
    with open(p, "r", encoding="utf-8") as f:
        md = f.read()
    processed_md = preprocess_markdown(md)
    temp_md = "temp_comb.md"
    temp_frag = "temp_comb.html"
    with open(temp_md, "w", encoding="utf-8") as f:
        f.write(processed_md)
    subprocess.run(["npx.cmd", "--yes", "marked", "-i", temp_md, "-o", temp_frag, "--gfm"], capture_output=True)
    with open(temp_frag, "r", encoding="utf-8") as f:
        frag = f.read()
    combined_html.append(f'<div class="doc-section" style="page-break-before: always;">{frag}</div>')

full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>ISutra Complete Documentation Dossier</title>
<style>
{CSS_STYLES}
.cover-page {{
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 85vh;
    padding: 60px 20px;
    border-bottom: 3px solid #2563eb;
}}
.cover-title {{
    font-size: 32pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.15;
    margin-bottom: 12px;
}}
.cover-subtitle {{
    font-size: 15pt;
    color: #2563eb;
    font-weight: 600;
    margin-bottom: 30px;
}}
.cover-meta {{
    font-size: 11pt;
    color: #475569;
    line-height: 1.8;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #cbd5e1;
}}
</style>
</head>
<body>
<div class="cover-page">
    <div class="cover-title">ISutra</div>
    <div class="cover-subtitle">Comprehensive System Documentation &amp; Technical Dossier</div>
    <p style="font-size: 12pt; color: #334155;">AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications</p>
    <p style="font-size: 11pt; color: #64748b;">Smart India Hackathon (SIH) 2026 &bull; Problem Statement SIH26108</p>
    <div class="cover-meta">
        <strong>Author:</strong> Team Core Coders<br>
        <strong>Status:</strong> Verified Prototype &amp; Complete System Dossier<br>
        <strong>Compliance:</strong> General Financial Rules (GFR, 2017) Rule 144(i) &amp; BIS Act 2016<br>
        <strong>Test Verification:</strong> 280+ Passing Automated Assertions (0 Failures)
    </div>
</div>
{''.join(combined_html)}
</body>
</html>"""

with open("temp_dossier.html", "w", encoding="utf-8") as f:
    f.write(full_html)

dossier_pdf = os.path.join(OUTPUT_DIR, "ISutra_Complete_Documentation_Dossier.pdf")
cmd = [CHROME_PATH, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={dossier_pdf}", os.path.abspath("temp_dossier.html")]
subprocess.run(cmd, capture_output=True)

if os.path.exists(dossier_pdf):
    dl_pdf = os.path.join(DOWNLOADS_DIR, "ISutra_Complete_Documentation_Dossier.pdf")
    shutil.copy2(dossier_pdf, dl_pdf)
    size_mb = os.path.getsize(dossier_pdf) / (1024 * 1024)
    print(f"Master Dossier PDF generated: {size_mb:.2f} MB")

for t in ["temp_comb.md", "temp_comb.html", "temp_dossier.html"]:
    if os.path.exists(t):
        os.remove(t)
