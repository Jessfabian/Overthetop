from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

from pdf_validator import build_report, compare_documents, parse_document


PROJECT_ROOT = Path(__file__).resolve().parent

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 80 * 1024 * 1024

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)


# ==========================================================
# VALIDATOR API
# Keep API routes before the catch-all website-file route.
# ==========================================================

@app.get("/api/health")
def health():
    return jsonify(
        {
            "ok": True,
            "service": "illustration-validator",
        }
    )


@app.post("/api/validate")
def validate_documents():
    application_file = request.files.get("application")
    illustration_file = request.files.get("illustration")
    state = (request.form.get("state") or "").strip().upper()

    if application_file is None or illustration_file is None:
        return jsonify(
            {
                "error": (
                    "Both the Part 1 application and illustration "
                    "PDFs are required."
                )
            }
        ), 400

    if not is_pdf(application_file.filename):
        return jsonify(
            {"error": "The Part 1 application must be a PDF."}
        ), 400

    if not is_pdf(illustration_file.filename):
        return jsonify(
            {"error": "The illustration must be a PDF."}
        ), 400

    with tempfile.TemporaryDirectory(
        prefix="illustration-validator-"
    ) as temporary_folder:
        temporary_directory = Path(temporary_folder)

        application_path = temporary_directory / secure_filename(
            application_file.filename or "application.pdf"
        )
        illustration_path = temporary_directory / secure_filename(
            illustration_file.filename or "illustration.pdf"
        )

        application_file.save(application_path)
        illustration_file.save(illustration_path)

        application_result = parse_document(
            str(application_path),
            "app",
        )
        illustration_result = parse_document(
            str(illustration_path),
            "ill",
        )
        comparison_rows = compare_documents(
            application_result,
            illustration_result,
            state,
        )
        report = build_report(
            application_result,
            illustration_result,
            comparison_rows,
            state,
        )

        return jsonify(report)


def is_pdf(filename: str | None) -> bool:
    return bool(filename and filename.lower().endswith(".pdf"))


# ==========================================================
# WEBSITE
# Your existing website remains in its current folders.
# ==========================================================

@app.get("/")
def home_page():
    return send_from_directory(PROJECT_ROOT, "home.html")


@app.get("/<path:requested_path>")
def website_file(requested_path: str):
    return send_from_directory(PROJECT_ROOT, requested_path)


# ==========================================================
# ERRORS
# ==========================================================

@app.errorhandler(413)
def upload_too_large(_error):
    return jsonify(
        {"error": "The combined upload exceeds the 80 MB limit."}
    ), 413


@app.errorhandler(404)
def not_found(_error):
    return jsonify(
        {"error": "The requested page, file, or API route was not found."}
    ), 404


@app.errorhandler(Exception)
def unexpected_error(error):
    app.logger.exception("Unexpected website or validator error")
    return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )
