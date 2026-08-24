# Persistent disk + WP seed

```env
USE_CLOUDINARY=False
USE_S3=False
MEDIA_ROOT=/var/data/media
```

```bash
python manage.py seed_wp_media --create-missing --force
python manage.py seed_wp_media --local-dir=/var/data/wp-uploads --force
```

Merge policy: only WP fields are filled; ReyHomes price/inclusions/etc. stay.
