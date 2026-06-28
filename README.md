# Ice Storm 🧊

A featherweight Firefox extension that makes a dancer glide out from the edge of
your browser window, bust a move, and slide off-screen — calm and cool, like ice.

- **Click the toolbar icon** → a popup with one button: **Summon now** unleashes
  an **Ice Storm** (a whole crew floods the page and dances). While they're on
  screen the button flips to **Dismiss now** to clear them instantly.
- **Random cameos** dropdown → a single dancer quietly cameos at a frequency you
  pick: Off, Frequent (5–10 min), Often (10–30 min, default), Occasionally
  (30 min–3 hr), or Rarely (3 hr–2 days).

The dancer is a pixel-art clip with the background already removed (transparent
WebP), bundled locally — no network calls, works offline. The extension is idle
until you summon him, so CPU stays near zero between dances.

## Install

Firefox and Firefox-based browsers (like Zen) only permanently install
**signed** extensions, and this one isn't submitted to Mozilla — so the simplest
way to run it is as a temporary add-on:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select the `manifest.json` in this folder (or the `.xpi` from
   [Releases](../../releases)).
4. The 🧊 icon appears in the toolbar. Click it on any normal web page → **Summon
   now**.

> Temporary add-ons are removed when the browser restarts — just re-load it.
> For a permanent install you'd need to sign the add-on (see below).

## Use it

- Open any regular website (it won't run on `about:` pages, the add-ons page, or
  the PDF viewer — the browser blocks content scripts there).
- Click the icon → **Summon now** → Ice Storm. While they dance the button reads
  **Dismiss now** → clears them instantly.
- Pick a **Random cameos** frequency (or **Off**). The choice persists and
  re-arms the timer immediately.

> Note: a long pending timer (e.g. "Rarely") resets when the browser restarts, so
> very long intervals may not fire if you restart often — by design, kept simple.

## Permanent install / signing

Standard Firefox & Zen refuse unsigned `.xpi` files via "Install Add-on From
File." To install permanently you have two routes:

- **Disable signature enforcement** — in `about:config` set
  `xpinstall.signatures.required` to `false`. Only takes effect on Firefox
  Developer/Nightly/ESR/Unbranded builds; some forks honor it, release builds do
  not.
- **Sign via Mozilla** — submit to [addons.mozilla.org](https://addons.mozilla.org/developers/)
  (a free account; "unlisted" gives you a signed `.xpi` to self-distribute). Note
  that AMO review expects you to have rights to all bundled assets.

## Build the XPI

An `.xpi` is just a zip of these files with `manifest.json` at the root:

```powershell
# from the repo root, in PowerShell
$src = $PWD.Path
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($src, "$env:TEMP\ice-storm.xpi", 'Optimal', $false)
Move-Item "$env:TEMP\ice-storm.xpi" .\ice-storm.xpi -Force
```

Or with [`web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/):

```sh
npm install --global web-ext
web-ext run     # launches Firefox with the extension loaded
web-ext build   # produces a zip in web-ext-artifacts/
```

## Files

| File | Role |
|------|------|
| `manifest.json` | Extension manifest (MV3, Firefox 115+) |
| `background.js` | Random-cameo scheduling (tiered frequency) |
| `popup.html` / `popup.js` | Toolbar popup: Summon / Dismiss + cameo frequency |
| `content.js` | Drops the dancer in + runs the glide → dance → glide-off |
| `content.css` | Icy styling and the speech bubble |
| `icons/ice.svg` | Toolbar icon |
| `assets/ice-dancer.webp` | The dancing clip, background removed |

## Make him your own

Drop a different animated WebP/GIF/PNG into `assets/`, update the filename in
`web_accessible_resources` (manifest) and in `ASSET_URL` at the top of
`content.js`. A pre-cut transparent asset looks best — that's what makes him
float over the page instead of sitting in a box.

## License & assets

Source code is released under the [MIT License](LICENSE).

The bundled animation (`assets/ice-dancer.webp`) is a third-party pixel-art clip
included for convenience and is **not** covered by the MIT license. If you plan
to redistribute widely or submit to AMO, replace it with an asset you own or that
is openly licensed.
