HOHE CITY LOCAL GUIDE v2.2

Changes
- Keeps the map visually minimal.
- HOHE CITY remains the only permanent text label on the map.
- Tap a pin to show:
    English/romanized place name
    Korean place name
    One-line category/food description
    DIRECTIONS
- Seoul Folk Flea Market uses a more intuitive attraction icon.
- MY LOCATION remains available.
- Corrected Na Jeong-sun Halmae Jjukkumi main branch location at 무학로 144.
- places.json remains the simple master list for future additions.

Deployment
- This repository is the source of truth for the Hohe City Local Guide.
- Connect the Vercel project to this GitHub repository to keep a stable production URL.

Git connection verification trigger: 2026-10-02


Optional place photographs (introduced 2026-10-10)
- Photos are optional; existing places display exactly as before without a "photos" field.
- Add 1–3 real venue photos to the corresponding object in places.json:
    "photos": [
      {
        "src": "./photos/venue-exterior.webp",
        "alt": {"ko":"매장 외관", "en":"Exterior of the venue"},
        "caption": {"ko":"외관", "en":"Exterior"}
      },
      {
        "src": "./photos/venue-entrance.webp",
        "alt": {"ko":"매장 입구", "en":"Entrance"},
        "caption": {"ko":"입구", "en":"Entrance"}
      }
    ]
- Files must actually exist under /photos/ (or use a permitted HTTPS image URL).
- Recommended: WebP, 4:3 or 16:9 crop, 1000–1400 px wide, ideally less than ~250 KB each.
- Use original hotel-staff photos or material that the hotel has permission to republish. Do not hotlink/copy Naver or Google business-gallery photos without permission.
- Photo order: (1) entrance or exterior, (2) distinctive interior/menu, (3) nearby visual landmark. Keep only relevant photos.
- Detail card: horizontal swipe, 1/3 counter, caption, tap to enlarge; non-photo places have no empty photo panel.
- Test layout with ?photoDemo=1 on the deployment. This ONLY shows two explicitly labeled abstract demonstration illustrations for the hotel; it does not represent actual property images.
- Actual photos are not present yet. Upload or supply approved originals to activate the gallery.
