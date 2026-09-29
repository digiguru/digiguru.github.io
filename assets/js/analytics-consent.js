(() => {
  "use strict";

  const script = document.currentScript;
  const measurementId = String(script?.dataset?.measurementId || "").trim();
  const CONSENT_KEY = "art-google-analytics-consent-v1";
  const NOTICE_DISMISSED_KEY = "art-analytics-notice-dismissed-v1";
  const NOTICE_SESSION_KEY = "art-analytics-notice-session-v1";
  const GOOGLE_SCRIPT_ID = "art-google-analytics";
  const configured = /^G-[A-Z0-9]+$/i.test(measurementId);

  function privacySignal() {
    return navigator.globalPrivacyControl === true
      || navigator.doNotTrack === "1"
      || window.doNotTrack === "1";
  }

  function readConsent() {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return value === "granted" || value === "denied" ? value : null;
    } catch {
      return "denied";
    }
  }

  function writeConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      return true;
    } catch {
      return false;
    }
  }

  function persistentNoticeDismissed() {
    try {
      return localStorage.getItem(NOTICE_DISMISSED_KEY) === "1";
    } catch {
      return true;
    }
  }

  function sessionNoticeDismissed() {
    try {
      return sessionStorage.getItem(NOTICE_SESSION_KEY) === "1";
    } catch {
      return true;
    }
  }

  function rememberPersistentDismissal() {
    try {
      localStorage.setItem(NOTICE_DISMISSED_KEY, "1");
      sessionStorage.removeItem(NOTICE_SESSION_KEY);
    } catch {
      // Storage failure leaves the privacy-safe provider choice in force.
    }
  }

  function rememberSessionDismissal() {
    try {
      localStorage.removeItem(NOTICE_DISMISSED_KEY);
      sessionStorage.setItem(NOTICE_SESSION_KEY, "1");
    } catch {
      // Storage failure simply means the prompt can reappear later.
    }
  }

  function shouldAutoOpenAnalyticsNotice() {
    return !persistentNoticeDismissed()
      && !sessionNoticeDismissed()
      && readConsent() !== "granted";
  }

  function safeUrl(rawUrl = location.href) {
    const url = new URL(rawUrl, location.origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  function installQueue() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function (...args) {
      window.dataLayer.push(args);
    };
  }

  function gtag(...args) {
    installQueue();
    window.gtag(...args);
  }

  function setGoogleDisabled(disabled) {
    if (!configured) return;
    window["ga-disable-" + measurementId] = disabled;
  }

  function loadGoogleAnalytics() {
    if (!configured || privacySignal() || readConsent() !== "granted") return false;

    setGoogleDisabled(false);
    gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    gtag("set", {
      page_location: safeUrl(),
      page_referrer: ""
    });
    gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: safeUrl(),
      page_referrer: ""
    });

    if (!document.getElementById(GOOGLE_SCRIPT_ID)) {
      const googleScript = document.createElement("script");
      googleScript.id = GOOGLE_SCRIPT_ID;
      googleScript.async = true;
      googleScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
      document.head.appendChild(googleScript);
    }

    gtag("event", "page_view", {
      page_title: document.title,
      page_location: safeUrl(),
      page_referrer: ""
    });
    return true;
  }

  function expireGoogleCookies() {
    const names = document.cookie
      .split(";")
      .map((entry) => entry.trim().split("=")[0])
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));

    const host = location.hostname;
    const labels = host.split(".").filter(Boolean);
    const registrable = labels.length >= 2 ? "." + labels.slice(-2).join(".") : "";
    const domains = ["", host, "." + host, registrable]
      .filter((value, index, all) => all.indexOf(value) === index);

    for (const name of names) {
      for (const domain of domains) {
        document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax" + (domain ? "; domain=" + domain : "");
      }
    }
  }

  function disableGoogleAnalytics() {
    setGoogleDisabled(true);
    if (typeof window.gtag === "function") {
      gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    }
    document.getElementById(GOOGLE_SCRIPT_ID)?.remove();
    expireGoogleCookies();
  }

  function buildControls() {
    const settings = document.createElement("button");
    settings.type = "button";
    settings.className = "analytics-settings-button";
    settings.textContent = "Analytics & privacy";
    settings.setAttribute("aria-haspopup", "dialog");

    const dialog = document.createElement("aside");
    dialog.className = "analytics-consent-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "false");
    dialog.setAttribute("aria-label", "Analytics and privacy");
    dialog.hidden = true;
    dialog.innerHTML = `
      <button class="analytics-consent-close" type="button" aria-label="Close analytics preferences and use the defaults" data-close>×</button>
      <strong>Analytics &amp; privacy</strong>
      <p>
        This site can use Google Analytics to understand which pages are useful. Google Analytics uses analytics cookies
        and does not load at all until you explicitly allow it.
      </p>
      <p>
        Query strings and URL fragments are removed before page locations are sent. Google advertising storage, Signals
        and ad personalisation stay disabled.
      </p>
      <p data-privacy-signal hidden><strong>Your browser is sending a privacy signal, so Google Analytics is disabled.</strong></p>
      <p data-unconfigured hidden><strong>Google Analytics is not configured for this deployment.</strong></p>
      <p><strong>Google Analytics cookies:</strong> <span data-consent-status></span></p>
      <div class="analytics-consent-actions">
        <button type="button" data-allow>Allow analytics cookies</button>
        <button type="button" data-deny>No analytics cookies</button>
      </div>
    `;

    const refresh = () => {
      const signal = privacySignal();
      dialog.querySelector("[data-privacy-signal]").hidden = !signal;
      dialog.querySelector("[data-unconfigured]").hidden = configured;
      dialog.querySelector("[data-consent-status]").textContent = readConsent() === "granted" ? "Allowed" : "Not allowed";
      dialog.querySelector("[data-allow]").disabled = signal || !configured;
    };

    settings.addEventListener("click", () => {
      refresh();
      dialog.hidden = false;
    });
    dialog.querySelector("[data-close]").addEventListener("click", () => {
      if (readConsent() === null) writeConsent("denied");
      disableGoogleAnalytics();
      rememberPersistentDismissal();
      dialog.hidden = true;
    });
    dialog.querySelector("[data-allow]").addEventListener("click", () => {
      if (privacySignal() || !configured || !writeConsent("granted")) return;
      rememberPersistentDismissal();
      loadGoogleAnalytics();
      dialog.hidden = true;
    });
    dialog.querySelector("[data-deny]").addEventListener("click", () => {
      writeConsent("denied");
      rememberSessionDismissal();
      disableGoogleAnalytics();
      dialog.hidden = true;
    });

    document.body.append(settings, dialog);
    refresh();
    if (shouldAutoOpenAnalyticsNotice()) dialog.hidden = false;
  }

  function initialise() {
    if (privacySignal()) disableGoogleAnalytics();
    else if (readConsent() === "granted") loadGoogleAnalytics();
    buildControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();
