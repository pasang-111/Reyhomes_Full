"""
Django settings for ReyHomes CMS.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me-in-production-reyhomes-2024')

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

# ALLOWED_HOSTS: include Render's external hostname automatically so a
# mismatched blueprint value (e.g. reyhomes-backend.onrender.com vs the
# real reyhomes-backend-xxxx.onrender.com) does not produce 400 DisallowedHost.
_hosts = [h.strip() for h in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h.strip()]
_render_host = os.getenv('RENDER_EXTERNAL_HOSTNAME', '').strip()
if _render_host and _render_host not in _hosts:
    _hosts.append(_render_host)
ALLOWED_HOSTS = _hosts

# Refuse the default SECRET_KEY when DEBUG is off (production misconfig).
if not DEBUG and SECRET_KEY.startswith("django-insecure-"):
    raise RuntimeError(
        "SECRET_KEY is still the insecure default. Set a strong SECRET_KEY in the environment."
    )

INSTALLED_APPS = [
    # Unfold must be listed before django.contrib.admin.
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'rest_framework_simplejwt',
    # Local apps
    'core',
    'accounts.apps.AccountsConfig',
    'pro.apps.ProConfig',
    'homes',
    'land',
    'projects',
    'enquiries',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Sanitize query/form input (JSON via SanitizedJSONParser below)
    'config.sanitization.InputSanitizationMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'reyhomes'),
        'USER': os.getenv('DB_USER', 'reyhomes'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'reyhomes'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Fallback to SQLite for quick local testing if PostgreSQL not available
if os.getenv('USE_SQLITE', 'False').lower() in ('true', '1', 'yes'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': Path('/tmp/reyhomes_db.sqlite3'),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-au'
TIME_ZONE = 'Australia/Sydney'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
# Render persistent disk: MEDIA_ROOT=/var/data/media (under your disk mount)
_media_root_env = os.getenv("MEDIA_ROOT", "").strip()
MEDIA_ROOT = Path(_media_root_env) if _media_root_env else (BASE_DIR / 'media')

# ---------------------------------------------------------------------------
# Optional S3-compatible media storage (AWS S3, Cloudflare R2, Backblaze B2,
# DigitalOcean Spaces — anything with an S3-compatible API all have free
# tiers). Activates automatically when USE_S3=True is set; otherwise media
# stays on local disk exactly as before. This exists because the free Render
# plan has no persistent disk and wipes /media on every redeploy — see
# DEPLOYMENT_GUIDE.md.
# ---------------------------------------------------------------------------
USE_S3 = os.getenv("USE_S3", "False").lower() in ("true", "1", "yes")
if USE_S3:
    INSTALLED_APPS += ["storages"]
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME")
    AWS_S3_REGION_NAME = os.getenv("AWS_S3_REGION_NAME", "auto")
    # Leave AWS_S3_ENDPOINT_URL unset for real AWS S3. Set it for S3-compatible
    # providers, e.g. Cloudflare R2: https://<account_id>.r2.cloudflarestorage.com
    AWS_S3_ENDPOINT_URL = os.getenv("AWS_S3_ENDPOINT_URL") or None
    # Optional CDN/custom domain in front of the bucket (e.g. media.reyhomes.com.au
    # or the R2/CloudFront public URL) — falls back to the bucket's own endpoint.
    AWS_S3_CUSTOM_DOMAIN = os.getenv("AWS_S3_CUSTOM_DOMAIN") or None
    AWS_DEFAULT_ACL = None  # bucket policy controls public read, not per-object ACLs
    AWS_S3_FILE_OVERWRITE = False
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=31536000, public"}
    AWS_QUERYSTRING_AUTH = False  # public bucket → clean URLs, no signed query params

    STORAGES = {
        "default": {"BACKEND": "storages.backends.s3.S3Storage"},
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
        },
    }
    if AWS_S3_CUSTOM_DOMAIN:
        MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/"
    elif AWS_S3_ENDPOINT_URL:
        MEDIA_URL = f"{AWS_S3_ENDPOINT_URL.rstrip('/')}/{AWS_STORAGE_BUCKET_NAME}/"
    else:
        MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/"


# ---------------------------------------------------------------------------
# Optional Cloudinary media (free tier: https://cloudinary.com)
# Prefer this OR S3/R2 — if both USE_CLOUDINARY and USE_S3 are True,
# Cloudinary wins. Get credentials from Cloudinary Dashboard → API Keys.
# ---------------------------------------------------------------------------
USE_CLOUDINARY = os.getenv("USE_CLOUDINARY", "False").lower() in ("true", "1", "yes")
if USE_CLOUDINARY:
    INSTALLED_APPS += ["cloudinary", "cloudinary_storage"]
    CLOUDINARY_STORAGE = {
        "CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME", ""),
        "API_KEY": os.getenv("CLOUDINARY_API_KEY", ""),
        "API_SECRET": os.getenv("CLOUDINARY_API_SECRET", ""),
        "SECURE": True,
    }
    # Images + general media. PDFs/videos use raw resource type via same storage.
    STORAGES = {
        "default": {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
    # Public delivery base (django-cloudinary-storage also sets per-file URLs)
    _cn = CLOUDINARY_STORAGE["CLOUD_NAME"]
    MEDIA_URL = f"https://res.cloudinary.com/{_cn}/"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Production security switches. Enable these behind HTTPS in deployment.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "False").lower() in ("true", "1", "yes")
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "False").lower() in ("true", "1", "yes")
CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE", "False").lower() in ("true", "1", "yes")
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if origin.strip()
]

# ---------------------------------------------------------------------------
# Google Workspace / Gmail SMTP
# ---------------------------------------------------------------------------
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    EMAIL_HOST_USER or "hello@reyhomes.com.au",
)
SERVER_EMAIL = DEFAULT_FROM_EMAIL
CONTACT_NOTIFICATION_EMAIL = os.getenv(
    "CONTACT_NOTIFICATION_EMAIL",
    EMAIL_HOST_USER or DEFAULT_FROM_EMAIL,
)
EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT", "20"))

# Used in password-reset emails (no trailing slash)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

# CORS
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,http://127.0.0.1:3000'
    ).split(',')
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True

# DRF
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'config.sanitization.SanitizedJSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    # Coarse global throttle; auth endpoints also apply per-IP cache limits.
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.getenv('DRF_ANON_THROTTLE', '120/min'),
        'user': os.getenv('DRF_USER_THROTTLE', '300/min'),
    },
}

# Absolute media URLs for frontend
if DEBUG:
    # Ensure image URLs returned by serializers are absolute
    pass

# JWT configuration used by member/Pro authentication. Keep access tokens short-lived
# and refresh tokens long enough for normal client sessions; rotate in production.
from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", "30"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "14"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Allow ReyHomes PDF previews in the website
X_FRAME_OPTIONS = "SAMEORIGIN"

# ---------------------------------------------------------------------------
# Advanced Django Admin (django-unfold) — replaces the stock grey admin with
# a grouped, searchable, KPI-driven dashboard for Admins/Staff. Free and
# open-source (MIT-licensed), no paid plan required.
# ---------------------------------------------------------------------------
UNFOLD = {
    "SITE_TITLE": "ReyHomes CMS",
    "SITE_HEADER": "ReyHomes",
    "SITE_SUBHEADER": "Content & operations",
    "SITE_URL": "/",
    "SITE_SYMBOL": "home_work",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "BORDER_RADIUS": "10px",
    "THEME": "dark",
    "ENVIRONMENT": "config.admin_dashboard.environment_callback",
    "DASHBOARD_CALLBACK": "config.admin_dashboard.dashboard_callback",
    "COLORS": {
        "primary": {
            "50": "250 247 240", "100": "244 236 218", "200": "232 216 178",
            "300": "216 199 164", "400": "196 173 120", "500": "140 29 44",
            "600": "120 22 35", "700": "96 18 28", "800": "72 14 21",
            "900": "48 9 14", "950": "24 5 7",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Overview",
                "separator": True,
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": "/admin/",
                    },
                ],
            },
            {
                "title": "Website content",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Hero slides", "icon": "auto_awesome", "link": "/admin/core/heroslide/"},
                    {"title": "Home designs", "icon": "villa", "link": "/admin/homes/homedesign/"},
                    {"title": "Home &amp; land packages", "icon": "holiday_village", "link": "/admin/land/homelandpackage/"},
                    {"title": "Estates", "icon": "location_city", "link": "/admin/land/estate/"},
                    {"title": "Inclusion library", "icon": "checklist", "link": "/admin/core/inclusion/"},
                    {"title": "Testimonials", "icon": "reviews", "link": "/admin/core/testimonial/"},
                    {"title": "Projects", "icon": "engineering", "link": "/admin/projects/project/"},
                    {"title": "Site settings", "icon": "settings", "link": "/admin/core/sitesetting/"},
                ],
            },
            {
                "title": "Users & access",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "All accounts", "icon": "group", "link": "/admin/auth/user/"},
                    {
                        "title": "Administrators",
                        "icon": "shield_person",
                        "link": "/admin/auth/user/?is_superuser__exact=1",
                    },
                    {
                        "title": "Staff",
                        "icon": "badge",
                        "link": "/admin/auth/user/?is_staff__exact=1&is_superuser__exact=0",
                    },
                    {
                        "title": "Clients",
                        "icon": "handshake",
                        "link": "/admin/auth/user/?profile__is_client__exact=1",
                    },
                    {
                        "title": "ReyHomes Pro clients",
                        "icon": "workspace_premium",
                        "link": "/admin/auth/user/?profile__is_reypro__exact=1",
                    },
                    {"title": "Wishlist activity", "icon": "favorite", "link": "/admin/accounts/wishlistitem/"},
                ],
            },
            {
                "title": "Sales & ReyHomes Pro",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "Contracts", "icon": "description", "link": "/admin/pro/contract/"},
                    {"title": "Build projects", "icon": "construction", "link": "/admin/pro/buildproject/"},
                    {"title": "Milestones", "icon": "flag", "link": "/admin/pro/milestone/"},
                    {"title": "Client inclusions", "icon": "kitchen", "link": "/admin/pro/clientinclusion/"},
                    {"title": "Messages", "icon": "forum", "link": "/admin/pro/messagethread/"},
                    {"title": "Notifications", "icon": "notifications", "link": "/admin/pro/notification/"},
                ],
            },
            {
                "title": "Enquiries",
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": "All enquiries", "icon": "mail", "link": "/admin/enquiries/enquiry/"},
                    {
                        "title": "New / unactioned",
                        "icon": "priority_high",
                        "link": "/admin/enquiries/enquiry/?status__exact=new",
                    },
                ],
            },
        ],
    },
    "TABS": [],
}
