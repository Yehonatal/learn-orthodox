# pip install pdf2image pytesseract pillow
# apt install tesseract-ocr tesseract-ocr-amh
import json
from pdf2image import convert_from_path
import pytesseract

PDF_PATH = "kidasse_Dioscoros.pdf"

def ocr_page(image):
    raw = pytesseract.image_to_string(image, lang="amh+eng")
    lines = raw.split("\n")
    ethiopic = [l for l in lines if any("\u1200" <= c <= "\u137F" for c in l)]
    return " ".join(ethiopic).strip() or None

with open("extracted_en.json") as f:
    units = json.load(f)

pages = convert_from_path(PDF_PATH, dpi=200)

for unit in units:
    idx = unit["source_page"] - 1
    if idx < len(pages):
        unit["text_am"] = ocr_page(pages[idx])
        # text_gez: same script — split requires liturgical scholar review
        unit["text_gez"] = None

with open("extracted_full.json", "w", encoding="utf-8") as f:
    json.dump(units, f, ensure_ascii=False, indent=2)
print("OCR enrichment complete")
