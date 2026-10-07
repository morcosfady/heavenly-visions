# Heavenly Visions: design direction (Phase 0)

Goal: premium, calm, playful and reverent. Think Duolingo (clear progress), Headspace (calm, soft light), Apple Arcade (polish), with a Coptic heavenly identity.

## 1. Mood
- 🌅 **Morning sky and warm gold light.** Soft clouds, gentle rays, one glowing halo behind the logo.
- 🪟 **Church craft.** Arches, gold rims, stained-glass colors, a candle glow. Never flashy.
- 🧸 **Soft 3D clay icons.** Rounded, friendly, lit from the top left, gold rim light.
- 🐑 **Lumi guides everything.** Poses for empty, locked, offline, reward and onboarding screens.
- 🤫 **No sound.** Feedback is visual and haptic only.
- ⚖️ Rule: if it is a choice between more effects and clearer, calmer, faster, pick clearer, calmer, faster.

## 2. Palette (tokens)
| Token | Dark | Light | Use |
|---|---|---|---|
| `--gold` | #E3B45C | #C99A3C | accents, active tab, rims |
| `--gold-soft` | #FFE29A | #FFE29A | highlights, progress tip |
| `--sky` | #7CC4EA | #4A8FD8 | links, Sunday School |
| `--violet` | #8E6BD1 | #6A47C2 | Quizzes, Lumi |
| `--cream` | #F4F1FF | #FBE7C4 | text on dark, paper |
| `--bg-top / mid / bot` | #0A0F2E / #151B3D / #2A2142 | #A9D8F2 / #E8F1F1 / #FBE7C4 | sky background |
| `--glass` | rgba(29,37,64,.62) | rgba(255,250,242,.72) | cards |
| Section accents | media #2F8FC0, att #3FAE6A, games #E8794A, quiz #8E6BD1, bible #C99A3C, cal #2EB5A6, pray #A86FD0, church #4B57C9 | same | hero headers, tiles |
- Good #2C9C5A, mid #C98A1F, low #D4604B stay as status colors.
- Text contrast: WCAG AA (4.5:1 body, 3:1 big text) in both themes, checked in Phase 6.

## 3. Typography
- **Cinzel** 600/700: big titles only (page titles, door names, hero greeting). Never for paragraphs.
- **Nunito** 500/700/800/900: everything else.
- Scale (already in `ds.css`): `--fs-s .78 to .86rem`, `--fs-m .95 to 1.05rem`, `--fs-l 1.15 to 1.4rem`, `--fs-xl 1.5 to 2.1rem`. Body minimum 16 px for little kids. Small labels never below 12 px and only for chips.
- Line height 1.45 body, 1.15 titles. Balanced wrapping on headings.

## 4. Shape, depth, glass
- **Radii:** 12 (chips, inputs), 18 (cards), 26 (door tiles, sheets), 999 (pills, avatars). Arch tiles: 999 top, 22 bottom.
- **Shadows:** `sh-1` 0 6 14 -8 (resting), `sh-2` 0 12 30 -14 (cards), `sh-3` 0 20 44 -18 (sheets, floating). Always tinted to the background, never pure black on light.
- **Glass levels:** L1 card (blur 14), L2 sticky bars (blur 18, 85 percent), L3 sheets (blur 24). A 1 px light border on every glass surface.
- **Spacing scale:** 6, 10, 16, 24, 40.
- **Touch targets:** 44 px minimum.

## 5. Illustration and icon style
- **3D icons** (doors, tiles, headers, avatars, badges, empty states): soft clay, rounded shapes, warm heavenly palette, gold rim light, light from the top left, soft shadow, transparent background, no text, same camera angle and scale for the whole set.
- **Line icons** (small buttons, tabs): one rounded 1.8 px stroke set (Lucide or Phosphor base) plus custom Christian symbols (Coptic cross, dome, censer, candle, Bible, dove, chalice, lamb). One set only.
- **Characters:** Lumi in 8 poses. Saints and Jesus: original reverent designs inspired by Coptic iconography (gold halo, simple faces). Nothing comic.
- **Never** copy Apple, Google, Microsoft or WhatsApp emoji art.

## 6. Motion principles
- 🎯 Motion explains, it never decorates. Animate transform and opacity only.
- ⏱️ Durations: press 120 ms, enter 260 ms, page 320 ms, celebrate 700 ms. Easing: standard cubic-bezier(.2,.8,.2,1); springs for pop and snap.
- 🔁 Entrances play once per view, not on every scroll.
- 🌙 Ambient motion (floating icons, halo) is slow (4 to 9 s) and pauses when the tab is hidden.
- ♿ `prefers-reduced-motion`: no parallax, no floats, simple fades only.
- 📳 10 ms haptic on key taps where supported.

## 7. Navigation model
- 📱 Phone: bottom tab bar with 5 tabs (Home, Learn, Play, Lumi, Me), sliding gold indicator. Hidden in video, quiz, game and coloring.
- 🖥️ Tablet and desktop: left side rail, bento layouts, max widths.
- 🔙 Inside a page: icon back button plus a sticky glass top bar with the title.
- 🐑 Ask Lumi lives in the tab bar, so the floating button goes away.

## 8. Three Home directions (pick one)
Mockups: `design/mockups/home-a.html`, `home-b.html`, `home-c.html` (screenshots in `qa-shots/p0-direction-*.jpg`). The icons in them are quick stand-ins. The real set is Phase 1.

| | A: Sky Garden | B: Stained Glass | C: The Journey |
|---|---|---|---|
| Idea | Calm glass bento, big floating 3D icons | Arched church-window tiles with gold rims | A winding gold path, Lumi guides you door to door |
| Feel | Clean, modern, most like Headspace | Most Coptic and reverent | Most playful, most like Duolingo |
| Strength | Fast to scan, scales to desktop easily | Strong identity, unique | Great story and progress feeling |
| Risk | Safest, least unique | Pattern can feel busy | Needs more height, harder on desktop |
| Recommended for | the whole app base | Sunday School and prayers section headers | the Learn tab (a lesson path) |

**My recommendation:** A for Home, with the arch shape from B reused for the section hero headers and class tiles. Keep the path idea from C for a later "learning path" inside Learn.
