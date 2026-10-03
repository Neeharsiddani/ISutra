import os
import sys
import subprocess
import re
import shutil

sys.stdout.reconfigure(encoding='utf-8')

DOCS_DIR = r"c:\Users\Eshwar Ajay Sai\Documents\ISutra\ISutra\docs"
OUTPUT_DIR = os.path.join(DOCS_DIR, "pdf")
DOWNLOADS_DIR = r"C:\Users\Eshwar Ajay Sai\Downloads"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

os.makedirs(OUTPUT_DIR, exist_ok=True)

CSS_STYLES = """
@page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 10.5pt;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
}

.header-banner {
    border-bottom: 2px solid #2563eb;
    padding-bottom: 8px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5pt;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
}

h1 {
    color: #0f172a;
    font-size: 20pt;
    font-weight: 800;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 8px;
    margin-top: 0;
    margin-bottom: 14px;
    letter-spacing: -0.02em;
}

h2 {
    color: #1e3a8a;
    font-size: 14pt;
    font-weight: 700;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 5px;
    margin-top: 22px;
    margin-bottom: 10px;
    page-break-after: avoid;
}

h3 {
    color: #1e293b;
    font-size: 12pt;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
}

h4 {
    font-size: 11pt;
    font-weight: 600;
    color: #334155;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
}

p {
    margin-top: 0;
    margin-bottom: 10px;
}

ul, ol {
    margin-top: 0;
    margin-bottom: 12px;
    padding-left: 22px;
}

li {
    margin-bottom: 4px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
}

th, td {
    border: 1px solid #cbd5e1;
    padding: 7px 10px;
    text-align: left;
    vertical-align: top;
}

th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
}

tr:nth-child(even) td {
    background-color: #f8fafc;
}

code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 9pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 8.5pt;
    line-height: 1.45;
    page-break-inside: avoid;
    margin: 12px 0 16px 0;
}

pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
    font-size: inherit;
}

blockquote {
    border-left: 4px solid #3b82f6;
    margin: 12px 0;
    padding: 8px 14px;
    background-color: #eff6ff;
    color: #1e3a8a;
    font-size: 10pt;
    page-break-inside: avoid;
}

blockquote p {
    margin: 0;
}

.callout {
    border-radius: 6px;
    padding: 10px 14px;
    margin: 12px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
}

.callout-note {
    background-color: #eff6ff;
    border-left: 4px solid #3b82f6;
    color: #1e40af;
}

.callout-important {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    color: #991b1b;
}

.callout-tip {
    background-color: #f0fdf4;
    border-left: 4px solid #22c55e;
    color: #166534;
}

.callout-warning, .callout-caution {
    background-color: #fffbeb;
    border-left: 4px solid #f59e0b;
    color: #92400e;
}

.callout-title {
    font-weight: 700;
    margin-bottom: 4px;
    display: block;
    text-transform: uppercase;
    font-size: 8.5pt;
    letter-spacing: 0.05em;
}

hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
}

.footer-stamp {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    font-size: 8pt;
    color: #94a3b8;
    text-align: center;
}
"""

def preprocess_markdown(content: str) -> str:
    # Replace GitHub alert syntax:
    # > [!NOTE]
    # > text
    lines = content.split('\n')
    new_lines = []
    in_alert = False
    alert_type = ""
    alert_lines = []

    alert_pattern = re.compile(r"^>\s*\[!(NOTE|IMPORTANT|TIP|WARNING|CAUTION)\]\s*(.*)$")

    for line in lines:
        match = alert_pattern.match(line)
        if match:
            in_alert = True
            alert_type = match.group(1).lower()
            rest = match.group(2)
            alert_lines = []
            if rest.strip():
                alert_lines.append(rest.strip())
            continue

        if in_alert:
            if line.startswith(">"):
                alert_lines.append(line.lstrip("> ").strip())
            else:
                # end of alert
                new_lines.append(f'<div class="callout callout-{alert_type}"><span class="callout-title">{alert_type.upper()}</span><p>{" ".join(alert_lines)}</p></div>')
                in_alert = False
                alert_lines = []
                new_lines.append(line)
        else:
            new_lines.append(line)

    if in_alert and alert_lines:
        new_lines.append(f'<div class="callout callout-{alert_type}"><span class="callout-title">{alert_type.upper()}</span><p>{" ".join(alert_lines)}</p></div>')

    return '\n'.join(new_lines)


def convert_file(md_path: str, pdf_filename: str):
    print(f"Processing: {os.path.basename(md_path)} -> {pdf_filename}")
    with open(md_path, 'r', encoding='utf-8') as f:
        raw_md = f.read()

    processed_md = preprocess_markdown(raw_md)

    # Use npx marked to convert to HTML
    temp_md = "temp_input.md"
    temp_html_frag = "temp_fragment.html"
    temp_full_html = "temp_full.html"

    with open(temp_md, 'w', encoding='utf-8') as f:
        f.write(processed_md)

    res = subprocess.run(["npx.cmd", "--yes", "marked", "-i", temp_md, "-o", temp_html_frag, "--gfm"], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error in marked: {res.stderr}")
        return False

    with open(temp_html_frag, 'r', encoding='utf-8') as f:
        frag = f.read()

    title = os.path.splitext(os.path.basename(md_path))[0].replace('_', ' ').title()

    full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title} — ISutra</title>
<style>
{CSS_STYLES}
</style>
</head>
<body>
<div class="header-banner">
    <span>ISutra — AI-Powered Indian Standards Intelligence</span>
    <span>Smart India Hackathon 2026 (SIH26108)</span>
</div>
{frag}
<div class="footer-stamp">
    ISutra Decision Support System • Problem Statement SIH26108 • Official BIS Ground Truth Architecture
</div>
</body>
</html>"""

    with open(temp_full_html, 'w', encoding='utf-8') as f:
        f.write(full_html)

    pdf_out = os.path.join(OUTPUT_DIR, pdf_filename)
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_out}",
        os.path.abspath(temp_full_html)
    ]
    res_chrome = subprocess.run(cmd, capture_output=True)

    # Cleanup temp files
    for t in [temp_md, temp_html_frag, temp_full_html]:
        if os.path.exists(t):
            os.remove(t)

    if os.path.exists(pdf_out):
        size_kb = os.path.getsize(pdf_out) / 1024
        print(f"✓ Generated: {pdf_out} ({size_kb:.1f} KB)")
        # Also copy to Downloads folder for immediate user access
        dl_dest = os.path.join(DOWNLOADS_DIR, pdf_filename)
        shutil.copy2(pdf_out, dl_dest)
        print(f"  -> Copied to Downloads: {dl_dest}")
        return True
    else:
        print(f"✗ Failed to create {pdf_out}")
        return False

DOC_MAP = [
    ("ARCHITECTURE_AND_SPECIFICATION.md", "ISutra_System_Architecture_and_Specification.pdf"),
    ("API_REFERENCE.md", "ISutra_REST_API_Reference.pdf"),
    ("USER_WORKFLOW_GUIDE.md", "ISutra_Procurement_Officer_User_Guide.pdf"),
    ("DEVELOPER_OPERATIONS_GUIDE.md", "ISutra_Developer_and_Operations_Runbook.pdf"),
    ("REGULATORY_COMPLIANCE_GUIDE.md", "ISutra_Regulatory_and_Standards_Compliance_Guide.pdf"),
    ("ISUTRA_SYSTEM_DOCUMENTATION.md", "ISutra_System_Architecture_Summary.pdf")
]

successes = 0
for md_file, pdf_file in DOC_MAP:
    full_path = os.path.join(DOCS_DIR, md_file)
    if os.path.exists(full_path):
        if convert_file(full_path, pdf_file):
            successes += 1
    else:
        print(f"Skipping {md_file} (not found)")

print(f"\nCompleted {successes}/{len(DOC_MAP)} PDFs successfully!")
