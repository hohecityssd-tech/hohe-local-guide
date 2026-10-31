# HOHE CITY LOCAL GUIDE — Analytics setup (GA4)

## Current status
The map has a **configured** GA4 integration (Measurement ID: **G-TML12HSGK4**) on a separate feature branch. It is **not collecting any live data** until the privacy notice is reviewed and the branch is merged/deployed. Once deployed, analytics loads only after each visitor opts in.

There is no change to the existing printed QR code or the map's core navigation.

## Connect Google Analytics
1. Open https://analytics.google.com/ with a hotel-managed Google account.
2. Create a GA4 property and a **Web** data stream for https://hohe-local-guide.vercel.app/.
3. Copy the Measurement ID (format **G-XXXXXXXXXX**).
4. The GA4_MEASUREMENT_ID in analytics.js is already set to **G-TML12HSGK4**. Confirm the property/web stream belongs to the hotel. Measurement IDs are public; do not include API secrets.
5. Review the hotel privacy notice and legal requirements for analytics, cookies, consent, and any cross-border processing. The compact multilingual consent banner is **not a replacement for a privacy policy**.
6. Merge/deploy after review. Open the website, choose **Allow analytics**, and verify in GA4 > Reports > Realtime (or DebugView). Declining analytics leaves the map usable and sends no events.
7. Test on mobile, including NAVER MAP and GOOGLE MAPS buttons.

## Events
| Event | Trigger | Parameters |
| --- | --- | --- |
| page_view | Page loaded after analytics consent | guide_language, entry_channel |
| guide_place_view | A place detail sheet opens | place_name, place_category, place_area, guide_language |
| guide_photo_open | A photo opens in the full-screen viewer | place_name, place_category, place_area, guide_language |
| guide_map_outbound | Guest taps NAVER MAP / GOOGLE MAPS | place_name, place_category, place_area, guide_language, map_provider |
| guide_booking_outbound | Guest taps external booking link | place_name, place_category, place_area, guide_language |

place_area uses optional place.area (if supplied), otherwise derives a Seoul district (구) from the existing address. It measures interest in **clicked places**, not the guest's physical location or arbitrary map panning.

entry_channel is hotel_qr only when the URL explicitly has ?src=qr or ?utm_source=hotel_qr. Otherwise it is unspecified. An existing QR pointing to the base URL cannot be distinguished from a direct visit.

The current map has no category filter buttons. Food/Cafe/etc. interest is measured using the category of opened places, not filter interactions.

## Create event-scoped custom dimensions in GA4
In **Admin > Data display > Custom definitions > Create custom dimensions**, set Scope to **Event** and add these exact event parameter names:

- place_name (popular venues)
- place_category (food/cafe/bar/spot/shop/bakery/transport/experience)
- place_area (region or district)
- guide_language (en, ja, zhHans, zhHant, ko)
- map_provider (naver or google)
- entry_channel (hotel_qr or unspecified)

Custom dimensions may take 24–48 hours to populate. Event counts are not unique visitor counts. For time spent using the map, use **average engagement time**, not elapsed time from opening a tab to closing it.

## Suggested operating dashboard
- Visits and active users per day/week/month.
- Average engagement time per session.
- Category interest: guide_place_view counts grouped by place_category.
- Popular places: guide_place_view by place_name.
- Place-to-navigation intent: guide_map_outbound / guide_place_view by place.
- Area interest: guide_place_view by place_area.
- Language: page_view or guide_place_view by guide_language.

Clicks do not prove a guest physically visited a venue. Opt-outs, blockers, and privacy choices can reduce measured traffic. Do not treat untagged visits as verified QR scans.

## Consent and privacy notes
- The Google Analytics script is not loaded before affirmative choice.
- Consent is stored locally in the browser, and visitors can decline.
- A small **Analytics preferences** link appears in the existing introduction dialog once GA4 is configured. It allows visitors to change their choice.
- Custom event parameters contain no guest names, booking information, or precise GPS coordinates.
- Google may process other usage/technical data. Review relevant privacy disclosure and cross-border processing requirements before activation.
- To fully disable analytics again, clear GA4_MEASUREMENT_ID in analytics.js and redeploy.
