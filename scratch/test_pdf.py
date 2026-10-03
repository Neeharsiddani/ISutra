import subprocess
import os

html_content = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Test PDF</title>
<style>
body { font-family: sans-serif; padding: 40px; }
h1 { color: #1e3a8a; }
</style>
</head>
<body>
<h1>Test PDF Generation</h1>
<p>Testing Chrome headless print-to-pdf.</p>
</body>
</html>"""

with open("test_pdf.html", "w", encoding="utf-8") as f:
    f.write(html_content)

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
pdf_out = os.path.abspath("test_output.pdf")
cmd = [chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={pdf_out}", os.path.abspath("test_pdf.html")]
res = subprocess.run(cmd, capture_output=True)
print("Return code:", res.returncode)
print("PDF exists:", os.path.exists(pdf_out))
if os.path.exists(pdf_out):
    print("PDF size:", os.path.getsize(pdf_out))
    os.remove(pdf_out)
if os.path.exists("test_pdf.html"):
    os.remove("test_pdf.html")
