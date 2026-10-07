# Clay icon prompts (for Gemini, Nano Banana)

The app already ships hand-drawn SVG clay icons (`design.js`, `clay2.js`). If you want AI-generated art instead, paste these prompts into Gemini, one icon at a time, then drop the PNGs into `design/icon-candidates/<name>/` and tell Claude to run the pipeline (background removal, trim, padding, WebP 1x/2x, manifest, alt text).

## Shared style (put this first in every prompt)
"Soft 3D clay icon, Pixar-like render, rounded friendly shapes, warm heavenly palette (gold #E3B45C, sky blue, soft violet, cream), subtle gold rim light, consistent soft light from the top left, gentle soft shadow underneath, transparent background, no text, centered, square 1024x1024, same camera angle and scale as the other icons in the set. Reverent and kind, for children aged 4 to 15. Original design, do not copy any existing emoji or brand artwork."

## Section icons
- sunday-school: a clapperboard with a big play button
- learn: an open book with warm gold light rising from the pages
- play: a game controller
- me: a friendly child bust in a blue shirt with a small gold halo ring
- bible: a closed thick book with a gold Coptic cross on the cover and a red ribbon
- daily-verse: a rolled scroll with a red wax seal and a small gold star
- calendar: a calendar page with a red top and one gold day
- coloring: an artist palette with four paint dots and a small brush
- bedtime: a crescent moon with a small star and a tiny pillow
- games: a purple controller with gold and pink buttons
- quizzes: a gold trophy with a white star
- attendance: a blue clipboard with a green check mark
- servants-workshop: an orange toolbox with a small gold cross on the latch
- news: a megaphone with gold sound waves
- lumi: a cute cloud-white lamb with a small gold halo and a tiny gold cross (see the existing Lumi)

## Calendar feasts and fasts
nativity (a gold star over a small manger), theophany (a white dove over blue water drops), wedding-at-cana (a clay water jar with a blue drop), circumcision (a small rolled scroll), presentation (a candle in front of a small temple), nativity-fast (a crescent moon over a simple bowl), great-lent (an olive branch), resurrection (an empty stone tomb with golden light), pentecost (three small flames of fire), feast-of-the-cross (a gold Coptic cross), nayrouz (a palm tree with a red date), archangel-michael (a blue shield with a white cross and small wings), st-mary (a blue star with a gentle white veil shape), annunciation (angel wings with a gold halo), transfiguration (a bright sun with long rays), ascension (a white cloud with a gold upward arrow), egypt (a palm tree and a small sand dune).

## Empty and gated scenes (Lumi the lamb, same style)
lumi-key (holding a gold key), lumi-clipboard (holding a clipboard), lumi-toolbox (carrying a toolbox), lumi-sleeping (asleep on a cloud, little Zz), lumi-empty-jar (looking into an empty glass jar), lumi-megaphone (holding a megaphone), lumi-crayons (holding crayons), lumi-waving, lumi-reading, lumi-praying, lumi-celebrating, lumi-thinking, lumi-pointing, lumi-star (holding a gold star).

## Size budget
Each final WebP under about 25 KB at 256 px. Keep masters outside the repo.
