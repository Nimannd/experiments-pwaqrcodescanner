# QR Code Scanner Experiment

An experimental Progressive Web App (PWA) to evaluate browser‑based QR code scanning performance (speed + accuracy) with no native install required. Uses the device camera, decodes QR codes, displays a rolling list, and collects lightweight metrics.

## Stack Decision Rationale
| Aspect | Choice | Notes |
| ------ | ------ | ----- |
| Framework | React + Vite (TypeScript) | Fast dev cycle, minimal boilerplate vs Angular, easier experimental tweaking. |
| QR Library | `qr-scanner` (WASM ZXing) | Wraps performant WebAssembly build of ZXing; good balance of speed & accuracy; supports camera listing & region highlighting. |
| Server | Node.js (Express) | Simple in‑memory aggregation of scan stats; can be replaced by real backend later. |
| Packaging | PWA (manifest + SW) | Offline shell + potential install prompt without native store. |

### Alternative Libraries Considered
- `@zxing/browser` – Also solid; slightly more verbose integration, `qr-scanner` offers simpler start/stop & built‑in region highlight.
- `jsQR` – Pure JS, easy, but typically slower and lacks multi-camera convenience helpers.
- `html5-qrcode` – Feature rich UI helpers, but heavier; for bare‑bones perf test, leaner control was preferred.

## Core Requirements Mapping
- Camera access → MediaDevices.getUserMedia via `qr-scanner`.
- Open source / free decoder → ZXing WASM (`qr-scanner`).
- Speed evaluation → Timestamps per decode; average duration aggregated server side.
- Accuracy emphasis → (Future) add optional checksum / numeric pattern validation & duplicate rate tracking.

## Project Structure
```
package.json              (workspace + root scripts)
server/                   (Express API for stats)
	index.js
	package.json
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
```

## Running the Experiment (Windows PowerShell)
1. Install dependencies (workspaces):
	 ```powershell
	 npm install
	 ```
2. Start dev servers (concurrent):
	 ```powershell
	 npm run dev
	 ```
	 - Client: http://localhost:5173
	 - Server (API): http://localhost:5174
3. Open the client URL in a modern browser (Chrome, Edge, Firefox). Grant camera permission.
4. Point at QR codes. View:
	 - Recent decoded list (top = newest)
	 - Local stats: total / unique, last decode time (ms)
	 - Server stats (aggregated across page lifetime only; in-memory, ephemeral)

## Endpoints
| Method | Path | Purpose |
| ------ | ---- | ------- |
| POST | `/api/scan-events` | Submit a scan `{ code, durationMs, ts }` |
| GET | `/api/stats` | Returns `{ total, unique, avgDurationMs }` |

Data is not persisted—server keeps a rolling window (trims after 5000, keeps last 2000).

## Performance & Accuracy Notes (Current)
- Decode timing is naive (difference from processing start if available, else immediate). For stricter benchmarking, instrument raw frame timestamps.
- UI limits recent list to 200 entries to keep DOM light.
- Average duration excludes scans with missing duration metadata.
- No debounce; `maxScansPerSecond` set to 10 (tunable in `Scanner.tsx`).

## Planned / Possible Improvements
- Deduplicate consecutive identical QR codes optionally (config toggle).
- Add checksum / expected pattern validation to flag anomalies.
- Batch send scan events instead of per-scan POST for reduced overhead.
- Include worker-based decoding timing vs main thread (compare libs).
- Add instrumentation panel: FPS, frames attempted, success rate.
- Persist stats (SQLite / Postgres) & multi-session comparison dashboard.
- Add E2E accuracy test harness with synthetic QR frame set.
- Offline queue of scans when API unreachable.

## Limitations / Caveats
- In-memory server stats vanish on restart.
- Not hardened for production (no auth, rate limiting, or input sanitization beyond presence check).
- Accuracy evaluation needs labeled ground-truth dataset—currently manual.

## License & Usage
Experimental; integrate at your own risk. ZXing / qr-scanner licensing applies (Apache 2.0).

---
Feel free to open an issue or extend the experiment with additional metrics collectors or alternative decoders.
