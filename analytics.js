/* HOHE CITY LOCAL GUIDE — GA4 event tracking.
 * Disabled until GA4_MEASUREMENT_ID is filled in.
 * Google Analytics only loads after a visitor explicitly allows usage analytics.
 * The map works normally when tracking is disabled or declined.
 */
(function () {
  "use strict";

  // Paste the Google Analytics 4 web stream Measurement ID here (example: G-XXXXXXXXXX).
  const GA4_MEASUREMENT_ID = "";
  const CONSENT_KEY = "hohe-guide-analytics-consent-v1";
  const TRACKING_READY = /^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID);
  const COPY = {
    en: {
      title: "Help improve this guide",
      text: "May we use Google Analytics to understand map visits and which places are opened? We do not send booking details or precise GPS coordinates.",
      yes: "Allow analytics", no: "No thanks",
      settings: "Analytics preferences", privacy: "Google privacy information"
    },
    ja: {
      title: "ガイドの改善にご協力ください",
      text: "地図の閲覧数やスポットの表示回数を確認するため、Google Analytics の利用を許可しますか？予約情報や正確なGPS位置は送信しません。",
      yes: "許可する", no: "許可しない",
      settings: "アクセス解析の設定", privacy: "Google のプライバシー情報"
    },
    zhHans: {
      title: "帮助我们改进指南",
      text: "是否允许使用 Google Analytics 统计地图访问次数和地点查看次数？我们不会发送预订信息或精确的 GPS 位置。",
      yes: "允许统计", no: "暂不允许",
      settings: "数据分析设置", privacy: "Google 隐私信息"
    },
    zhHant: {
      title: "協助我們改進指南",
      text: "是否允許使用 Google Analytics 統計地圖造訪次數和地點瀏覽次數？我們不會傳送訂房資訊或精確的 GPS 位置。",
      yes: "允許統計", no: "暫不允許",
      settings: "數據分析設定", privacy: "Google 隱私資訊"
    },
    ko: {
      title: "로컬 가이드 개선에 도움을 주세요",
      text: "지도 방문 및 장소 조회 통계를 위해 Google Analytics 사용에 동의하시나요? 예약 정보나 정확한 GPS 위치는 전송하지 않습니다.",
      yes: "분석 허용", no: "허용하지 않음",
      settings: "분석 설정", privacy: "Google 개인정보 안내"
    }
  };

  let guideLanguage = "en";
  let active = false;
  let tagLoaded = false;
  let banner = null;

  function getChoice() {
    try { return window.localStorage.getItem(CONSENT_KEY); }
    catch (_) { return null; }
  }

  function saveChoice(choice) {
    try { window.localStorage.setItem(CONSENT_KEY, choice); }
    catch (_) { /* Private mode can block storage. Consent still applies to this page. */ }
  }

  function cleanPageLocation() {
    // Do not send QR query strings or arbitrary URL parameters to Analytics.
    return window.location.origin + window.location.pathname;
  }

  function startAnalytics() {
    if (!TRACKING_READY || active) return;
    window["ga-disable-" + GA4_MEASUREMENT_ID] = false;
    active = true;
    if (tagLoaded) {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "granted" });
      }
      return;
    }
    tagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA4_MEASUREMENT_ID, {
      send_page_view: false,
      page_location: cleanPageLocation(),
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(GA4_MEASUREMENT_ID);
    document.head.appendChild(tag);

    const query = new URLSearchParams(window.location.search);
    const entryChannel = query.get("src") === "qr" || query.get("utm_source") === "hotel_qr"
      ? "hotel_qr" : "unspecified";
    track("page_view", {
      page_title: "HOHE CITY LOCAL GUIDE",
      page_location: cleanPageLocation(),
      entry_channel: entryChannel
    });
  }

  function track(eventName, params) {
    if (!active || typeof window.gtag !== "function") return;
    window.gtag("event", eventName, Object.assign({
      guide_language: guideLanguage
    }, params || {}));
  }

  function placeParams(place) {
    if (!place) return {};
    const address = String(place.address || "");
    const district = address.match(/(?:^|\s)([가-힣]+구)(?=\s|$)/);
    const area = typeof place.area === "string" && place.area.trim()
      ? place.area.trim() : (district ? district[1] : "unknown");
    return {
      place_name: String(place.name || "unknown").slice(0, 100),
      place_category: String(place.category || "unknown").slice(0, 40),
      place_area: area.slice(0, 60)
    };
  }

  function closeBanner() {
    if (banner) {
      banner.remove();
      banner = null;
    }
  }

  function setConsent(allow) {
    saveChoice(allow ? "granted" : "denied");
    closeBanner();
    if (allow) {
      startAnalytics();
    } else if (active) {
      active = false;
      window["ga-disable-" + GA4_MEASUREMENT_ID] = true;
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "denied" });
      }
    }
  }

  function showConsent() {
    if (!TRACKING_READY || banner) return;
    const copy = COPY[guideLanguage] || COPY.en;
    banner = document.createElement("section");
    banner.className = "hohe-analytics-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", copy.title);

    const title = document.createElement("strong");
    title.textContent = copy.title;
    const text = document.createElement("p");
    text.textContent = copy.text;
    const link = document.createElement("a");
    link.href = "https://policies.google.com/privacy";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = copy.privacy;

    const actions = document.createElement("div");
    actions.className = "hohe-analytics-actions";
    const decline = document.createElement("button");
    decline.type = "button";
    decline.textContent = copy.no;
    decline.addEventListener("click", function () { setConsent(false); });
    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "hohe-analytics-accept";
    accept.textContent = copy.yes;
    accept.addEventListener("click", function () { setConsent(true); });
    actions.append(decline, accept);
    banner.append(title, text, link, actions);
    document.body.appendChild(banner);
  }

  function createSettingsLink() {
    const intro = document.querySelector(".intro-dialog");
    if (!intro || intro.querySelector(".hohe-analytics-settings")) return;
    const copy = COPY[guideLanguage] || COPY.en;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hohe-analytics-settings";
    button.textContent = copy.settings;
    button.addEventListener("click", function () { showConsent(); });
    const explore = intro.querySelector("#introExplore");
    intro.insertBefore(button, explore || null);
  }

  function init(language) {
    guideLanguage = COPY[language] ? language : "en";
    if (!TRACKING_READY) return;
    const style = document.createElement("style");
    style.textContent = [
      ".hohe-analytics-banner{position:fixed;left:12px;right:12px;bottom:12px;z-index:100;",
      "max-width:520px;margin:0 auto;background:#fffdf9;color:#262522;",
      "box-shadow:0 8px 32px #0003;border:1px solid #e5ded3;border-radius:12px;",
      "padding:16px;font:13px/1.55 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;}",
      ".hohe-analytics-banner strong{display:block;font-size:14px;margin-bottom:5px;}",
      ".hohe-analytics-banner p{margin:0 0 7px;}",
      ".hohe-analytics-banner a{color:#6b5441;text-decoration:underline;font-size:12px;}",
      ".hohe-analytics-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;}",
      ".hohe-analytics-actions button{border:1px solid #bfb6ab;background:#fff;padding:8px 12px;",
      "border-radius:8px;cursor:pointer;color:#2a1a0e;}",
      ".hohe-analytics-actions .hohe-analytics-accept{background:#2a1a0e;color:#fff;border-color:#2a1a0e;}",
      ".hohe-analytics-settings{display:block;margin:12px auto 0;padding:4px;",
      "background:transparent;border:0;color:#77736c;text-decoration:underline;",
      "font-size:12px;cursor:pointer;}"
    ].join("");
    document.head.appendChild(style);

    createSettingsLink();
    if (getChoice() === "granted") startAnalytics();
    else if (getChoice() !== "denied") showConsent();
  }

  window.HOHEAnalytics = {
    init: init,
    placeOpen: function (place) { track("guide_place_view", placeParams(place)); },
    photoOpen: function (place) { track("guide_photo_open", placeParams(place)); },
    mapOutbound: function (place, provider) {
      track("guide_map_outbound", Object.assign(placeParams(place), {
        map_provider: provider
      }));
    },
    bookingOutbound: function (place) { track("guide_booking_outbound", placeParams(place)); }
  };
}());
