# Illustration Validator

## Install

From the project folder in the activated `.venv`:

```powershell
python -m pip install -r requirements.txt
```

Tesseract is already configured to use:

```text
C:\Users\MM04018\AppData\Local\Tesseract-OCR\tesseract.exe
```

Poppler must provide `pdftoppm` and `pdfinfo` on PATH.

## Start the website

```powershell
cleat
```

Open:

```text
http://127.0.0.1:5000
```

Do not double-click `index.html`. The browser must send the PDFs to the local Flask API.

## Project flow

1. `index.html` provides upload and results containers.
2. `validation.js` sends both PDFs to `POST /api/validate`.
3. `app.py` saves uploads in a temporary folder and invokes `pdf_validator.py`.
4. `pdf_validator.py` performs native extraction, OCR fallback, parsing, normalization, and comparison.
5. The Flask API returns JSON, and `validation.js` renders it.
