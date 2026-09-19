# RAKSHAK — Master Project Plan & Todo List (Academic & Production Specification)

**Privacy-First Mobile ANPR & Stolen Vehicle Sensing Network**  
Smart India Hackathon (SIH 2026) · Vision Track · Smart Automation

> ✅ **Audited 2026-09-19** against the actual codebase (`backend`, `cop-dashboard`, `web-complaint-portal`, `mobile-application`).
> Checkbox marks now reflect verified reality: `[x]` = implemented and verified in code, `[ ]` = not implemented or only partially.
> ⚠️ notes flag gaps inside items that were previously marked done (or falsely left undone). Sections 7–8 list defects and missing architecture tasks discovered during the audit.

---

## 1. Academic Metric Framework (Formal Mathematical Formulations)

> Status: spec only. No instrumentation for any of these metrics exists in the repo yet (see §8.12).

### 1.1 Stage 1: Plate Detection Formulation (YOLOv8n / YOLO11n)
- [ ] **Intersection over Union (IoU)**:
  $$\text{IoU} = \frac{\text{Area}(B_p \cap B_{gt})}{\text{Area}(B_p \cup B_{gt})}$$
- [ ] **Precision, Recall, F1-Score**:
  $$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}, \quad F_1 = 2 \cdot \frac{P \cdot R}{P + R}$$
- [ ] **Mean Average Precision (mAP)**:
  - $\text{mAP@0.50}$: Area under Precision-Recall curve at $\text{IoU} \ge 0.50$.
  - $\text{mAP@[0.50:0.95]}$: COCO 10-point threshold average ($\tau \in [0.50, 0.95]$ with step $0.05$).
- [ ] **Computational & Hardware Metrics**:
  - Preprocess time ($T_{\text{pre}}$), Forward inference time ($T_{\text{inf}}$), NMS postprocess time ($T_{\text{nms}}$).
  - Effective FPS ($1000 / T_{\text{total}}$).
  - Parameter count ($M$), GFLOPs, Quantization performance (FP32 vs FP16 vs INT8).
- [ ] **Dataset Baselines**:
  - CCPD-Base benchmark baseline ($\text{mAP@0.5} \approx 98.7\%$).
  - CCPD-Blur / CCPD-Challenge baseline ($\text{mAP@0.5} \approx 92.4\% - 94.1\%$).
  - Indian LP dataset baseline ($\text{mAP@0.5} \approx 92.4\% - 94.6\%$).

### 1.2 Stage 2: Character Recognition Formulation (PaddleOCR / LPRNet)
- [ ] **Levenshtein Distance $D_{\text{Lev}}(Y, \hat{Y})$**: Minimum edit operations (Insertions, Deletions, Substitutions).
- [ ] **Character Error Rate (CER)**:
  $$\text{CER} = \frac{\sum_{i=1}^P D_{\text{Lev}}(Y_i, \hat{Y}_i)}{\sum_{i=1}^P |Y_i|} \times 100\%$$
- [ ] **Character Recognition Rate (CRR)**: $\text{CRR} = (1 - \text{CER}) \times 100\%$.
- [ ] **Full-Plate Exact Match Accuracy ($\text{Acc}_{\text{exact}}$)**:
  $$\text{Acc}_{\text{exact}} = \frac{1}{P} \sum_{i=1}^P \mathbb{I}(Y_i = \hat{Y}_i) \times 100\%$$
- [ ] **Normalized Edit Distance (1-NED)**:
  $$\text{1-NED} = 1 - \frac{1}{P}\sum_{i=1}^P \frac{D_{\text{Lev}}(Y_i, \hat{Y}_i)}{\max(|Y_i|, |\hat{Y}_i|)}$$
- [ ] **Confusion Matrix**: $36 \times 36$ matrix tracking alphanumeric misclassifications:
  - $(0 \leftrightarrow O)$, $(1 \leftrightarrow I)$, $(8 \leftrightarrow B)$, $(5 \leftrightarrow S)$, $(2 \leftrightarrow Z)$.
- [ ] **OCR Benchmark Baselines**:
  - PaddleOCR PP-OCRv4/v5 mobile: $\text{CRR} \approx 95.4\% - 97.1\%$, $\text{Acc}_{\text{exact}} \approx 84.5\% - 89.2\%$.
  - LPRNet: $\text{CRR} \approx 94.0\% - 95.8\%$, $\text{Acc}_{\text{exact}} \approx 82.1\% - 86.4\%$.

### 1.3 Stage 3: Multi-Frame Temporal Aggregation & System Privacy
- [ ] **End-to-End Accuracy ($\text{Acc}_{\text{E2E}}$)**: Plate correctly detected $(\text{IoU} \ge 0.5)$ and OCR text is $100\%$ exact match.
- [ ] **Temporal Consensus Voting Gain**: Consensus voting across $K=3$ to $K=5$ video frames boosting single-frame accuracy from $\sim 85\%$ to $>96.5\%$.
- [ ] **Zero-Retention Audit Metric**:
  $$\text{Leakage Rate} = \frac{\text{Unmatched Plates Persisted}}{\text{Total Unmatched Detected}} \equiv 0.00\%$$
- [ ] **End-to-End Alert Latency**: Detection to Cop Dashboard pin update $< 1500\text{ ms}$.

---

## 2. Spring Boot Monolith Architecture (Feature–Subfeature Model)

- [x] **Restructure `backend/src/main/java/com/sih/backend`** *(verified — all packages present, legacy `enitiy/` skeleton removed)*:
  - [x] `auth/` (subfeatures: controller, dto, entity, repository, service, token/jwt)
  - [x] `complaint/` (subfeatures: submission, verification, fir, entity, repository)
  - [x] `hotlist/` (subfeatures: core, sync, cleanup/scheduler, entity, repository)
  - [x] `sighting/` (subfeatures: ingestion, trajectory, photo, entity, repository)
  - [x] `cop/` (subfeatures: dashboard, management, audit, entity, repository)
  - [x] `common/` (subfeatures: config, exception, enums, util)
- [x] **Database Relational Schema (PostgreSQL)**:
  - [x] `users`: id, email, password_hash, full_name, role (`CITIZEN`, `VOLUNTEER`, `COP`, `ADMIN`), created_at
  - [x] `complaints`: id, user_id, plate_number, owner_name, proof_document_ref, status, created_at
    - ⚠️ `vehicleMake` / `vehicleModel` / `color` / `stolenDateTime` / `lastKnownLocation` are accepted by `ComplaintRequest` but **not stored** — the entity has no columns and the service discards them (fix: §8.4).
  - [x] `hotlist`: id, plate_number (unique index), complaint_id, status, added_at, fir_deadline, fir_reference_no, cooldown_until
  - [x] `sightings`: id, hotlist_id (mandatory FK), device_id, latitude, longitude, captured_at, confidence, photo_storage_ref
    - ⚠️ `device_id` FK is non-nullable but ingestion never sets it → every matched sighting fails to persist (fix: §7.3).
  - [x] `audit_logs`: id, actor_id, role, action, target_entity, timestamp, ip_address
  - [x] `devices`: id, user_id, device_id, type (`FLEET`/`VOLUNTEER`), token, last_sync_at, revoked *(in code but missing from the original plan; token is client-supplied and never validated — §8.2)*
- [x] **Zero-Retention Sighting Ingestion Service**:
  - [x] Endpoint `POST /api/v1/sightings/ingest` receiving 5s batch from mobile edge
  - [x] In-memory comparison against active hotlist entries
  - [x] Persist ONLY matched records to `sightings` *(⚠️ broken at runtime — see §7.3)*
  - [x] Immediately deallocate/drop non-hotlisted plate records from memory
  - [x] Push hit notification to Cop Dashboard via WebSocket (`/topic/sightings`)
  - ⚠️ Additional gaps vs Flow C: client `timestamp` is ignored (no sanity check), dedup is per-batch only (no per-device window / cross-device confirmation), `photoStorageRef` is a fabricated path string with no actual storage (§7.3, §8.3, §8.6).
- [x] **FIR Automation & Cooldown Scheduler** *(verified)*:
  - [x] `@Scheduled` task running every 5 minutes
  - [x] Check vehicles in `ACTIVE_UNCONFIRMED` status exceeding `fir_deadline` (48 hours)
  - [x] Auto-transition expired vehicles to `EXPIRED` status
  - [x] Set `cooldown_until` = `NOW() + 72 hours`
  - [x] Cooldown check on new complaint submission to reject repeated false reports
  - Note: expiry is not broadcast over WebSocket; devices learn on next `/hotlist/sync` (acceptable per Flow E, consider pushing).
- [x] **Role-Based Access Control (RBAC)**:
  - [x] `CITIZEN`: Write-only to complaints, view own complaint history, zero access to hotlist or sightings
    - ⚠️ `GET /api/v1/complaints/{id}` falls through to `anyRequest().authenticated()`; ownership is only enforced inside the service, and COP/ADMIN calling it get a 500.
  - [ ] `VOLUNTEER` / `DEVICE`: Submit batch sightings, zero read access to DB or full hotlist
    - ❌ **Falsely done**: sightings submission works, but `GET /hotlist/sync` (permitted for VOLUNTEER/DEVICE) returns the **full hotlist in plaintext** — `encryptedData` is just the plate number repeated ("In production, encrypt this" comment). Fix: §8.1.
  - [x] `COP`: Read hotlist, read sightings, verify FIR, mark recovered, audit history
    - ⚠️ Officer actions are **never written to the audit log** (`AuditService.logAction` has zero callers, §7.5); `/cop/audit` and `/cop/sightings` are not actually locked to COP — they fall through to `anyRequest().authenticated()` and are readable by ANY role (§7.1).
  - [ ] `ADMIN`: User management, audit logs, system configuration
    - ⚠️ User management + audit read exist (with the same route hole), but "system configuration" is not implemented; admin endpoints leak `passwordHash` (§7.4).

---

## 3. Police Cop Dashboard (`cop-dashboard`) — KISS UI/UX

- [x] **Core Setup**: Vite + React + TypeScript (React Compiler enabled) — ⚠️ Tailwind CSS is declared in `package.json` but **never used**; all styling is hand-written CSS (`App.css` / `index.css`).
- [x] **Authentication**: Secure login view with JWT token management and role guard (`COP`).
  - ⚠️ Tokens live in `localStorage`; there is no auto-refresh on 401 (refresh token is stored but unused).
- [x] **Hotlist Table View**:
  - [x] Instant search by plate number
  - [x] Filter by status (`ACTIVE_UNCONFIRMED`, `ACTIVE_CONFIRMED`, `EXPIRED`, `RECOVERED`)
  - [ ] Columns: Plate, Vehicle, Added Date, Status, Last Seen, Actions — ⚠️ "Vehicle" column missing (backend does not store/return vehicle details, §8.4); FIR Deadline column shown instead.
  - [x] Actions: "View Trail", "Verify FIR", "Mark Recovered" *(via browser `prompt()`/`confirm()` dialogs — works, but swap for proper modals later)*
- [ ] **Live Surveillance & Trajectory Map**:
  - [x] Interactive Leaflet / OpenStreetMap view
  - [ ] Real-time marker updates via WebSocket — ⚠️ WS sightings update the table + last-seen fields, but an **open trail modal does not live-update** (`mapSightings` is snapshotted on open).
  - [x] Breadcrumb trail (polyline) showing 5-second interval sightings
  - [ ] Side panel: Sighting photo preview + OCR confidence — ⚠️ confidence shows in map popups only; **photo preview is impossible today** because no photo is ever stored or served (§8.3).
- [x] **Audit Log Explorer**: Read-only log of system actions and officer decisions.
  - ⚠️ The panel fetches `/cop/audit` with a bare `fetch()` **without the Authorization header** → always 401s in practice; the existing `auditApi.getRecent` (axios, has the token) is unused (§7.11). Also empty in practice until §7.5 fixes audit writing.

---

## 4. Citizen Complaint Portal (`web-complaint-portal`) — KISS UI/UX

> ❌ **Audit verdict: previously marked done, but the portal is a UI mock — it contains zero API calls.** The backend API is fully ready and completely unused by this app.

- [x] **Core Setup**: Vite + React 19 + TypeScript + Tailwind CSS v4 (clean, friendly) + Vitest tests.
- [ ] **Authentication**: Registration and sign-in screens exist but are **static forms with no submission handlers** — no API call, no token storage, no protected routes.
- [ ] **File Complaint Form**:
  - [x] License plate input with auto-formatting to Indian HSRP format *(unit-tested)*
  - [ ] Vehicle make, model, color, date/time stolen, last known location — inputs render but are uncontrolled and never submitted (backend discards them anyway, §8.4)
  - [ ] Document file upload (RC book / insurance copy) — dashed placeholder UI only; no upload logic or backend endpoint
  - [ ] **Form is not wired to `POST /api/v1/complaints` at all** (§8.5)
- [ ] **Complaint Tracker**:
  - [x] Visual timeline UI: `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Added to Hotlist (48h Window)` $\rightarrow$ `FIR Verified` $\rightarrow$ `Vehicle Sighted / Recovered` — ⚠️ step states are hardcoded demo values, not derived from complaint status.
  - [x] Live countdown timer for FIR submission — ⚠️ always starts at a hardcoded 48h; not tied to a real `firDeadline` from `GET /complaints/my`.
  - [ ] FIR document / reference number upload form — UI only; not wired to `POST /complaints/{id}/fir`.
  - [ ] Tracker data is hardcoded (`#CMP-890123`, `MH 12 AB 1234`) — no connection to the citizen's actual complaints or the sightings feed.

---

## 5. Mobile Scanner Edge Application (`mobile-application`)

- [x] **Core Setup**: React Native / Expo — ⚠️ uses `expo-camera` (spec said VisionCamera; decide, §8.9). **App cannot build today**: `@react-native-async-storage/async-storage` is imported in `services/auth.ts` but missing from `package.json` (§7.7).
- [ ] **HUD & UX**:
  - [ ] Clean camera overlay with bounding box indicators — ⚠️ static guide box only; there is no detection output to draw boxes from.
  - [x] Live telemetry: Status (Scanning / Paused), FPS, Network, Active Hits — ⚠️ FPS calculation reads stale state and will not count correctly.
  - [ ] Distinct haptic and audio chime when a confirmed hotlist hit is acknowledged — ⚠️ vibration only; no audio.
- [ ] **Edge AI Pipeline**:
  - [ ] 1-second frame capture — ⚠️ manual CAPTURE button only; the frame processor loop is commented out.
  - [ ] YOLO plate detector (ONNX Runtime Mobile / TFLite) — not integrated (stub comment in `ScanScreen`).
  - [ ] Crop plate region $\rightarrow$ OCR engine (PP-OCRv4 / LPRNet) — not integrated; detection is simulated with a hardcoded plate.
  - [x] Temporal consensus buffer ($K=3$ frames) to filter noise — implemented in `utils/plateUtils.ts` (2s window), fed simulated reads for now.
- [ ] **Zero-Retention Network Loop**:
  - [x] Every 5 seconds: send detected candidate plates + GPS coordinates to `/api/v1/sightings/ingest` (`SightingBuffer` with flush interval + max size).
  - [ ] Immediately clear local frame cache and plate memory — ⚠️ manual RESET button only; no automatic clearing after flush.
  - [x] Offline queue buffer for detected hits if connection drops temporarily — failed flushes are re-queued and retried.
  - ⚠️ The hotlist used for on-device matching arrives in **plaintext** from `/hotlist/sync` (spec requires encrypted sync + keystore, §8.1). Post-login navigation is broken (LoginScreen returns null; nothing navigates to Scan, §8.9). The mobile `DashboardScreen` calls the COP-only `GET /hotlist` with a VOLUNTEER token — a designed-in RBAC conflict (§8.9).

---

## 6. Verification & Academic Benchmarking

- [ ] Automated integration test suite validating RBAC isolation.
- [ ] Ingestion zero-retention memory audit (verifying 0 unmatched records written to PostgreSQL).
  - ⚠️ The existing `SightingIngestionServiceTest` was written against the pre-refactor API (record DTOs, `SightingDto`, `deviceId` on `Sighting`, `findAll()` stubs) and **does not compile** — the backend test suite is red (§7.6).
- [ ] Benchmark test: simulated concurrent mobile edge devices (10–50 streams) verifying backend throughput and $< 1500\text{ ms}$ alert delivery.
- [ ] Compile experimental evaluation tables with mAP, CER, CRR, and Temporal Voting gains for the project report.

---

## 7. Corrective Tasks — Critical Defects Found in Audit (fix before demo)

- [ ] **7.1 RBAC route fall-through:** `GET /api/v1/cop/audit`, `GET /api/v1/cop/sightings`, and `GET /api/v1/hotlist/plate/{plate}` do not match any explicit rule ( `/api/v1/audit/**`, `/api/v1/hotlist/*` are single/different segments) and land in `anyRequest().authenticated()` → **any role incl. CITIZEN can read audit logs and all sightings**. Fix with explicit COP rules / default-deny for `/api/v1/**`.
- [ ] **7.2 Privilege escalation at registration:** `POST /auth/register` accepts a client-chosen `role` — anyone can self-register as `COP` or `ADMIN`. Restrict self-registration to `CITIZEN`/`VOLUNTEER`; elevated roles via admin API only.
- [ ] **7.3 Ingestion persistence is broken:** `Sighting.device` is a non-nullable FK but `SightingIngestionService.ingestBatch` never sets it → every matched sighting throws a NOT NULL violation and nothing is ever saved. Resolve the `Device` from the authenticated principal/device registry before save.
- [ ] **7.4 Admin API leaks credentials:** `AdminController` returns raw `User` entities (serializes `passwordHash`) and `createUser` stores the plaintext password without `BCryptPasswordEncoder`. Return DTOs and encode passwords.
- [ ] **7.5 Audit trail is never written:** `AuditService.logAction` has no callers. Wire it into verify-FIR, mark-recovered, complaint verification, and admin user/role changes (spec: "every officer action is written to an audit log").
- [ ] **7.6 Backend test suite is red:** rewrite `SightingIngestionServiceTest` against the current API (`SightingBatchRequest` record, `HotlistRepository.findByStatusIn`, `Device` entity) and verify the Spring Boot 4 test-starter coordinates in `pom.xml` actually resolve (`mvn -q test-compile`).
- [ ] **7.7 Mobile app cannot build:** add the missing `@react-native-async-storage/async-storage` dependency (imported by `services/auth.ts`).
- [ ] **7.8 Unauthenticated WebSocket:** `/ws/**` is `permitAll` and STOMP CONNECT is unauthenticated → anyone can subscribe to `/topic/sightings` and stream hotlist vehicle locations. Require a COP JWT at CONNECT/subscribe.
- [ ] **7.9 No global exception handler:** services throw raw `RuntimeException` → 500s with no structured body. Add a `@RestControllerAdvice` mapping bad-credentials → 401, cooldown/state conflicts → 409, not-found → 404, validation → 400.
- [ ] **7.10 Hardcoded API origins:** dashboard/portal/mobile hardcode `http://localhost:8080` / `10.0.2.2` while docker nginx proxies `/api`. Switch frontends to relative `/api` + vite dev proxy (and add backend CORS config for dev).
- [ ] **7.11 Dashboard audit panel always 401s:** replace the bare `fetch('/api/v1/cop/audit')` with the token-bearing `auditApi.getRecent` axios call.

## 8. Architecture Coverage Gaps (tasks missing from the original plan)

- [ ] **8.1 Encrypted hotlist sync + remote wipe:** implement AES-GCM-encrypted `HotlistSyncResponse` with per-device keys held in the OS keystore, plus a wipe/revocation endpoint. Also settle design-doc Q1 (on-device matching vs server-side matching for volunteers) — currently Model 1 is half-implemented with plaintext.
- [ ] **8.2 Real device authentication:** server-issued, revocable device tokens validated on `/sightings/ingest` (today `Device.token` is client-supplied and never checked); enforce `revoked`; update `lastSyncAt` on `/hotlist/sync`.
- [ ] **8.3 Photo pipeline:** actually store hit photos (filesystem/object storage) instead of fabricating a path string, add `GET` serving for dashboard/mobile preview, and define a retention policy (design-doc Q7).
- [ ] **8.4 Complaint data completeness:** persist `vehicleMake/model/color/stolenDateTime/lastKnownLocation` on `Complaint`, and add RC/FIR document upload with backend storage + `proof_document_ref`.
- [ ] **8.5 Portal ↔ backend integration:** auth context (register/login/logout, token storage), wire the complaint form to `POST /complaints`, drive the tracker from `GET /complaints/my` (real status + `firDeadline`) and FIR submit to `POST /complaints/{id}/fir`.
- [ ] **8.6 Ingestion hardening (Flow C steps 2 & 4):** timestamp sanity window, per-device+plate dedup across batches, optional cross-device confirmation.
- [ ] **8.7 Citizen notifications (Flow A step 6):** notify on hotlist add, rejection with reason, FIR-deadline reminders, and auto-expiry — completely absent from code and the original plan.
- [ ] **8.8 Token lifecycle:** logout/refresh-token rotation, mobile auto-refresh on 401, revocation story for both user and device tokens.
- [ ] **8.9 Mobile app fixes:** repair post-login navigation (currently stuck on Login), role-gate or remove the mobile `DashboardScreen` (VOLUNTEER must not read `GET /hotlist`), choose VisionCamera vs expo-camera, and implement the real frame-processor loop.
- [ ] **8.10 RBAC vs spec:** volunteers should be able to file complaints (spec: "volunteer = everything above + lend phone"); current config restricts complaints to `CITIZEN` only.
- [ ] **8.11 CI pipeline:** `mvn verify`, `pnpm vitest run` (portal), `tsc -b` builds for both web apps, mobile typecheck — none exist.
- [ ] **8.12 Metric instrumentation for §1:** frame timing hooks, an OCR CER/exact-match harness, E2E alert-latency timer, and an automated zero-retention leakage audit to produce the report tables.

---

*Section 14 (open questions) of the design document is still unresolved and gates several items above — especially Q1 (hotlist model), Q4 (FIR window/cooldown), and Q7 (photo retention).*
