"""Builds the "access granted" emails (sent when a Master, Abouna or coordinator gives someone a role).
Run: python build_granted.py
Makes granted-<role>.html (with {{name}}, {{church}}, {{grade}}, {{by}} left in) and granted-previews.html (sample values)."""
import html
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

APP = "https://heavenlyvisions.app/"

ROLES = {
    "servant": {
        "label": "Servant", "icon": "&#128591;", "hasgrade": True,
        "lead": "has welcomed you to serve in",
        "verse": ("&ldquo;Whatever you do, do it heartily, as to the Lord.&rdquo;", "Colossians 3:23"),
        "title": "What you can do now",
        "items": [
            ("&#128736;&#65039;", "Servants Workshop", "Plan each Sunday, build games and quizzes, and share worksheets"),
            ("&#9995;", "Attendance", "Open the check-in code and see who is in your class"),
            ("&#128226;", "Announcements", "Send news to the families of your grade"),
            ("&#128101;", "Church team", "See who serves with you in the Permissions tree"),
        ],
        "steps": ["Open the app and log in", "Tap <b>Servants Workshop</b> on Home", "Say hello to your coordinator"],
    },
    "coordinator": {
        "label": "Coordinator", "icon": "&#129517;", "hasgrade": True,
        "lead": "has trusted you to lead a grade at",
        "verse": ("&ldquo;Feed My lambs.&rdquo;", "John 21:15"),
        "title": "What you can do now",
        "items": [
            ("&#128273;", "Give access", "Welcome servants to your grade, or invite them by email"),
            ("&#128202;", "Attendance sheet", "Percentages, trends and who needs a follow up"),
            ("&#128736;&#65039;", "Lesson Planner", "Plan every Sunday for your grade"),
            ("&#128226;", "Announcements", "Post to your grade, or to the whole church"),
        ],
        "steps": ["Open the app and log in", "Tap <b>Permissions</b> to meet your team", "Set today&rsquo;s check-in code on Sundays"],
    },
    "priest": {
        "label": "Abouna", "icon": "&#9962;", "hasgrade": False,
        "lead": "has given you Abouna access for",
        "verse": ("&ldquo;Shepherd the flock of God which is among you.&rdquo;", "1 Peter 5:2"),
        "title": "What you can do now",
        "items": [
            ("&#128273;", "Permissions", "Accept requests, give access and see the church team tree"),
            ("&#128202;", "Whole church attendance", "Every grade, every Sunday, in one place"),
            ("&#128222;", "Follow up and reports", "Children who missed three Sundays, and a monthly report"),
            ("&#128226;", "Announcements", "Post to any grade of your church"),
        ],
        "steps": ["Open the app and log in", "Tap <b>Permissions</b> on Home", "Welcome your coordinators and servants"],
    },
}


def build(role, name, church, grade, by):
    r = ROLES[role]
    rows = "".join(
        f'<tr><td width="48" style="padding:9px 0;font-size:26px;" valign="top">{ic}</td>'
        f'<td style="padding:9px 0;"><b>{t}</b><br><span style="color:#b9b6c6;">{d}</span></td></tr>'
        for ic, t, d in r["items"]
    )
    steps = "".join(
        f'<tr><td width="44" valign="top" style="padding:7px 0;"><div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:50%;background:#e3b45c;color:#2b1d05;font-weight:bold;font-family:Georgia,serif;">{i}</div></td>'
        f'<td style="padding:9px 0;font-size:15px;color:#f3ecdf;">{s}</td></tr>'
        for i, s in enumerate(r["steps"], 1)
    )
    gradecell = (
        f'<td style="padding:12px 14px;border-left:1px solid #3a4670;white-space:nowrap;"><div style="font-size:11px;letter-spacing:2px;color:#8f8da3;">GRADE</div><div style="font-size:16px;font-weight:bold;color:#f6d27a;margin-top:2px;">{grade}</div></td>'
        if r["hasgrade"] else ""
    )
    v, ref = r["verse"]
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your access is ready</title>
</head>
<body style="margin:0;padding:0;background:#141a2b;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{by} gave you {r["label"]} access in Heavenly Visions. Tap to open the app.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#141a2b;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border-radius:24px;overflow:hidden;background:#1d2540;font-family:'Trebuchet MS',Arial,sans-serif;color:#f3ecdf;">

  <tr><td align="center" style="padding:36px 24px 22px;background:linear-gradient(160deg,#1d3a6b,#141a2b);">
    <img src="{APP}logo.png" width="210" alt="Heavenly Visions" style="display:block;width:210px;max-width:70%;height:auto;border:0;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:4px;color:#e3b45c;margin-top:16px;">LEARN &nbsp;&middot;&nbsp; PLAY &nbsp;&middot;&nbsp; GROW IN FAITH</div>
  </td></tr>

  <tr><td align="center" style="padding:30px 28px 6px;">
    <div style="font-size:46px;line-height:1;">&#127881;</div>
    <h1 style="margin:14px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:31px;line-height:1.2;color:#f6d27a;">Your access is ready, {name}!</h1>
    <div style="display:inline-block;margin:4px 0 12px;padding:5px 16px;border-radius:999px;background:#252f55;color:#e3b45c;font-size:14px;font-weight:bold;">{r["icon"]} {r["label"]}</div>
    <p style="margin:0;font-size:16px;line-height:1.7;color:#d9d3c7;"><b style="color:#f3ecdf;">{by}</b> {r["lead"]}<br><b style="color:#f3ecdf;">{church}</b>. Thank you for giving your time to our children and families &#128591;</p>
  </td></tr>

  <tr><td style="padding:22px 28px 4px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#252f55;border-radius:16px;border:1px solid #3a4670;">
      <tr>
        <td style="padding:12px 14px;white-space:nowrap;"><div style="font-size:11px;letter-spacing:2px;color:#8f8da3;">YOUR ROLE</div><div style="font-size:16px;font-weight:bold;color:#f6d27a;margin-top:2px;">{r["label"]}</div></td>
        {gradecell}
        <td style="padding:12px 14px;border-left:1px solid #3a4670;"><div style="font-size:11px;letter-spacing:2px;color:#8f8da3;">CHURCH</div><div style="font-size:14px;font-weight:bold;color:#f3ecdf;margin-top:3px;line-height:1.3;">{church}</div></td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:18px 28px 4px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#252f55;border-radius:16px;border-left:5px solid #e3b45c;">
      <tr><td style="padding:16px 18px;font-size:15px;line-height:1.6;color:#f3ecdf;">
        {v}<br><span style="color:#e3b45c;font-weight:bold;">{ref}</span>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:26px 28px 4px;">
    <h2 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:21px;color:#f6d27a;">{r["title"]}</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.5;color:#e8e2d6;">{rows}</table>
  </td></tr>

  <tr><td style="padding:22px 28px 4px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f6d27a,#e3b45c);border-radius:18px;">
      <tr><td style="padding:18px 20px 10px;color:#2b1d05;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:bold;">&#10024; Get started in 3 steps</td></tr>
      <tr><td style="padding:0 20px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#1d2540;border-radius:14px;padding:6px 12px;">{steps}</table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding:30px 28px 8px;">
    <a href="{APP}#perm" style="display:inline-block;padding:17px 42px;border-radius:999px;background:#e3b45c;color:#2b1d05;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;text-decoration:none;letter-spacing:1px;">Open Heavenly Visions</a>
    <div style="margin-top:14px;font-size:13px;color:#8f8da3;line-height:1.6;">Tip: add the app to your home screen<br>so it opens like any other app.</div>
  </td></tr>

  <tr><td align="center" style="padding:26px 28px 30px;font-size:12px;line-height:1.7;color:#8f8da3;border-top:1px solid #2c3657;">
    Glory be to God forever. Amen. &#10013;&#65039;<br>
    Questions? Just reply to this email and we will help.<br>
    You received this because {by} gave you access on Heavenly Visions.<br>
    <a href="https://www.youtube.com/@Heavenly-Visions1" style="color:#e3b45c;text-decoration:none;">Watch us on YouTube</a>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
"""


for role in ROLES:
    with open(f"granted-{role}.html", "w", encoding="utf8") as f:
        f.write(build(role, "{{name}}", "{{church}}", "{{grade}}", "{{by}}"))

samples = {
    "servant": ("Mariam", "Grade 3", "Abouna Mark"),
    "coordinator": ("Kirollos", "Grade 5", "Abouna Mark"),
    "priest": ("Boulos", "", "Fady Morcos"),
}
church = "St. Philopateer Coptic Orthodox Church, Richardson"
frames = "".join(
    f'<h2 style="font-family:Arial;color:#fff;margin:28px 0 8px">{ROLES[r]["icon"]} {ROLES[r]["label"]}</h2>'
    f'<iframe style="width:100%;max-width:640px;height:1700px;border:0;border-radius:12px;background:#141a2b" srcdoc="{html.escape(build(r, samples[r][0], church, samples[r][1], samples[r][2]), quote=True)}"></iframe>'
    for r in ROLES
)
with open("granted-previews.html", "w", encoding="utf8") as f:
    f.write(f'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Access granted email previews</title><body style="background:#0b0f1c;padding:16px;margin:0;text-align:center">{frames}</body>')
print("built", list(ROLES))
