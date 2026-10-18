from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Certificate
from ..schemas import CertificateOut
from ..deps import get_current_user
from ..certificates import build_certificate_pdf

router = APIRouter(prefix="/api/certificates", tags=["certificates"])

@router.get("/mine", response_model=list[CertificateOut])
def my_certs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    certs = db.query(Certificate).filter(Certificate.user_id == user.id).all()
    now = datetime.utcnow()
    return [CertificateOut(
        id=c.id, serial=c.serial, course_title=c.course.title,
        issued_at=c.issued_at, expires_at=c.expires_at,
        score=c.score, is_valid=c.expires_at > now) for c in certs]

@router.get("/{cert_id}/download")
def download(cert_id: int, user: User = Depends(get_current_user),
             db: Session = Depends(get_db)):
    cert = db.get(Certificate, cert_id)
    if not cert or (cert.user_id != user.id and user.role.value != "admin"):
        raise HTTPException(404, "Not found")
    pdf = build_certificate_pdf(
        cert.user.full_name, cert.course.title, cert.serial,
        cert.issued_at, cert.expires_at, cert.score,
    )
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition":
                             f'attachment; filename="{cert.serial}.pdf"'})