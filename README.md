# QR Code Scanner Experiment

An experimental Progressive Web App (PWA) to evaluate browser‑based QR code scanning performance (speed + accuracy) with no native install required. Uses the device camera, decodes QR codes, displays a rolling list, and collects lightweight metrics.

## Stack Decision Rationale
| Aspect | Choice | Notes |
| ------ | ------ | ----- |
| Framework | React + Vite (TypeScript) | Fast dev cycle, minimal boilerplate vs Angular, easier experimental tweaking. |
| QR Library | `qr-scanner` (WASM ZXing) | Wraps performant WebAssembly build of ZXing; good balance of speed & accuracy; supports camera listing & region highlighting. |
| Server | (Removed) | Now fully static; can optionally add remote API later if needed. |
| Packaging | PWA (manifest + SW) | Offline shell + potential install prompt without native store. |

### Alternative Libraries Considered
- `@zxing/browser` – Also solid; slightly more verbose integration, `qr-scanner` offers simpler start/stop & built‑in region highlight.
- `jsQR` – Pure JS, easy, but typically slower and lacks multi-camera convenience helpers.
- `html5-qrcode` – Feature rich UI helpers, but heavier; for bare‑bones perf test, leaner control was preferred.

## Core Requirements Mapping
- Camera access → MediaDevices.getUserMedia via `qr-scanner`.
- Open source / free decoder → ZXing WASM (`qr-scanner`).
- Speed evaluation → Timestamps per decode; average duration could be aggregated client side (currently only last decode shown).
- Accuracy emphasis → (Future) add optional checksum / numeric pattern validation & duplicate rate tracking.

## Project Structure
```
package.json              (root scripts)
client/                   (React + Vite PWA)
	index.html
	vite.config.js
	tsconfig.json
	public/
		manifest.webmanifest
		sw.js
	src/
		main.tsx
		scanner/
			App.tsx
			Scanner.tsx
			StatsPanel.tsx
			QrGallery.tsx
```

## Running the Experiment (Windows PowerShell)
1. Install dependencies (workspaces):
	 ```powershell
	 npm install
	 ```
2. Start dev server:
	 ```powershell
	 npm run dev
	 ```
	 - Client: http://localhost:5173
3. Open the client URL in a modern browser (Chrome, Edge, Firefox). Grant camera permission.
4. Point at QR codes. View:
	 - Recent decoded list (top = newest)
	 - Local stats: total / unique, last decode time (ms)

## (Former) Backend
Originally an Express server provided in-memory aggregation endpoints. This has been removed to keep the project purely static for GitHub Pages hosting. If you want to restore or add a backend, reintroduce endpoints for batch uploads and stats, then point the client at that base URL.

## Additional Page: /qrs
Navigate to `/qrs` to view a gallery of all QR (and other) images placed inside `client/src/assets` (png/jpg/jpeg/svg). The page auto-imports files using Vite's `import.meta.glob` pattern at build time. Useful for referencing known codes during manual accuracy checks.
On GitHub Pages the link is generated with `import.meta.env.BASE_URL` so the real URL becomes `/<repoName>/qrs`.

### Routing Approach (HashRouter)
The app now uses `react-router-dom`'s `HashRouter` to avoid 404 issues on GitHub Pages (which serves only static files and does not rewrite unknown paths to `index.html`).

Benefits:
- Reliable deep links: `/#/qrs` always loads without extra 404 tricks.
- Simplifies navigation vs. manual pathname parsing.
- Allows easy expansion for future routes.

Trade-off:
- URLs include a `#` fragment. For pure path-style URLs you would need a custom redirect strategy or a different hosting setup.

## Performance & Accuracy Notes (Current)
- Decode timing is naive (difference from processing start if available, else immediate). For stricter benchmarking, instrument raw frame timestamps.
- UI local list now deduplicates; only first occurrence of a code is kept client‑side.
- Local buffer size limit: 500 codes (adjust in `App.tsx`).
- Average duration excludes scans with missing duration metadata.
- No debounce; `maxScansPerSecond` set to 10 (tunable in `Scanner.tsx`).
- Clear button: removes all locally stored unique codes (no upload—static build has no backend).
- Flash toggle: If the active camera exposes torch capability, a Flash On/Off button appears (uses `QrScanner.hasFlash()` + `toggleFlash()`). Some desktop webcams and unsupported mobile browsers will simply hide the control.

## Planned / Possible Improvements
- Toggle to allow duplicates with per-code scan count.
- Add checksum / expected pattern validation to flag anomalies.
- Batch send scan events instead of per-scan POST for reduced overhead.
- Include worker-based decoding timing vs main thread (compare libs).
- Add instrumentation panel: FPS, frames attempted, success rate.
- Persist stats (SQLite / Postgres) & multi-session comparison dashboard.
- Add E2E accuracy test harness with synthetic QR frame set.
- Offline queue of scans when API unreachable.

## Limitations / Caveats
- No persistence; refreshing clears local state.
- Not hardened for production (no auth, rate limiting, or deep input validation).
- Accuracy evaluation needs labeled ground-truth dataset—currently manual.

## Deployment (GitHub Pages)
This project is configured to deploy the client (static PWA) to GitHub Pages using the workflow in `.github/workflows/deploy.yml`.

Steps:
1. Ensure repository name in `client/vite.config.js` (variable `repoName`) matches the GitHub repo.
2. Push changes to `main` (workflow triggers automatically) or run manually via Actions tab.
3. Pages URL will appear in the workflow summary (format: `https://<user>.github.io/<repoName>/`).
4. Service worker + relative asset paths are adjusted for subdirectory base.

Notes:
- Fully static: no API calls are made.
- A `404.html` is still present but `HashRouter` makes it largely unnecessary.
- If you later host an API elsewhere, add fetch logic back in `App.tsx` (e.g., for batch uploads). Document the base URL and consider environment variables.

Local production preview:
```powershell
npm --prefix client run build
npx serve client/dist
```
Then visit the served path ensuring the base subdirectory is honored.

## License & Usage
Experimental; integrate at your own risk. ZXing / qr-scanner licensing applies (Apache 2.0).

---
Feel free to open an issue or extend the experiment with additional metrics collectors or alternative decoders.
