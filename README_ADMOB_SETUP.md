# CHROMA ROLL — Android APK + AdMob Setup Guide

Yeh package tumhare **CHROMA ROLL** game ko ek Android app (Capacitor wrapper) mein
badalta hai aur usme AdMob ads (banner + interstitial) already jode hue hain.
Abhi sab kuch **Google ke official TEST ad IDs** pe set hai, taake tum bina kisi
risk ke test kar sako. Real IDs baad mein dalni hain (Step 5).

## Kya milega is folder mein
- `www/` → tumhara poora game (index.html, levels, skins, audio) + `admob.js` (naya file jo AdMob control karta hai)
- `package.json`, `capacitor.config.json` → Android wrapper ka setup
- Yeh guide

---

## Step 0 — Zaroori software (apne computer pe install karo)
1. **Node.js** (LTS version) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio (isme Android SDK bhi aa jaata hai)
3. Android Studio kholke ek baar "SDK Manager" se **Android 14 (API 34)** aur **Android SDK Build-Tools** install kar lena.

⚠️ **Chromebook (khaaskar weak/MediaTek wale) pe hai?** Android Studio mat chalao — hang ho jayega.
Neeche "CHROMEBOOK / WEAK LAPTOP KE LIYE ALTERNATE TAREEKA" section dekho, wahi follow karo, Step 1-6 skip kar do.

## Step 1 — Project set up karo
Terminal/CMD isi folder ke andar khol ke:
```
npm install
npx cap add android
npx cap sync android
```
Yeh ek `android/` folder bana dega — yeh asli Android Studio project hai.

## Step 2 — Android permissions + AdMob App ID
`android/app/src/main/AndroidManifest.xml` kholo aur `<application>` tag ke andar yeh line daalo:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>
```
(Yeh **Google ka test App ID** hai — abhi isi se kaam chalega. Real App ID Step 5 mein aayega.)

Same file mein yeh permission bhi honi chahiye (agar pehle se nahi hai):
```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

## Step 3 — Pehle TEST ads ke saath chalao
`www/admob.js` file mein already Google ke **official test ad unit IDs** hain — kuch change
nahi karna. Ab:
```
npx cap open android
```
Android Studio khulega → ek emulator ya apna phone (USB debugging on) connect karke ▶️ **Run** dabao.
- Lobby mein neeche ek TEST banner dikhna chahiye ("Test Ad" likha hoga).
- 3 level complete/fail karne ke baad ek TEST interstitial (full-screen ad) aayega.

⚠️ **Jab tak "Test Ad" likha dikhta hai, tab tak apne asli AdMob account pe click mat karna
apne hi ad pe baar baar — yeh normal testing hai, koi risk nahi.**

## Step 4 — Apna AdMob account banao
1. https://admob.google.com pe jao → Google account se sign up karo.
2. Payment/address details bhar do (Google isse verify karta hai — bina iske ads live nahi hoti).
3. **Apps → Add App** → "Chroma Roll" naam do → Android select karo → "No, not published on Play Store yet" (abhi upload nahi kiya).
4. Isse ek **App ID** milega jaisa: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`
5. Usi app ke andar **Ad units → Add ad unit** karke banao:
   - Ek **Banner**
   - Ek **Interstitial**
   - (optional) Ek **Rewarded** (agar "watch ad for coins" jaisa feature chahiye)
   Har ek se ek Ad Unit ID milega: `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`

## Step 5 — Real IDs dalna (sirf tab jab testing ho chuki ho)
1. `AndroidManifest.xml` mein test App ID ki jagah apna **real App ID** daalo.
2. `www/admob.js` file kholo, `REAL_IDS` section mein apne 3 real Ad Unit IDs paste karo:
   ```js
   const REAL_IDS = {
     banner: 'ca-app-pub-XXXX.../banner-id',
     interstitial: 'ca-app-pub-XXXX.../interstitial-id',
     rewarded: 'ca-app-pub-XXXX.../rewarded-id',
   };
   ```
3. `admob.js` mein `initializeForTesting: true` ko **release build banate waqt** `false` kar dena.
4. `npx cap sync android` chalao aur dubara build karo.

## Step 6 — Play Store ke liye signed build banana
Android Studio mein: **Build → Generate Signed Bundle / APK → Android App Bundle (AAB)**.
Pehli baar ek keystore banana hoga — usko **bahut sambhal ke rakhna** (kho gaya to future
updates upload nahi kar paoge). AAB file Play Console pe upload hoti hai.

## Step 7 — Pehle se "mana" hone ki wajah — in cheezon ko zaroor check karo
Play Store/AdMob rejection zyada tar in wajahon se hoti hai:
- **Privacy Policy URL** — Play Console mein har app ke liye ek privacy policy link dena zaroori hai (free website/Google Sites pe bhi bana sakte ho).
- **Ads policy** — interstitial ad *turant* app khulte hi ya bahut jaldi jaldi mat dikhao (isliye maine code mein har 3 level ke baad rakha hai, har level ke baad nahi).
- **Content rating questionnaire** — Play Console mein sahi se bharna (bina bhare app reject hoti hai).
- **Target API level** — Google har saal minimum target SDK badalta hai; Capacitor + latest Android Studio use karoge to yeh automatically sahi rahega.
- **Ad unit ID galat/missing** — agar `REAL_IDS` mein koi ID `REPLACE_ME...` reh gayi to code khud-ba-khud test ID use karega (crash nahi hoga), lekin Play Store pe test ads ke saath submit mat karna.
- **Apna hi ad click karna during testing** — account suspend ho sakta hai, isliye Step 3 zaroor follow karo.

---

Agar kisi step pe atak jao (Android Studio error, manifest issue, signing issue), mujhe
exact error message bhej dena — main usi ke hisaab se fix bata dunga.

---

## CHROMEBOOK / WEAK LAPTOP KE LIYE ALTERNATE TAREEKA (koi install nahi)

Isme sirf **browser** chahiye — build GitHub ke free cloud computer pe hoti hai.

### A. GitHub account aur repo banao
1. https://github.com pe jaake free account banao (agar nahi hai).
2. Upar right "+" > **New repository** > naam do (e.g. `chroma-roll`) > **Create repository**.
3. Us khali repo ke page pe "**uploading an existing file**" link pe click karo.
4. Is poore `admob_package` folder ke **saare files aur folders** (www, .github, package.json, capacitor.config.json — sab kuch) drag-and-drop karke upload kar do. (Agar drag-drop se `.github` folder na jaye, to GitHub Desktop web upload thoda mushkil hai — us case mein mujhe bata dena, main alag tareeka bata dunga.)
5. Neeche "Commit changes" dabao.

### B. Build chalao
1. Repo ke andar upar **"Actions"** tab pe jao.
2. "Build Chroma Roll APK" workflow dikhega — usme click karo.
3. "**Run workflow**" button dabao (dropdown se) > phir se "Run workflow" green button.
4. 3-5 minute wait karo (page refresh karte raho) — jab tak green ✅ tick na aa jaye.

### C. APK download karke phone pe install karo
1. Us completed run pe click karo, neeche "**Artifacts**" mein `chroma-roll-debug-apk` milega — download kar lo (yeh ek zip hoga, andar `.apk` file hai).
2. Yeh file apne Android phone pe bhejo (Google Drive, WhatsApp-to-self, ya USB cable se).
3. Phone pe us `.apk` file pe tap karo → "Install from unknown source allow karo" aayega to allow kar do (yeh sirf phone ki setting hai, Chromebook se koi lena dena nahi) → Install.
4. Game khulega — lobby mein neeche "Test Ad" banner dikhega, 3 level ke baad test interstitial aayega. Agar yeh dikh gaya to sab sahi chal raha hai.

Jab Step 4-5 (real AdMob account + real IDs) kar loge, tab isi workflow ko dubara run karke naya APK milega — Chromebook pe kabhi kuch install nahi karna padega.

