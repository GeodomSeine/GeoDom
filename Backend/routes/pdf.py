from http.client import HTTPException
import os
from playwright.async_api import async_playwright
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi import APIRouter

router = APIRouter( tags=["PDF"])
PDF_DIR = "pdfs"

os.makedirs(os.path.join("resources", PDF_DIR), exist_ok=True)

class ExportPdfRequest(BaseModel):
    program_name: str


@router.post("/generate-pdf")
async def generate_pdf(data: ExportPdfRequest):
    pdf_path = os.path.join("resources",PDF_DIR, "export.pdf")
    html_path = f"http://127.0.0.1:8000/{data.program_name}"  # URL de la page React à capturer
    print("html : ", html_path)
    print("pdf : ", pdf_path)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        # Attendre le chargement complet
        await page.goto(html_path, wait_until="networkidle")

        # Générer un PDF
        await page.pdf(path=pdf_path, format="A4")

        await browser.close()

    if not os.path.exists(pdf_path):
        raise HTTPException(
            status_code=500, detail="Erreur lors de la génération du PDF")

    return FileResponse(pdf_path, filename="export_{data.program_name}.pdf", media_type="application/pdf")