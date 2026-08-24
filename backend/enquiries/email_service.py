"""Google Workspace/Gmail email notifications for website enquiries."""

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape

logger = logging.getLogger(__name__)


def _send(subject: str, to: list[str], text_body: str, html_body: str) -> bool:
    recipients = [email.strip() for email in to if email and email.strip()]
    if not recipients:
        return False

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipients,
        reply_to=[settings.DEFAULT_FROM_EMAIL],
    )
    message.attach_alternative(html_body, "text/html")
    message.send(fail_silently=False)
    return True


def send_enquiry_emails(enquiry) -> None:
    """Send visitor confirmation and internal lead notification.

    SMTP failures are logged but never invalidate an already-saved enquiry.
    """
    name = f"{enquiry.first_name} {enquiry.last_name}".strip()
    safe_name = escape(name or "there")
    safe_subject = escape(enquiry.subject or "Website enquiry")
    safe_message = escape(enquiry.message or "").replace("\n", "<br>")
    source = escape(enquiry.source or "Website")
    related = escape(enquiry.related_slug or "")

    try:
        visitor_text = f"""Hi {name or 'there'},

Thank you for contacting ReyHomes. We have received your enquiry and a member of our team will be in touch shortly.

Enquiry: {enquiry.subject or 'Website enquiry'}

Regards,
ReyHomes
hello@reyhomes.com.au
"""
        visitor_html = f"""
        <div style="font-family:Arial,sans-serif;background:#f5f0e6;padding:32px;color:#0a1628">
          <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:18px;padding:34px;border:1px solid #e5ddcf">
            <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#806d48">REYHOMES</div>
            <h1 style="font-family:Georgia,serif;font-weight:400;font-size:32px;margin:18px 0 10px">Thank you, {safe_name}.</h1>
            <p style="font-size:15px;line-height:1.7;color:#4d5863">We have received your enquiry. Our team will review the details and get back to you shortly.</p>
            <div style="margin-top:24px;padding:18px;border-radius:12px;background:#0a1628;color:#f5f0e6">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#d8c7a4">Your enquiry</div>
              <div style="margin-top:8px;font-size:16px">{safe_subject}</div>
            </div>
            <p style="margin-top:28px;font-size:13px;color:#68727c">If you need to add anything, simply reply to this email.</p>
            <p style="font-size:14px;color:#0a1628"><strong>ReyHomes</strong><br>hello@reyhomes.com.au</p>
          </div>
        </div>
        """
        _send("Thank you for contacting ReyHomes", [enquiry.email], visitor_text, visitor_html)
    except Exception:
        logger.exception("ReyHomes visitor thank-you email failed for enquiry %s", enquiry.pk)

    try:
        notification_to = getattr(settings, "CONTACT_NOTIFICATION_EMAIL", "")
        internal_text = f"""New ReyHomes enquiry

Name: {name}
Email: {enquiry.email}
Phone: {enquiry.phone}
Subject: {enquiry.subject}
Source: {enquiry.source}
Related: {enquiry.related_slug}

Message:
{enquiry.message}

Open Django Admin: /admin/enquiries/enquiry/{enquiry.pk}/change/
"""
        internal_html = f"""
        <div style="font-family:Arial,sans-serif;background:#0a1628;padding:32px;color:#f5f0e6">
          <div style="max-width:680px;margin:auto;background:#101f33;border:1px solid rgba(216,199,164,.22);border-radius:18px;padding:30px">
            <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d8c7a4">NEW WEBSITE LEAD</div>
            <h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;margin:14px 0 22px">{safe_subject}</h1>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:9px 0;color:#9eabb8">Name</td><td style="padding:9px 0">{safe_name}</td></tr>
              <tr><td style="padding:9px 0;color:#9eabb8">Email</td><td style="padding:9px 0">{escape(enquiry.email)}</td></tr>
              <tr><td style="padding:9px 0;color:#9eabb8">Phone</td><td style="padding:9px 0">{escape(enquiry.phone or '—')}</td></tr>
              <tr><td style="padding:9px 0;color:#9eabb8">Source</td><td style="padding:9px 0">{source}</td></tr>
              <tr><td style="padding:9px 0;color:#9eabb8">Related</td><td style="padding:9px 0">{related or '—'}</td></tr>
            </table>
            <div style="margin-top:20px;padding:18px;border-radius:12px;background:rgba(255,255,255,.05);line-height:1.7">{safe_message}</div>
            <p style="margin-top:24px;color:#9eabb8;font-size:12px">Enquiry #{enquiry.pk} is waiting in Django Admin.</p>
          </div>
        </div>
        """
        recipients = [notification_to] if notification_to else []
        if recipients:
            message = EmailMultiAlternatives(
                subject=f"New ReyHomes enquiry — {enquiry.subject or name}",
                body=internal_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipients,
                reply_to=[enquiry.email],
            )
            message.attach_alternative(internal_html, "text/html")
            message.send(fail_silently=False)
    except Exception:
        logger.exception("ReyHomes internal enquiry notification failed for enquiry %s", enquiry.pk)
