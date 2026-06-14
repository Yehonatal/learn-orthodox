# pip install supabase python-dotenv
import json, os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Page ranges for each section (approximate — review with a liturgist)
SECTION_RANGES = [
    ("opening-hymns",           1,   7),
    ("trisagion",               8,  13),
    ("prayer-of-thanksgiving", 14,  30),
    ("prayer-of-oblation",     21,  46),
    ("litany-of-intercessions",47,  70),
    ("marian-hymns",          100, 114),
    ("sanctus",               115, 123),
    ("anaphora",              124, 203),
    ("prayer-of-fraction",    204, 207),
    ("lords-prayer",          205, 210),
    ("communion",             208, 250),
    ("thanksgiving-dismissal",240, 269),
]

def page_to_section(page):
    for slug, start, end in SECTION_RANGES:
        if start <= page <= end:
            return slug
    return "anaphora"

sb = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
liturgy_id = sb.table("liturgies").select("id").eq("slug","qiddase-dioscoros").single().execute().data["id"]
sections = sb.table("liturgy_sections").select("id,slug").eq("liturgy_id", liturgy_id).execute().data
section_map = {s["slug"]: s["id"] for s in sections}
section_order = {slug: 0 for slug in section_map}

with open("extracted_full.json") as f:
    units = json.load(f)

batch = []
for unit in units:
    slug = page_to_section(unit["source_page"])
    section_id = section_map.get(slug)
    if not section_id:
        continue
    section_order[slug] += 1
    batch.append({
        "section_id": section_id,
        "order_index": section_order[slug],
        "source_page": unit["source_page"],
        "role": unit["role"],
        "text_en": unit.get("text_en"),
        "text_am": unit.get("text_am"),
        "text_gez": unit.get("text_gez"),
    })
    if len(batch) >= 50:
        sb.table("liturgy_units").upsert(batch).execute()
        batch = []

if batch:
    sb.table("liturgy_units").upsert(batch).execute()

print(f"Seeded {sum(section_order.values())} units")
