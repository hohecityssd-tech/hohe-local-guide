# HOHE CITY LOCAL GUIDE — Analytics setup (GA4)

## Current status
The production map uses GA4 (Measurement ID: **G-TML12HSGK4**) only after each visitor opts in. Existing cookie-free Vercel Web Analytics remains separate and unchanged. Vercel Country reports connection location, not nationality or the language displayed by the guide.

There is no change to the existing printed QR code or the map's core navigation.

## Connect Google Analytics
1. Open https://analytics.google.com/ with a hotel-managed Google account.
2. Select the existing GA4 property with the **Web** stream for https://hohe-local-guide.vercel.app/.
3. Confirm the stream Measurement ID; do not create a duplicate property.
4. The GA4_MEASUREMENT_ID in analytics.js is already set to **G-TML12HSGK4**. Confirm the property/web stream belongs to the hotel. Measurement IDs are public; do not include API secrets.
5. Review the hotel privacy notice and legal requirements for analytics, cookies, consent, and any cross-border processing. The compact multilingual consent banner is **not a replacement for a privacy policy**.
6. Open the website, choose **Allow analytics**, and verify in GA4 > Reports > Realtime. Declining analytics leaves the map usable and sends no GA4 events; existing Vercel pageviews remain enabled.
7. Test on mobile, including NAVER MAP and GOOGLE MAPS buttons.

## Events
| Event | Trigger | Parameters |
| --- | --- | --- |
| page_view | Page loaded after analytics consent | guide_language, entry_channel |
| guide_language_view | Once per page load, only after consent | guide_language, guide_language_group |
| guide_language_change | Consenting visitor selects a different language in the introduction dialog | guide_language (destination), guide_language_group (destination), previous_guide_language |
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
- guide_language_group (EN, JP, CN, KR; both Chinese scripts are CN)
- previous_guide_language (source language for language changes)
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
- Language: follow the language report below.

## 언어별 방문자 보고서

1. GA4 **관리 → 데이터 표시 → 맞춤 정의**에서 이벤트 범위로 `guide_language_group`을 등록합니다. 표시 이름은 **가이드 표시 언어**를 권장합니다. `guide_language`도 등록하면 중국어 간체/번체를 구분할 수 있습니다.
2. **탐색 → 자유 형식**에서 측정기준 **가이드 표시 언어**, **이벤트 이름**을 가져오고 측정항목 **총 사용자**, **세션**, **이벤트 수**를 가져옵니다.
3. 행에 **가이드 표시 언어**, 값에 **총 사용자**, **세션**, **이벤트 수**를 놓습니다. 필터는 **이벤트 이름이 정확히 `guide_language_view`와 일치**로 설정합니다.
4. 탐색 이름은 **가이드 언어별 방문**으로 저장합니다. EN=영어, JP=일본어, CN=중국어, KR=한국어입니다. 이는 국적이 아니라 실제 표시된 언어입니다.
5. 언어 변경 횟수는 별도 탭에서 이벤트 이름을 `guide_language_change`로 필터링하고 이벤트 수를 확인합니다. 행은 변경 후 언어이며, `previous_guide_language`를 추가하면 변경 전 언어를 볼 수 있습니다.

**해석:** 최초 표시 이벤트는 페이지당 한 번이며 GA4 세션 시작 이벤트를 대체하지 않습니다. 새로고침과 언어 변경 후 재로드도 표시 횟수를 늘립니다. 따라서 이벤트 수를 방문자 수로 읽지 마세요. 한 사람이 같은 세션에서 여러 언어를 쓰면 여러 행에 포함되므로 언어별 사용자/세션의 합은 전체 고유 수와 다를 수 있습니다. 비동의·차단 방문자는 제외되고, 과거 방문의 표시 언어는 소급 복구되지 않습니다. 기본 GA4 **언어** 측정기준은 브라우저 언어이므로 이 맞춤 측정기준을 사용하세요.

맞춤 정의 등록 및 데이터 전송 후 일반 보고서 반영에 24–48시간이 걸릴 수 있습니다. 실시간 이벤트에서 먼저 확인하세요. https://support.google.com/analytics/answer/14239696?hl=ko

언어 선택은 지도 정보(i) 버튼으로 여는 소개창에 있습니다. 선택하면 `lang` 쿼리를 변경해 페이지를 다시 표시합니다. 비동의 중에는 변경 이벤트를 저장하거나 나중에 재전송하지 않습니다. 태그가 차단되어도 최대 500ms 후 언어 변경을 진행합니다.

## Verification

Run `node --test tests/analytics.test.cjs`. Tests cover all five locales, grouped labels, no consent, denial, withdrawal/re-consent, blocked storage, duplicate initialization, sanitized page location, and navigation with a blocked tag.

Production checks: open `?lang=ja`, allow analytics, inspect requests to Google Analytics for `guide_language_view` with `guide_language_group=JP`; change to Chinese and confirm `guide_language_change` then `guide_language_view` with CN. In a fresh browser without consent, and after declining, no Google tag or GA4 events should be sent. Existing `/_vercel/insights/` pageviews should remain present.

Clicks do not prove a guest physically visited a venue. Opt-outs, blockers, and privacy choices can reduce measured traffic. Do not treat untagged visits as verified QR scans.

## Consent and privacy notes
- The Google Analytics script is not loaded before affirmative choice.
- Consent is stored locally in the browser, and visitors can decline.
- A small **Analytics preferences** link appears in the existing introduction dialog once GA4 is configured. It allows visitors to change their choice.
- Custom event parameters contain no guest names, booking information, or precise GPS coordinates.
- Google may process other usage/technical data. Review relevant privacy disclosure and cross-border processing requirements before activation.
- To fully disable analytics again, clear GA4_MEASUREMENT_ID in analytics.js and redeploy.
