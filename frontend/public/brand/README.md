# ReyHomes brand logos

## Variants

| File | Use on |
|------|--------|
| `reyhomes-logo-dark.svg` | Cream / white backgrounds |
| `reyhomes-logo-light.svg` | Black / navy backgrounds |
| `reyhomes-mark-dark.svg` | Icon only, light surfaces |
| `reyhomes-mark-light.svg` | Icon only, dark surfaces |

## React

```tsx
import BrandLogo from "@/components/brand/BrandLogo";

// Navbar / footer (dark chrome)
<BrandLogo variant="light" layout="full" height={40} />

// Light page header
<BrandLogo variant="dark" layout="full" height={40} />

// Favicon-style mark
<BrandLogo variant="light" layout="mark" height={28} />
```

Open `preview.html` in a browser to see the four-up board (cream, white, black, navy).
