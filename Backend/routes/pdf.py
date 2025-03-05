from http.client import HTTPException
import os
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi import APIRouter
from playwright.sync_api import sync_playwright

router = APIRouter(tags=["PDF"])
PDF_DIR = "pdfs"

os.makedirs(os.path.join("resources", PDF_DIR), exist_ok=True)


class ExportPdfRequest(BaseModel):
    program_name: str


@router.post("/generate-pdf")
def generate_pdf(data: ExportPdfRequest):
    pdf_path = os.path.join("resources", PDF_DIR, "export.pdf")
    # URL de la page React à capturer
    html_path = f"http://localhost:8000/{data.program_name}"
    print("html : ", html_path)
    print("pdf : ", pdf_path)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        browser_context = browser.new_context()
        browser_context.add_cookies(
            [{"name": "tutorial_seen", "value": "true", "url": "http://localhost:8000"}])
        page = browser_context.new_page()
        # Attendre le chargement complet
        page.goto(html_path)
        page.wait_for_load_state("networkidle")

        # Générer un PDF
        page.emulate_media(media="print")
        page.pdf(path=pdf_path, format="A4")

        browser_context.close()
        browser.close()

    if not os.path.exists(pdf_path):
        raise HTTPException(
            status_code=500, detail="Erreur lors de la génération du PDF")

    return FileResponse(pdf_path, filename=f"export_{data.program_name}.pdf", media_type="application/pdf")
