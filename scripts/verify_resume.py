from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ROOT / "output" / "pdf" / "Cristian-Alexis-Roman-Santiago-QA-Engineer-EN.pdf",
    ROOT / "output" / "pdf" / "Cristian-Alexis-Roman-Santiago-QA-Engineer-ES.pdf",
]

for path in FILES:
    reader = PdfReader(path)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    links = sum(len(page.get("/Annots", [])) for page in reader.pages)
    assert len(reader.pages) == 2, f"{path.name} must have exactly two pages"
    assert not reader.get_fields(), f"{path.name} must not contain form fields"
    assert "QA ENGINEER" in text and "AXITY" in text and "SWBC" in text
    assert links >= 4, f"{path.name} is missing clickable links"
    print(f"{path.name}: pages=2 bytes={path.stat().st_size} links={links} fields=0")

assert FILES[0].read_bytes() == (ROOT / "public" / "resume" / "Cristian-Alexis-Roman-Santiago-QA-Engineer.pdf").read_bytes()
assert FILES[1].read_bytes() == (ROOT / "public" / "resume" / "Cristian-Alexis-Roman-Santiago-QA-Engineer-ES.pdf").read_bytes()
print("Public download copies match the verified output PDFs.")
