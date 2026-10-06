# Heavenly Visions: Google Play and App Store package

Everything here was made without creating any account and without paying anything. You follow the steps, and the files are ready.

## What is in this folder

| Path | What it is |
|---|---|
| `icons/android/` | Launcher icons (mdpi to xxxhdpi), Play Store icon 512, adaptive icon (foreground, background, color), splash logo |
| `icons/ios/` | App Store icon 1024 (no transparency) and all the small sizes |
| `graphics/` | Play feature graphic 1024x500 |
| `screenshots/phone/` | 1080x1920 phone screenshots (8) |
| `screenshots/tablet/` | 7 inch (1200x1920) and 10 inch (1600x2560) tablet screenshots |
| `listing-en.md`, `listing-ar.md` | Store text: title, short description, full description, what is new |
| `data-safety.md` | Answers for the Play Data safety form, content rating and Families notes |
| `twa-manifest.json` | Settings for Bubblewrap (the Android wrapper) |
| `assetlinks.template.json` | The file that proves the website and the Android app belong together |
| `tools/` | Scripts that made the icons, graphics and screenshots (re-run them any time) |
| `../privacy.html` | The privacy policy page . URL: https://morcosfady.github.io/heavenly-visions/privacy.html |

## Read this first: four things to decide before publishing

1. **Children's email (COPPA, US law).** Today every profile needs an email, including students. In the US, collecting a child's email under age 13 needs a parent's consent. Pick one before the public launch:
   - ask for a **parent's email** for students and say so on the signup screen, or
   - make student email optional, or
   - add a short "ask a parent" screen. I can build any of these. Until you decide, I suggest launching only to your own churches (closed testing), not the public store.
2. **The website root and `assetlinks.json`.** Android only opens the app full screen (no browser bar) if this file is at `https://YOUR-SITE/.well-known/assetlinks.json` at the **root** of the website. Your app lives at `morcosfady.github.io/heavenly-visions/`, a sub folder, so the root belongs to a different repository named `morcosfady.github.io`. Two fixes: (a) create a repository named exactly `morcosfady.github.io`, add `.well-known/assetlinks.json` and an empty `.nojekyll` file, or (b) buy a short domain (you looked at this before) and point the app to it, which also makes the app link look professional. Without this file the app still works, but shows a thin browser bar on top.
3. **Apple.** Apple needs a $99 per year developer account and a Mac (or a cloud Mac service). Apple also rejects apps that are "only a website". I suggest doing Android first, then deciding about iPhone. Section "iPhone" below has details.
4. **Account deletion.** Both stores require it. It is built: Profile, then **Delete my account** (asks for the password). The Apps Script backend with this feature must be deployed (Version 17 or newer).

## Android (Google Play): step by step

Costs: one time $25 Google Play developer fee. The app and the tools are free.

### A. Get the Android app file (two ways, pick one)

**Way 1, easiest: PWABuilder (no coding)**
1. Open https://www.pwabuilder.com and enter `https://morcosfady.github.io/heavenly-visions/`.
2. It reads `manifest.json` and shows a score. Press **Package for stores**, then **Android**.
3. Use these answers: Package ID `app.heavenlyvisions.twa` (this can never change, think before you choose), App name `Heavenly Visions`, version `1.0.0` (code `1`), Display `Standalone`, Start URL `/heavenly-visions/`, **Notifications off**, **Location off**, "Signing key: create new". Download the zip.
4. The zip has `app-release-bundle.aab` (upload this to Google Play), `signing.keystore` and `signing-key-info.txt`. **Keep the keystore and the passwords in two safe places.** If you lose them you cannot update the app.

**Way 2: Bubblewrap on your PC**
1. Install Node.js, then `npm i -g @bubblewrap/cli`.
2. In an empty folder: `bubblewrap init --manifest=https://morcosfady.github.io/heavenly-visions/manifest.json` (or copy `twa-manifest.json` from here), then `bubblewrap build`.
3. Bubblewrap asks to install the Android SDK and Java. Say yes.

### B. Link the website and the app (the assetlinks file)
1. Get the SHA-256 fingerprint of the signing key. With Google Play App Signing (recommended, on by default) use the fingerprint that Play Console shows under **Release, Setup, App signing**. For local tests use `keytool -list -v -keystore signing.keystore`.
2. Copy `assetlinks.template.json`, replace the fingerprint, and publish it at `https://YOUR-SITE/.well-known/assetlinks.json` (see decision 2).
3. Check it at https://developers.google.com/digital-asset-links/tools/generator

### C. Play Console
1. Create the developer account at https://play.google.com/console (identity check, $25).
2. **Create app**: name `Heavenly Visions`, default language English, App, Free.
3. **Main store listing**: paste text from `listing-en.md` and `listing-ar.md`. Upload `icons/android/play-store-icon-512.png`, `graphics/feature-graphic-*.png`, and the screenshots. Phone: at least 2, up to 8. Tablets: upload the 7 and 10 inch sets.
4. **App content** (all required):
   - Privacy policy URL: `https://morcosfady.github.io/heavenly-visions/privacy.html`
   - Ads: **No ads**
   - App access: select "Some features need login" and give a **test servant account** and a **test student account** (create two real accounts with throw away passwords) so the reviewer can sign in.
   - Content rating: fill the IARC questionnaire with the answers in `data-safety.md`. Expected rating: **Everyone**.
   - Target audience: choose age groups 5 to 8 and 9 to 12 (and 13+ because teens and servants use it). This makes the app part of **Designed for Families**, which needs: no ads, no tracking, a privacy policy, the Data safety form, and nothing that asks for permissions the app does not need (it asks for none).
   - Data safety: use `data-safety.md`.
   - Government apps, financial features, health: No.
5. **Release**: new personal developer accounts must first run a **closed test with at least 12 testers for 14 days** before Google allows production (Google's rule at the time of writing, check the current rule). Plan: Internal testing (you), then Closed testing (12 servants and parents, ask them to install and open it), then apply for production.
6. Upload `app-release-bundle.aab` to the chosen track, add release notes from `listing-en.md`, send for review (a few days).

### D. After publishing
- To release an update: bump `appVersion` in `twa-manifest.json` (or in PWABuilder), build, upload. Website changes need **no** new release, because the app opens the website.
- Update the privacy policy page if you change what data is stored.

## iPhone (App Store): what you need to know

1. **Account:** Apple Developer Program, $99 per year, with an identity check (a company needs a D-U-N-S number, an individual does not).
2. **A Mac is required to build and upload.** Options: borrow a Mac, or use a cloud Mac (MacinCloud, about $1 per hour) or a build service (Codemagic) that builds from the Xcode project.
3. **How:** in PWABuilder choose **iOS**. It gives an Xcode project that wraps the website. Open it, set your Team and Bundle ID (`app.heavenlyvisions`), add icons from `icons/ios/`, archive, upload with Xcode, then fill in App Store Connect with the same texts and screenshots (iPhone 6.7 inch needs 1290x2796: re-run `tools/shots.ps1` with `--window-size=430,932 --force-device-scale-factor=3`).
4. **What Apple may reject, and what we did:**
   - Guideline 4.2, "minimum functionality, just a website": the app has native feeling features (offline, notifications bell, avatar, coloring, games). Explain that in the review notes. Adding real push notifications later also helps.
   - Kids Category (5.1.4): no ads and no tracking (done), a **parental gate** before external links such as YouTube and the privacy page (not built yet, I can add a simple "type the answer to 7 plus 5" gate), and no personal data sent to third parties.
   - Account deletion inside the app (done) and a privacy policy link (done).
   - Provide a demo account in the review notes.
5. Without a Mac you can still offer iPhone users the **installed web app** (Safari, Share, Add to Home Screen). It already works.

## Re-making the images

From the repo root, with the test servers running (`python -m http.server 8001` and `node tests/att-server.js`):

```
python store/tools/make-icons.py
powershell -File store/tools/shots.ps1
```

Feature graphics are made from `tools/feature.html`.

## Sources and licenses

Pictures, icons and coloring pages are original. Bible text: KJV and WEB (public domain, bible-api.com). Fonts: Cinzel, Nunito (Open Font License, Google Fonts). Videos are from the Heavenly Visions YouTube channel.
