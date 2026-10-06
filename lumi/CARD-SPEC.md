# Lumi knowledge cards: format and writing rules

Lumi is a helper for Coptic Orthodox Sunday School kids. It may ONLY answer from approved cards. Every card is reviewed by a servant or Abouna before Lumi can use it, so write carefully and honestly.

## Card format (JSON object, one per card)

```json
{
  "id": "sac-baptism",
  "title": "Baptism",
  "text": "Baptism is the first sacrament...",
  "tags": ["sacrament", "baptism"],
  "kw": ["baptized", "baptised", "christening", "water", "new birth"],
  "level": "all",
  "source": "Heavenly Visions kid summary of Coptic Orthodox teaching",
  "ref": "Matthew 28:19; John 3:5",
  "links": ["quiz-baptism"],
  "verse": {"text": "...", "ref": "John 3:5"},
  "verify": false,
  "approved": false
}
```

- `id`: lowercase letters, digits and dashes, unique. Use a prefix by group: `faith-`, `sac-` (sacraments), `church-` (building and worship), `saint-`, `feast-`, `fast-`, `bible-`, `pray-`, `word-` (church words), `virtue-`, `hist-`.
- `title`: short, kid friendly ("Why do we use incense?").
- `text`: 70 to 200 words (100 to 300 only when really needed). Plain sentences a servant could read aloud to a class. Warm, simple, correct. No em dash character anywhere (use a comma, a period or a plain hyphen). No emoji inside `text`.
- `tags`: 2 to 5 lowercase tags. Allowed topic tags: saint, feast, fast, sacrament, prayer, bible, church, history, virtue, trinity, mary, jesus, liturgy, calendar, martyr, angel, prophet, icon. You may add specific tags (the saint's name, the book of the Bible).
- `kw`: 3 to 10 extra search words and spellings a kid might type (synonyms, alternate spellings, the word kids use). Example for St. Mary: "mary", "virgin mary", "theotokos", "mother of god", "madonna", "our lady".
- `level`: "little" (Pre K to Grade 2: very simple), "older" (Grade 3 and up: more detail), or "all". Write the text so it suits the level. For "all" keep it simple but complete.
- `source`: be honest about where the facts come from. Use one of these exact labels:
  - "Bible (KJV)" or "Bible (WEB)" for Bible stories (public domain). Put the passage in `ref`.
  - "Heavenly Visions kid summary of Coptic Orthodox teaching" for doctrine and church life explained in our own words.
  - "Heavenly Visions kid summary, Synaxarium style" for saint summaries written in our own words from the Coptic Synaxarium tradition.
  - "Heavenly Visions app content" for things already in this app (prayer texts in the Agpeya style that the app uses, lesson content).
  - "St-Takla.org (our own words)" when you checked the card against a page of st-takla.org (the Coptic Orthodox site the owner approved as our main source). Then also fill `url` with the exact page address.
  Never copy sentences from any book or website, even from St-Takla.org. Read the page, then write in your own words at a kid level. (St-Takla.org allows copying with a credit and a link, but our cards are short rewrites.)
- `url`: optional. The exact https://st-takla.org/... page the card was checked against. Required when source is "St-Takla.org (our own words)".
- `ref`: Bible reference(s) for Bible-based cards, or a short note such as "Synaxarium, 11 Tout" or "Agpeya, Prime". Empty string if none.
- `links`: optional app routes that help the kid learn more. Valid routes: `quiz-<id>` (see the quiz list in index.html `QUIZZES`), `l-<grade>-<lesson>` (a lesson page, for example `l-kg-2.1`, see curriculum.js), `m-saints`, `m-feasts`, `calendar`, `verse`, `bible`, `b-<Book>-<chapter>` (for example `b-Genesis-6`), `games`, `bedtime`, `coloring`. Only use routes you checked exist. Leave `[]` if unsure.
- `verse`: optional, a short KJV or WEB quote that fits the card with its reference, or null. Quote exactly. Only if you are sure of the wording.
- `verify`: set to true when the card contains something specific that a reviewer should double check (a date, a number, a name, a disputed detail, a tradition that varies). Be generous: if you are not 100 percent sure of a detail, either leave it out or set verify true. Never invent facts. It is better to say less.
- `approved`: always false.

## Writing rules

- Coptic Orthodox point of view. Use Orthodox terms correctly: Theotokos, Holy Liturgy, the Agpeya, Pascha, Resurrection, the Holy Spirit proceeds from the Father, seven sacraments, the Coptic Orthodox Church of Alexandria, St. Mark the Apostle, the Pope of Alexandria. Do not mix in teachings of other churches.
- Warm and gentle. Never scary. For martyrs and difficult events, keep it kind ("they loved Jesus so much they never stopped believing in Him") and avoid graphic details, especially for `level: "little"`.
- Do not explain disputed theology. If a topic is complicated (for example Christology debates), give the simple faith statement the Church teaches and nothing speculative.
- Do not add dates of saints or feasts unless you are sure. Coptic dates use the Coptic calendar (for example "29 Tout" for Nayrouz season, 1 Tout is the New Year). If unsure, omit the date.
- Q and A cards: you may write the title as a kid question ("Who is the Theotokos?") and the text as the answer.
- Return valid JSON only (an array of card objects) written to the file path given in your task. The file must parse with JSON.parse.
- After writing, run `node lumi/check-cards.js <your file>` (it exists) and fix every problem it reports.
