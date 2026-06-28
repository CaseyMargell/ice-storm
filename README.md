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

**Permanent install (recommended).** The release `.xpi` is signed by Mozilla, so
it installs permanently on Firefox and Firefox-based browsers like Zen — no
restart cleanup, and it auto-updates.

1. Download `ice-storm.xpi` from the [latest release](../../releases/latest).
2. In Firefox/Zen, open `about:addons`.
3. Click the gear icon ⚙ → **Install Add-on From File…** and pick the `.xpi`
   (or just drag the file onto the `about:addons` page).
4. Approve the permission prompt. The 🧊 icon appears in the toolbar — click it on
   any normal web page → **Summon now**.

> Updates are automatic: the add-on points at an update manifest on this repo, so
> new signed releases roll out to installed copies on their own.

**Temporary install (for development).** To run unsigned local changes without
reinstalling, use `about:debugging#/runtime/this-firefox` → **Load Temporary
Add-on…** → pick `manifest.json`. Removed when the browser restarts.

## Use it

- Open any regular website (it won't run on `about:` pages, the add-ons page, or
  the PDF viewer — the browser blocks content scripts there).
- Click the icon → **Summon now** → Ice Storm. While they dance the button reads
  **Dismiss now** → clears them instantly.
- Pick a **Random cameos** frequency (or **Off**). The choice persists and
  re-arms the timer immediately.

> Note: a long pending timer (e.g. "Rarely") resets when the browser restarts, so
> very long intervals may not fire if you restart often — by design, kept simple.

## Releasing a new version (maintainers)

Ice Storm is self-distributed: signed by Mozilla but hosted here, not on the AMO
store. To cut a new version:

1. Bump `version` in `manifest.json` and build the `.xpi` (see below).
2. Submit it at [addons.mozilla.org](https://addons.mozilla.org/developers/) →
   **Submit a New Version** → **"On your own"** (unlisted). Download the signed
   `.xpi` it returns.
3. Publish a GitHub release tagged `vX.Y.Z` with the signed file attached as
   `ice-storm.xpi`.
4. Add an entry to [`updates.json`](updates.json) — `version`, the release
   `update_link`, and `update_hash` (`sha256:` + `sha256sum ice-storm.xpi`).

Installed copies then auto-update via `update_url` in the manifest, which points
at `updates.json` in this repo.

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
| `icons/ice.svg` | Toolbar icon (transparent two-tone flurry) |
| `assets/ice-dancer.webp` | The dancing clip, background removed |
| `store/icon-*.png` | AMO listing icons — `icon-128.png` is the store thumbnail |

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
