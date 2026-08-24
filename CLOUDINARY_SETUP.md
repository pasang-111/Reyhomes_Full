# Free media with Cloudinary

Cloudinary free plan is enough for testing: storage + bandwidth + image CDN.

## 1. Create a free account

1. Go to https://cloudinary.com → **Sign up** (free)
2. Open **Console** → **Settings** (or Product environment) → **API Keys**
3. Copy:
   - **Cloud name**
   - **API Key**
   - **API Secret**

## 2. Set env vars on Render

| Key | Value |
|-----|--------|
| `USE_CLOUDINARY` | `True` |
| `USE_S3` | `False` |
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | your API key |
| `CLOUDINARY_API_SECRET` | your API secret |

Save → **Manual Deploy**.

## 3. Test

1. `https://YOUR-BACKEND.onrender.com/admin/` → log in  
2. Upload an image on a design / package / hero  
3. Image URL should look like:  
   `https://res.cloudinary.com/<cloud_name>/image/upload/...`  
4. Redeploy backend → image still loads  

## Notes

- If both `USE_CLOUDINARY` and `USE_S3` are True, **Cloudinary wins**.
- Frontend already allows `res.cloudinary.com` in `next.config.ts`.
- Free tier limits change over time; check Cloudinary pricing page for current caps.
