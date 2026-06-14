# pip install pdfplumber
import pdfplumber, json, re

PDF_PATH = "kidasse_Dioscoros.pdf"

ROLE_PATTERNS = {
    "priest":      re.compile(r"^Priest\s*[:\-]", re.IGNORECASE),
    "asst_priest": re.compile(r"^Asst\.?\s*Priest\s*[:\-]", re.IGNORECASE),
    "deacon":      re.compile(r"^Deacon\s*[:\-]", re.IGNORECASE),
    "rubric":      re.compile(r"^\(.*\)$"),
}

def detect_role(text):
    for role, pattern in ROLE_PATTERNS.items():
        if pattern.match(text.strip()):
            return role
    return "congregation"

units = []
with pdfplumber.open(PDF_PATH) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        english_lines = [l for l in lines if re.search(r"[a-zA-Z]", l) and not re.fullmatch(r"\d+", l)]
        if not english_lines:
            continue
        units.append({
            "source_page": i + 1,
            "text_en": " ".join(english_lines),
            "role": detect_role(english_lines[0]),
            "text_am": None,
            "text_gez": None,
        })

with open("extracted_en.json", "w", encoding="utf-8") as f:
    json.dump(units, f, ensure_ascii=False, indent=2)
print(f"Extracted {len(units)} units")
