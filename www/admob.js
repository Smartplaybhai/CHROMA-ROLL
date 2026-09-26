/*
  CHROMA ROLL — AdMob integration (Capacitor)
  ---------------------------------------------
  This file wraps @capacitor-community/admob so the rest of the game
  (check.js) never has to touch the plugin directly. It only does
  anything when running inside the Capacitor Android app — on a normal
  web page it silently does nothing, so this file is safe to include
  even before you wrap the game.

  ⚠️ TEST IDS ARE HARD-CODED BELOW ON PURPOSE.
  Google's policy requires you to test with these official test ad
  unit IDs FIRST. Only swap in your real IDs (from your own AdMob
  account) after the app works correctly and is ready to submit.
  Serving real ads to yourself while testing = account ban risk.
*/

window.CR_ADS = (function () {
  const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  // ---- Google's OFFICIAL test ad unit IDs (safe to leave while testing) ----
  const TEST_IDS = {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  };

  // ---- YOUR REAL IDS ----
  // Fill these in only after you create your AdMob app + ad units.
  // Leave them exactly as 'REPLACE_ME_...' while testing — the code
  // below automatically falls back to Google's test IDs whenever it
  // sees a REPLACE_ME_ value, so you can never accidentally ship a
  // half-configured ad unit.
  const REAL_IDS = {
    banner: 'REPLACE_ME_BANNER_AD_UNIT_ID',
    interstitial: 'REPLACE_ME_INTERSTITIAL_AD_UNIT_ID',
    rewarded: 'REPLACE_ME_REWARDED_AD_UNIT_ID',
  };

  function idFor(kind) {
    const real = REAL_IDS[kind];
    return (!real || real.startsWith('REPLACE_ME')) ? TEST_IDS[kind] : real;
  }

  let AdMobPlugin = null;
  let ready = false;
  let interstitialLoaded = false;
  let rewardedLoaded = false;
  let levelsSinceInterstitial = 0;
  const SHOW_INTERSTITIAL_EVERY_N_LEVELS = 3; // don't show an ad after every single level

  async function init() {
    if (!isNative) { console.log('[CR_ADS] Not running as a native app — ads disabled.'); return; }
    try {
      const mod = await import('@capacitor-community/admob');
      AdMobPlugin = mod.AdMob;
      await AdMobPlugin.initialize({
        // testingDevices: ['YOUR_TEST_DEVICE_ID'], // add your phone's AdMob device ID here while testing
        initializeForTesting: true, // ⚠️ set this to false only for your real release build
      });
      ready = true;
      preloadInterstitial();
      preloadRewarded();
      showBanner(); // lobby is the first screen the player sees, so show it there
      console.log('[CR_ADS] AdMob initialized.');
    } catch (e) {
      console.warn('[CR_ADS] AdMob init failed (expected in plain browser preview):', e);
    }
  }

  async function showBanner() {
    if (!ready) return;
    try {
      await AdMobPlugin.showBanner({
        adId: idFor('banner'),
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
      });
    } catch (e) { console.warn('[CR_ADS] showBanner failed:', e); }
  }

  async function hideBanner() {
    if (!ready) return;
    try { await AdMobPlugin.hideBanner(); } catch (e) {}
  }

  async function preloadInterstitial() {
    if (!ready) return;
    try {
      await AdMobPlugin.prepareInterstitial({ adId: idFor('interstitial') });
      interstitialLoaded = true;
    } catch (e) { console.warn('[CR_ADS] preloadInterstitial failed:', e); }
  }

  async function maybeShowInterstitial() {
    // Call this on natural break points only (level complete / level failed),
    // never mid-gameplay, and never on the very first level of a session.
    if (!ready) return;
    levelsSinceInterstitial++;
    if (levelsSinceInterstitial < SHOW_INTERSTITIAL_EVERY_N_LEVELS) return;
    levelsSinceInterstitial = 0;
    if (!interstitialLoaded) { await preloadInterstitial(); if (!interstitialLoaded) return; }
    try {
      await AdMobPlugin.showInterstitial();
      interstitialLoaded = false;
      preloadInterstitial(); // load the next one for later
    } catch (e) { console.warn('[CR_ADS] showInterstitial failed:', e); }
  }

  async function preloadRewarded() {
    if (!ready) return;
    try {
      await AdMobPlugin.prepareRewardVideoAd({ adId: idFor('rewarded') });
      rewardedLoaded = true;
    } catch (e) { console.warn('[CR_ADS] preloadRewarded failed:', e); }
  }

  // onReward: function(rewardItem) called only if the user actually watches to the end
  async function showRewarded(onReward, onFail) {
    if (!ready) { if (onFail) onFail(); return; }
    if (!rewardedLoaded) { await preloadRewarded(); if (!rewardedLoaded) { if (onFail) onFail(); return; } }
    try {
      AdMobPlugin.addListener('onRewardedVideoReward', (reward) => { if (onReward) onReward(reward); });
      await AdMobPlugin.showRewardVideoAd();
      rewardedLoaded = false;
      preloadRewarded();
    } catch (e) {
      console.warn('[CR_ADS] showRewarded failed:', e);
      if (onFail) onFail();
    }
  }

  async function showInterstitialNow() {
    // Unlike maybeShowInterstitial, this ALWAYS shows an ad immediately
    // (used for the hint button — one ad per hint request).
    if (!ready) return;
    if (!interstitialLoaded) { await preloadInterstitial(); if (!interstitialLoaded) return; }
    try {
      await AdMobPlugin.showInterstitial();
      interstitialLoaded = false;
      preloadInterstitial();
    } catch (e) { console.warn('[CR_ADS] showInterstitialNow failed:', e); }
  }

  return { init, showBanner, hideBanner, maybeShowInterstitial, showInterstitialNow, showRewarded };
})();

document.addEventListener('DOMContentLoaded', () => { window.CR_ADS.init(); });
