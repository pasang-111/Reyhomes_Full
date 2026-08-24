# ReyHomes Google Workspace email

The `/contact` and `/enquire` forms both submit to the Django enquiry endpoint. After an enquiry is saved, ReyHomes sends:

1. A branded thank-you email to the visitor.
2. An internal lead notification to `CONTACT_NOTIFICATION_EMAIL`.

Use Google Workspace/Gmail SMTP:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=hello@reyhomes.com.au
EMAIL_HOST_PASSWORD=YOUR_GOOGLE_APP_PASSWORD
DEFAULT_FROM_EMAIL=hello@reyhomes.com.au
CONTACT_NOTIFICATION_EMAIL=hello@reyhomes.com.au
EMAIL_TIMEOUT=20
```

Use a Google App Password rather than the normal mailbox password when required by Google Workspace. Never commit the real password to GitHub.

If SMTP is temporarily unavailable, the enquiry remains saved in Django and the email failure is logged.
