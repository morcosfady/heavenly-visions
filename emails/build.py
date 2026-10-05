"""Builds the role specific welcome emails.
Run: python build.py
Makes welcome-<role>.html (with {{name}} and {{church}} left in) and previews.html (sample values, all roles stacked)."""
import html
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

APP = "https://morcosfady.github.io/heavenly-visions/"

ROLES = {
    "student": {
        "label": "Student", "icon": "&#127890;",
        "hello": "We are so happy you joined the Heavenly Visions family at",
        "title": "What is waiting for you",
        "items": [
            ("&#127916;", "Media", "Lesson videos for every grade"),
            ("&#127918;", "Games", "Play, match and learn with your class"),
            ("&#127942;", "Quizzes", "Test what you know and collect stars"),
            ("&#128214;", "The Bible", "Read God&rsquo;s Word anywhere"),
        ],
        "banner": ("&#11088;", "Collect points and level up",
                   "Check in at class (+10), finish games (+10) and win live challenges (+50).<br>Grow from <b>Seedling</b> to <b>Champion</b> &#128081;"),
        "note": None,
        "button": "Open Heavenly Visions",
        "link": "#profile",
    },
    "servant": {
        "label": "Servant", "icon": "&#128591;",
        "hello": "Thank you for serving with us at",
        "title": "Your tools as a servant",
        "items": [
            ("&#128736;&#65039;", "Servants Workshop", "Build Kahoot quizzes, Jeopardy, word searches and more in minutes"),
            ("&#9995;", "Attendance", "See who checked in to your class today"),
            ("&#127916;", "Lessons", "Every lesson video, ready to share with parents"),
            ("&#128214;", "The Bible", "Read God&rsquo;s Word anywhere"),
        ],
        "banner": ("&#11088;", "You earn points too",
                   "Check in at class (+5) and publish a game for the kids (+20).<br>Every game you share helps a child learn &#127775;"),
        "note": "Your request to serve is waiting for approval from a coordinator or priest. We will let you know as soon as it is approved. Until then you can enjoy the app as a guest.",
        "button": "Open my profile",
        "link": "#profile",
    },
    "coordinator": {
        "label": "Coordinator", "icon": "&#129517;",
        "hello": "Thank you for leading your grade at",
        "title": "Your tools as a coordinator",
        "items": [
            ("&#128273;", "Manage access", "Welcome and approve the servants in your grade"),
            ("&#128736;&#65039;", "Servants Workshop", "Build games and quizzes for your class"),
            ("&#9995;", "Attendance", "See who checked in today"),
            ("&#127916;", "Lessons", "Every lesson video in one place"),
        ],
        "banner": ("&#11088;", "You earn points too",
                   "Check in at class (+5) and publish a game for the kids (+20)."),
        "note": "Your request to serve as a coordinator is waiting for approval from a priest. We will let you know as soon as it is approved. Until then you can enjoy the app as a guest.",
        "button": "Open my profile",
        "link": "#profile",
    },
    "priest": {
        "label": "Priest", "icon": "&#9962;",
        "hello": "Welcome, and thank you for your blessing on our app at",
        "title": "What you can do",
        "items": [
            ("&#128273;", "Manage access", "Approve coordinators and servants, and assign their grades"),
            ("&#128101;", "Your team", "See everyone who serves, with their contact details"),
            ("&#127916;", "Lessons", "Every lesson video in one place"),
            ("&#128214;", "The Bible", "Read God&rsquo;s Word anywhere"),
        ],
        "banner": None,
        "note": "Your request is waiting for approval. We will let you know as soon as it is approved. Until then you can view the app as a guest.",
        "button": "Open my profile",
        "link": "#profile",
    },
    "master": {
        "label": "Master", "icon": "&#128081;",
        "hello": "Your Master profile is ready for",
        "title": "Everything you control",
        "items": [
            ("&#128273;", "Manage access", "Approve priests, coordinators and servants, and assign grades"),
            ("&#128736;&#65039;", "Servants Workshop", "Build and publish games and quizzes"),
            ("&#127942;", "Leaderboard", "See how the whole community is growing"),
            ("&#9962;", "Churches", "Every Coptic Orthodox church in Dallas Fort Worth"),
        ],
        "banner": None,
        "note": None,
        "button": "Open my profile",
        "link": "#profile",
    },
}


def build(role, name, church):
    r = ROLES[role]
    rows = "".join(
        f'<tr><td width="44" style="padding:8px 0;font-size:26px;" valign="top">{ic}</td>'
        f'<td style="padding:8px 0;"><b>{t}</b><br><span style="color:#b9b6c6;">{d}</span></td></tr>'
        for ic, t, d in r["items"]
    )
    banner = ""
    if r["banner"]:
        ic, t, d = r["banner"]
        banner = f"""
  <tr><td style="padding:16px 28px 4px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f6d27a,#e3b45c);border-radius:18px;">
      <tr><td align="center" style="padding:20px 18px;color:#2b1d05;">
        <div style="font-size:30px;">{ic}</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;margin:4px 0;">{t}</div>
        <div style="font-size:14px;line-height:1.6;">{d}</div>
      </td></tr>
    </table>
  </td></tr>"""
    note = ""
    if r["note"]:
        note = f"""
  <tr><td style="padding:18px 28px 4px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#252f55;border-radius:16px;">
      <tr><td style="padding:16px 18px;font-size:14px;line-height:1.6;color:#e8e2d6;">
        &#9203; <b style="color:#f6d27a;">Waiting for approval</b><br>{r["note"]} &#128591;
      </td></tr>
    </table>
  </td></tr>"""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to Heavenly Visions</title>
</head>
<body style="margin:0;padding:0;background:#141a2b;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your profile is ready. Learn, play and grow in faith with Heavenly Visions.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#141a2b;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border-radius:24px;overflow:hidden;background:#1d2540;font-family:'Trebuchet MS',Arial,sans-serif;color:#f3ecdf;">

  <tr><td align="center" style="padding:36px 24px 20px;background:linear-gradient(160deg,#1d3a6b,#141a2b);">
    <img src="{APP}logo.png" width="230" alt="Heavenly Visions" style="display:block;width:230px;max-width:70%;height:auto;border:0;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:4px;color:#e3b45c;margin-top:16px;">LEARN &nbsp;&middot;&nbsp; PLAY &nbsp;&middot;&nbsp; GROW IN FAITH</div>
  </td></tr>

  <tr><td align="center" style="padding:28px 28px 8px;">
    <div style="font-size:42px;line-height:1;">&#10013;&#65039;</div>
    <h1 style="margin:12px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#f6d27a;">Welcome, {name}!</h1>
    <div style="display:inline-block;margin:6px 0 10px;padding:4px 14px;border-radius:999px;background:#252f55;color:#e3b45c;font-size:13px;font-weight:bold;">{r["icon"]} {r["label"]}</div>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#d9d3c7;">{r["hello"]}<br><b style="color:#f3ecdf;">{church}</b> &#128591;</p>
  </td></tr>

  <tr><td style="padding:20px 28px 4px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#252f55;border-radius:16px;border-left:5px solid #e3b45c;">
      <tr><td style="padding:16px 18px;font-size:15px;line-height:1.6;color:#f3ecdf;">
        &ldquo;Let the little children come to Me.&rdquo;<br>
        <span style="color:#e3b45c;font-weight:bold;">Matthew 19:14</span>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:24px 28px 4px;">
    <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#f6d27a;">{r["title"]}</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.5;color:#e8e2d6;">{rows}</table>
  </td></tr>
{banner}{note}
  <tr><td align="center" style="padding:28px 28px 8px;">
    <a href="{APP}{r["link"]}" style="display:inline-block;padding:16px 38px;border-radius:999px;background:#e3b45c;color:#2b1d05;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:bold;text-decoration:none;letter-spacing:1px;">{r["button"]} &#8594;</a>
  </td></tr>
  <tr><td align="center" style="padding:26px 28px 30px;font-size:12px;line-height:1.7;color:#8f8da3;border-top:1px solid #2c3657;">
    Glory be to God forever. Amen. &#10013;&#65039;<br>
    You received this email because you created a profile on Heavenly Visions.<br>
    <a href="https://www.youtube.com/@Heavenly-Visions1" style="color:#e3b45c;text-decoration:none;">Watch us on YouTube</a>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
"""


for role in ROLES:
    with open(f"welcome-{role}.html", "w", encoding="utf8") as f:
        f.write(build(role, "{{name}}", "{{church}}"))

samples = {
    "student": "Mina Samir",
    "servant": "Mariam Girgis",
    "coordinator": "Kirollos Naguib",
    "priest": "Fr. Boulos",
    "master": "Fady",
}
church = "St. Philopateer Coptic Orthodox Church, Richardson"
frames = "".join(
    f'<h2 style="font-family:Arial;color:#fff;margin:28px 0 8px">{ROLES[r]["icon"]} {ROLES[r]["label"]}</h2>'
    f'<iframe style="width:100%;max-width:640px;height:1500px;border:0;border-radius:12px;background:#141a2b" srcdoc="{html.escape(build(r, samples[r], church), quote=True)}"></iframe>'
    for r in ROLES
)
with open("previews.html", "w", encoding="utf8") as f:
    f.write(f'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome email previews</title><body style="background:#0b0f1c;padding:16px;margin:0;text-align:center">{frames}</body>')
print("built", list(ROLES))
