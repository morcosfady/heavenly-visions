# Takes the store screenshots with headless Chrome. TEST ONLY: needs these running first (from the repo root):
#   python -m http.server 8001        and        node tests/att-server.js
# Then:  powershell -File store/tools/shots.ps1
# Phones are shown inside a 360x640 frame because headless Chrome will not make a window narrower than 500 px.
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$tools = "http://localhost:8001/store/tools"
function Shot($file, $w, $h, $scale, $lang, $to, $framed) {
  $png = Join-Path $root ($file + ".png")
  New-Item -ItemType Directory -Force (Split-Path $png) | Out-Null
  $seed = "$tools/seed.html?u=k3_1&lang=$lang&to=" + [uri]::EscapeDataString($to)
  if ($framed) { $url = "$tools/frame.html?w=$w&h=$h&src=" + [uri]::EscapeDataString($seed); $ww = [Math]::Max(500, $w) } else { $url = $seed; $ww = $w }
  & $chrome "--headless=new" "--disable-gpu" "--hide-scrollbars" "--window-size=$ww,$h" "--force-device-scale-factor=$scale" "--virtual-time-budget=16000" "--screenshot=$png" $url 2>$null | Out-Null
  if ($framed) { python (Join-Path $PSScriptRoot "crop.py") $png $w $h $scale } else { python -c "from PIL import Image;import os;p=r'$png';Image.open(p).convert('RGB').save(p[:-4]+'.jpg','JPEG',quality=88,optimize=True);os.remove(p)" }
  Write-Output ("{0} {1}" -f $file, (Test-Path ($png.Substring(0, $png.Length - 4) + ".jpg")))
}
$phone = @(@("01-home", "#home"), @("02-my-treasures", "#kids"), @("03-daily-verse", "#verse"), @("04-coptic-calendar", "#calendar"), @("05-bedtime", "#bedtime"), @("07-coloring", "#color-ark"))
foreach ($p in $phone) { Shot "store\screenshots\phone\en-$($p[0])" 360 640 3 "en" $p[1] $true }
foreach ($p in @(@("01-home", "#home"), @("02-my-treasures", "#kids"), @("04-coptic-calendar", "#calendar"))) {
  Shot "store\screenshots\tablet\en-10in-$($p[0])" 800 1280 2 "en" $p[1] $false
  Shot "store\screenshots\tablet\en-7in-$($p[0])" 600 960 2 "en" $p[1] $false
}
