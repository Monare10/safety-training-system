import io, os, secrets
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import cm, mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader

# ---- Brand tokens (mirror frontend/src/theme/brand.js) ----
ORANGE   = HexColor("#F26522")
ORANGE_D = HexColor("#D14F12")
NAVY     = HexColor("#0E2A47")
NAVY_L   = HexColor("#1A3F63")
YELLOW   = HexColor("#FFD400")
SLATE    = HexColor("#4A5568")
BORDER   = HexColor("#E2E8F0")
WHITE    = HexColor("#FFFFFF")

# Where the PNG logo lives (relative to this file)
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
LOGO_PATH  = os.path.join(ASSETS_DIR, "logo-stacked.png")


def generate_serial() -> str:
    return "MC-" + secrets.token_hex(5).upper()


def _draw_text_logo(c: canvas.Canvas, cx: float, cy: float):
    """Fallback logo when no PNG is present — drawn with shapes + text."""
    # Orange rounded square with hard hat icon
    size = 1.4 * cm
    c.setFillColor(ORANGE)
    c.roundRect(cx - size / 2, cy - size / 2, size, size, 4, stroke=0, fill=1)

    # Hat / triangle
    c.setFillColor(WHITE)
    p = c.beginPath()
    p.moveTo(cx - 0.42 * cm, cy - 0.25 * cm)
    p.lineTo(cx, cy + 0.35 * cm)
    p.lineTo(cx + 0.42 * cm, cy - 0.25 * cm)
    p.close()
    c.drawPath(p, stroke=0, fill=1)

    # Hat brim
    c.rect(cx - 0.5 * cm, cy - 0.35 * cm, 1.0 * cm, 0.12 * cm, stroke=0, fill=1)

    # Dot (navy)
    c.setFillColor(NAVY)
    c.circle(cx, cy - 0.05 * cm, 0.09 * cm, stroke=0, fill=1)

    # Wordmark
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(cx, cy - 1.1 * cm, "MONARE")
    c.setFont("Helvetica", 8)
    c.setFillColor(SLATE)
    c.drawCentredString(cx, cy - 1.45 * cm, "C O N S T R U C T I O N S")


def _draw_guilloche_border(c: canvas.Canvas, x: float, y: float, w: float, h: float):
    """Double outer border + thin inner accent line."""
    # Outer navy border
    c.setStrokeColor(NAVY)
    c.setLineWidth(4)
    c.rect(x, y, w, h)

    # Thin orange inner line
    c.setStrokeColor(ORANGE)
    c.setLineWidth(1.2)
    c.rect(x + 6 * mm, y + 6 * mm, w - 12 * mm, h - 12 * mm)


def _draw_corner_marks(c: canvas.Canvas, x: float, y: float, w: float, h: float):
    """Small orange corner accents — technical drawing feel."""
    c.setStrokeColor(ORANGE)
    c.setLineWidth(3)
    m = 14 * mm    # length of corner line
    off = 10 * mm  # offset from border
    # Top-left
    c.line(x + off, y + h - off, x + off + m, y + h - off)
    c.line(x + off, y + h - off, x + off, y + h - off - m)
    # Top-right
    c.line(x + w - off, y + h - off, x + w - off - m, y + h - off)
    c.line(x + w - off, y + h - off, x + w - off, y + h - off - m)
    # Bottom-left
    c.line(x + off, y + off, x + off + m, y + off)
    c.line(x + off, y + off, x + off, y + off + m)
    # Bottom-right
    c.line(x + w - off, y + off, x + w - off - m, y + off)
    c.line(x + w - off, y + off, x + w - off, y + off + m)


def _draw_watermark(c: canvas.Canvas, cx: float, cy: float):
    """Diagonal faded wordmark across the page."""
    c.saveState()
    c.translate(cx, cy)
    c.rotate(-28)
    c.setFillColor(Color(0.94, 0.94, 0.94, alpha=0.55))
    c.setFont("Helvetica-Bold", 90)
    c.drawCentredString(0, 0, "MONARE")
    c.setFont("Helvetica", 20)
    c.drawCentredString(0, -1.4 * cm, "CONSTRUCTIONS")
    c.restoreState()


def build_certificate_pdf(
    full_name: str,
    course_title: str,
    serial: str,
    issued_at: datetime,
    expires_at: datetime,
    score: float,
    verify_url: str | None = None,
) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(A4))
    w, h = landscape(A4)

    # --- Background wash ---
    c.setFillColor(HexColor("#FAFBFC"))
    c.rect(0, 0, w, h, stroke=0, fill=1)

    # --- Watermark ---
    _draw_watermark(c, w / 2, h / 2 - 1 * cm)

    # --- Borders & accents ---
    _draw_guilloche_border(c, 1.0 * cm, 1.0 * cm, w - 2 * cm, h - 2 * cm)
    _draw_corner_marks(c, 1.0 * cm, 1.0 * cm, w - 2 * cm, h - 2 * cm)

    # --- Header band (orange strip) ---
    c.setFillColor(ORANGE)
    c.rect(1.0 * cm + 6 * mm, h - 2.4 * cm, w - 2 * cm - 12 * mm, 2 * mm,
           stroke=0, fill=1)

    # --- Logo ---
    logo_cy = h - 4.2 * cm
    if os.path.exists(LOGO_PATH):
        try:
            img = ImageReader(LOGO_PATH)
            iw, ih = img.getSize()
            target_h = 2.4 * cm
            target_w = iw * (target_h / ih)
            c.drawImage(img, w / 2 - target_w / 2, logo_cy - target_h / 2,
                        width=target_w, height=target_h, mask='auto')
        except Exception:
            _draw_text_logo(c, w / 2, logo_cy)
    else:
        _draw_text_logo(c, w / 2, logo_cy)

    # --- Title ---
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(w / 2, h - 7.2 * cm, "CERTIFICATE OF COMPLETION")

    c.setFont("Helvetica", 12)
    c.setFillColor(SLATE)
    c.drawCentredString(w / 2, h - 8.0 * cm, "Construction Site Safety Training")

    # Small divider
    c.setStrokeColor(ORANGE)
    c.setLineWidth(1)
    c.line(w / 2 - 2 * cm, h - 8.6 * cm, w / 2 + 2 * cm, h - 8.6 * cm)

    # --- "Awarded to" ---
    c.setFillColor(SLATE)
    c.setFont("Helvetica-Oblique", 11)
    c.drawCentredString(w / 2, h - 9.7 * cm, "This is to certify that")

    # --- Name ---
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(w / 2, h - 11.2 * cm, full_name)

    # Underline under the name
    name_width = c.stringWidth(full_name, "Helvetica-Bold", 26)
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.6)
    c.line(w / 2 - name_width / 2 - 1 * cm, h - 11.7 * cm,
           w / 2 + name_width / 2 + 1 * cm, h - 11.7 * cm)

    # --- "has successfully completed" ---
    c.setFillColor(SLATE)
    c.setFont("Helvetica", 12)
    c.drawCentredString(w / 2, h - 12.6 * cm, "has successfully completed the course")

    # --- Course title (navy banner) ---
    c.setFillColor(NAVY)
    banner_w = w - 6 * cm
    banner_x = (w - banner_w) / 2
    banner_y = h - 14.4 * cm
    banner_h = 1.4 * cm
    c.roundRect(banner_x, banner_y, banner_w, banner_h, 4, stroke=0, fill=1)

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 17)
    c.drawCentredString(w / 2, banner_y + banner_h / 2 - 6, course_title)

    # --- Info row: score | issued | expires ---
    info_y = h - 16.6 * cm
    col_w = (w - 6 * cm) / 3
    start_x = 3 * cm

    def _info(cx, label, value, accent=NAVY):
        c.setFillColor(SLATE)
        c.setFont("Helvetica", 9)
        c.drawCentredString(cx, info_y + 0.55 * cm, label.upper())
        c.setFillColor(accent)
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(cx, info_y, value)

    _info(start_x + col_w * 0.5, "Final Score",
          f"{score:.1f}%", ORANGE)
    _info(start_x + col_w * 1.5, "Date Issued",
          issued_at.strftime("%d %b %Y"), NAVY)
    _info(start_x + col_w * 2.5, "Valid Until",
          expires_at.strftime("%d %b %Y"), NAVY)

    # --- Footer: serial + signature ---
    footer_y = 3.0 * cm

    # Left: serial + validity note
    c.setFillColor(SLATE)
    c.setFont("Helvetica", 8)
    c.drawString(2.2 * cm, footer_y + 0.6 * cm,
                 f"Certificate No: {serial}")
    c.drawString(2.2 * cm, footer_y + 0.15 * cm,
                 "This credential is valid for 12 months from date of issue.")
    if verify_url:
        c.setFillColor(NAVY_L)
        c.drawString(2.2 * cm, footer_y - 0.3 * cm,
                     f"Verify at: {verify_url}")

    # Right: signature line
    sig_x = w - 8 * cm
    sig_w = 5 * cm
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.8)
    c.line(sig_x, footer_y + 0.4 * cm, sig_x + sig_w, footer_y + 0.4 * cm)

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(sig_x + sig_w / 2, footer_y + 0.05 * cm,
                        "Site Safety Officer")
    c.setFillColor(SLATE)
    c.setFont("Helvetica", 8)
    c.drawCentredString(sig_x + sig_w / 2, footer_y - 0.35 * cm,
                        "Monare Constructions")

    # --- Footer strip ---
    c.setFillColor(NAVY)
    c.rect(1.0 * cm, 1.0 * cm, w - 2 * cm, 4 * mm, stroke=0, fill=1)
    c.setFillColor(ORANGE)
    c.rect(1.0 * cm, 1.0 * cm, (w - 2 * cm) * 0.28, 4 * mm, stroke=0, fill=1)

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.read()