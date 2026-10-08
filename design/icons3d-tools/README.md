# 3D clay icons (made with Gemini)

16 icons live in `icons3d/` (book, game, trophy, notes, megaphone, calendar, palette, moon, star, cross, church, dove, pray, user, toolbox, lock).
`hvIcon(name,size)` in `design.js` uses them from 40 px up (`IMG3D` list). Smaller sizes keep the drawn SVG icon.

## How to make a new one
1. In Gemini ask: "Create an image: soft 3D clay icon, Pixar-like render with rich saturated colors and a glossy finish, <the object>, rounded friendly shapes, warm heavenly palette (deep gold, sky blue, violet, cream), subtle gold rim light, soft light from the top left, centered, square, with a generous empty margin around the object. IMPORTANT: the background must be one flat, very bright, fully saturated pure magenta (#FF00FF, not pink, not pastel) everywhere, with no shadow, no glow, no light rays, no sparkles, no floor and no gradient on the background. No text. For children."
   Avoid glows: the magenta bleeds into them.
2. Screenshot the image on a white page, then `python key.py <name> <screenshot.jpg>` (needs Pillow). It cuts out the magenta, trims, and writes `<name>.webp` (256) and `<name>@2x.webp` (512) into `icons3d/`.
3. Add the name to `IMG3D` in `design.js` and to the `sw.js` file list.
