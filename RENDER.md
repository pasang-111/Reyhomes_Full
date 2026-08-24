databases:
  - name: reyhomes-db
    plan: free
    databaseName: reyhomes
    user: reyhomes

services:
  - type: web
    name: reyhomes-backend
    runtime: python
    plan: free
    rootDir: backend
    buildCommand: "pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py createsuperuser --noinput || true"
    startCommand: "gunicorn config.wsgi:application"
    # NOTE: free web services don't support persistent disks, so uploaded
    # media (photos/PDFs) is wiped on every redeploy unless USE_S3=True
    # below is configured with real bucket credentials — see DEPLOY.md
    # "Set up free media storage (S3-compatible)". Recommended for any real
    # (non-throwaway-testing) deployment.
    envVars:
      - key: DJANGO_SUPERUSER_USERNAME
        sync: false
      - key: DJANGO_SUPERUSER_EMAIL
        sync: false
      - key: DJANGO_SUPERUSER_PASSWORD
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: "False"
      - key: USE_SQLITE
        value: "False"
      - key: ALLOWED_HOSTS
        # After first deploy, set this in the dashboard to the exact host shown
        # (e.g. reyhomes-backend-nx6h.onrender.com). settings.py also auto-adds
        # RENDER_EXTERNAL_HOSTNAME so a mismatch no longer causes 400.
        value: "reyhomes-backend.onrender.com"
      - key: DB_NAME
        fromDatabase:
          name: reyhomes-db
          property: database
      - key: DB_USER
        fromDatabase:
          name: reyhomes-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: reyhomes-db
          property: password
      - key: DB_HOST
        fromDatabase:
          name: reyhomes-db
          property: host
      - key: DB_PORT
        fromDatabase:
          name: reyhomes-db
          property: port
      - key: CORS_ALLOWED_ORIGINS
        value: "https://reyhomes-yc57.vercel.app"
      - key: CSRF_TRUSTED_ORIGINS
        # Must include backend itself (admin login) + real Vercel frontend URL
        value: "https://reyhomes-backend.onrender.com,https://reyhomes-yc57.vercel.app"
      - key: SECURE_SSL_REDIRECT
        value: "True"
      - key: SESSION_COOKIE_SECURE
        value: "True"
      - key: CSRF_COOKIE_SECURE
        value: "True"
      - key: JWT_ACCESS_MINUTES
        value: "30"
      - key: JWT_REFRESH_DAYS
        value: "14"
      # ---- Media storage (S3-compatible) — see DEPLOY.md ----
      # Leave USE_S3 as "False" to keep local disk (wiped on redeploy, fine
      # for a first test deploy only). Set "True" once you've created a
      # bucket and filled in the values below as real Render secrets.
      - key: USE_S3
        value: "False"
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_STORAGE_BUCKET_NAME
        sync: false
      - key: AWS_S3_REGION_NAME
        sync: false
      - key: AWS_S3_ENDPOINT_URL
        sync: false
      - key: AWS_S3_CUSTOM_DOMAIN
        sync: false
      # ---- Cloudinary media (free) — set USE_CLOUDINARY=True and fill keys ----
      # If USE_CLOUDINARY=True, it overrides S3/R2 for media storage.
      - key: USE_CLOUDINARY
        value: "True"
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
