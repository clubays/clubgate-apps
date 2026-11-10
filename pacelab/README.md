# PaceLab 🏏⚡

> On-device cricket ball speed tracker using high-speed computer vision, 2D Kalman motion filtering, and sub-frame optical gate timing.

PaceLab turns any phone, tablet, or laptop camera into a cricket radar speed gun. Everything runs 100% on-device in the browser using Web Workers, HTML5 Canvas, and client-side IndexedDB. **Nothing is uploaded to the cloud and no network requests are made at runtime.**

---

## 1. Quick Start

### Installation & Development

```bash
# Install dependencies
npm install

# Start local dev server (port 3000)
npm run dev

# Run check:html (enforces zero CDN/external script injection in index.html)
npm run check:html

# Run unit tests and end-to-end synthetic delivery accuracy tests
npm test

# Production build (creates optimized static dist/ bundle)
npm run build
```

---

## 2. Architecture & Folder Rules

The codebase strictly decouples pure, framework-free domain logic from UI presentation:

```
src/
  main.tsx                  # Fonts (@fontsource-variable/*), CSS tokens, RouterProvider
  routes/index.tsx          # Data router with createBrowserRouter, lazy routes, loaders
  layouts/
    AppShell.tsx            # Desktop collapsible sidebar + topbar + mobile bottom tab bar
    FocusLayout.tsx         # Full-bleed zero-chrome layout for Live Radar
  pages/
    Home.tsx                # Hero radar sweep, telemetry stats, setup checklist, recent balls
    Calibrate.tsx           # 4-step stepper with frame freeze, 4x zoom Loupe gate editor
    Live.tsx                # Fullscreen HUD, huge speed counter, live chart, quick controls
    Analyze.tsx             # Video upload, slow-mo factor calculation, manual assist 2-point mode
    Sessions.tsx            # Historical spells with search, sorting, sparklines, deletion modal
    SessionDetail.tsx       # 5 aggregate tiles, speed & distribution charts, delivery drawer
    Settings.tsx            # Hardware test, ball color HSV tuning, audio/speech, backup/restore
    Guide.tsx               # Top-view pitch SVG, accuracy table, checklist, privacy statement
    NotFound.tsx            # On-brand 404 handler
    RouteError.tsx          # Friendly error element with Retry and Home navigation
  components/
    ui/                     # Button, Card, Panel, Badge, Slider, Toggle, Segmented, Modal, Tabs, etc.
    camera/                 # CameraView, OverlayCanvas, GateEditor, Loupe, PermissionGate
    charts/                 # SpeedChart, DistributionChart (Recharts)
    session/                # DeliveryRow, DeliveryDrawer, SessionCard
    brand/                  # Logo, RadarSweep, CornerBrackets, GridBackdrop
  functions/                # PURE mathematical & CV domain logic (zero DOM / zero React)
    vision/                 # diffFrames, colorMask, combineMasks, labelComponents, scoreCandidates
    tracking/               # kalman2D, trackManager
    calibration/            # homography (solve/apply/invert), gates, expectedBallSize
    speed/                  # gateCrossing, speedFromGates, speedFromFit, detectBounce, uncertainty
    delivery/               # deliveryDetector (state machine)
    export/                 # toCSV, toJSON
    simulate/               # renderSyntheticDelivery (photorealistic noisy synthetic simulator)
  workers/tracker.worker.ts # Off-thread Web Worker pipeline running image diffing & Kalman tracking
  hooks/                    # useCamera, useFrameLoop, useTracker, useHotkeys, useWakeLock, etc.
  store/                    # settingsStore, calibrationStore, liveStore (Zustand with persist)
  db/                       # idb schema + sessions.ts, deliveries.ts, calibrations.ts
  utils/                    # math, units, time, color, canvas, geometry, id, download, audio, speech
  constants/                # Pitch presets, ball color presets, speed classes, defaults
  types/                    # Shared TypeScript interfaces
  styles/                   # index.css (Tailwind CSS v4 + HUD CSS variable tokens)
```

**Rule**: All business logic in `functions/` and `utils/` is strictly framework-free and covered by Vitest unit tests. React components only bind state and handle presentation.

---

## 3. How Speed is Measured

### 3.1 Sub-Frame Gate Crossing

Two optical gate lines (**Gate A** and **Gate B**) are calibrated across the pitch with a known metric separation $D$ (e.g. $17.68\text{ m}$ for crease-to-crease or $20.12\text{ m}$ stumps-to-stumps).

1. Consecutive track points $P_A(t_A, x_A, y_A)$ and $P_B(t_B, x_B, y_B)$ spanning a gate are tested for 2D segment-segment intersection using cross-product determinants.
2. The intersection parameter $u \in [0, 1]$ determines the exact sub-frame crossing time:
   $$t_{\text{crossing}} = t_A + u \cdot (t_B - t_A)$$
3. The headline gate timing velocity is:
   $$v_{\text{gate}} = \frac{D}{|t_B - t_A|}$$

### 3.2 Robust Trajectory Fitting (Least Squares with Huber Weights)

PaceLab also projects all confirmed 2D track points along the calibrated pitch axis to compute continuous distance $s_i$ (metres) against real timestamps $t_i$.

- **Ordinary Least Squares**: Computes initial linear slope $\hat{v}_{\text{ols}}$.
- **Robust Outlier Re-weighting**: Applies Huber weighting on residuals $r_i$ based on median absolute deviation to discount spin deviation, turf scatter, or tracking noise.
- Returns metric speed $v_{\text{fit}}$, trajectory coefficient of determination $R^2$, and standard error.

### 3.3 Pitch Bounce Apex Isolation

In standard side-on pitch views, vertical displacement $y(t)$ reaches a local maximum at the pitch contact point, where vertical velocity $v_y$ reverses sign from downward ($v_y > 0$) to upward ($v_y < 0$).

- PaceLab segments the delivery into **pre-bounce** and **post-bounce** windows.
- The headline delivery speed defaults to the **pre-bounce** speed, measuring the true ball speed before friction with the turf.

### 3.4 Analytical Uncertainty Estimation

Measurement uncertainty is computed via first-order Gaussian error propagation:
$$\sigma_v \approx v \cdot \sqrt{\left(\frac{\sqrt{2} \cdot \sigma_t}{\Delta t}\right)^2 + \left(\frac{\sigma_d}{D}\right)^2}$$
Where:

- $\sigma_t = \frac{\Delta t_{\text{frame}}}{2\sqrt{3}}$ is the timing quantization variance from frame intervals.
- $\sigma_d = \frac{2\text{ px}}{\text{pixelsPerMetre}}$ is spatial calibration handle placement uncertainty.
- Deliveries are flagged **Low Confidence** if $R^2 < 0.98$, track points $< 4$, or if $|v_{\text{gate}} - v_{\text{fit}}| / \max(v_{\text{gate}}, v_{\text{fit}}) > 6\%$.

---

## 4. Camera Placement & Field Setup

1. **Side-On Geometry**: Position your tripod perpendicular to the pitch at approximately mid-pitch (between 8m and 12m away from the pitch strip).
2. **Elevation**: Mount the camera at chest/waist height (1.2m – 1.5m) to minimize perspective foreshortening.
3. **Framing**: Keep both Gate A (bowler's crease) and Gate B (popping crease/stumps) comfortably inside the frame without digital zoom.
4. **Lighting**: Bright outdoor daylight or well-lit indoor nets minimize shutter exposure motion blur.
5. **Frame Rate**: 60 FPS or 120 FPS is recommended. PaceLab's sub-frame interpolator delivers within $\pm 3\%$ accuracy at 120 FPS and $\pm 4\%$ at 60 FPS across fast bowling speeds (90 – 145 km/h).

---

## 5. Physical Limitations & Assumptions

1. **Elevation Perspective (Parallax)**: The ball travels 0.5m to 2.2m above the ground plane. Because camera projection flattens 3D space into 2D, placing the camera side-on perpendicular to the pitch ensures the along-pitch velocity vector is parallel to the camera sensor.
2. **Rolling-Shutter Distortion**: Standard CMOS smartphone sensors scan line-by-line. At 140 km/h, slight pixel skew can occur; high-speed modes (120/240 FPS) have shorter readout windows and minimize rolling-shutter effects.
3. **Frame Rate Thresholds**: Below 30 FPS, large ball displacements (over 1.3m per frame at express speeds) increase temporal quantization uncertainty.

---

## 6. S3 + CloudFront Deployment Notes

PaceLab is compiled as a static Single Page Application (`dist/`):

- **Build Output**: `npm run build` outputs pure HTML, JS, CSS, and font files into `dist/`.
- **404 Routing Rule**: Because PaceLab uses client-side routing (`react-router-dom`), configure your CloudFront distribution custom error response:
  - **HTTP Error Code**: `404: Not Found`
  - **Customize Error Response**: `Yes`
  - **Response Page Path**: `/index.html`
  - **HTTP Response Code**: `200: OK`
- **S3 Bucket Policy**: Set `index.html` as the index document. Cache assets in `dist/assets/` with `max-age=31536000, immutable` and `index.html` with `no-cache`.

---

## 7. Verification & Test Suite

All 16 domain and end-to-end synthetic tests are executed via:

```bash
npm test
```

The suite renders a photorealistic cricket delivery with noise and motion blur across:

- **90 km/h** at 60 FPS and 120 FPS
- **120 km/h** at 60 FPS and 120 FPS
- **145 km/h** at 60 FPS and 120 FPS

All test runs confirm measured velocity is strictly within the $\pm 3\%$ ($\pm 4\%$ at 60 FPS) tolerance specification.
