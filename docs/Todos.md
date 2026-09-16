# Hotlist Vehicle Tracking System — Build Todo List


## 1. Core Backend + Database
- [ DONE ] Finalize stack (Spring Boot)
- [ ] Design DB schema:
  - [ ] `hotlist_vehicles` table (plate number, owner info, complaint/FIR reference, added_at, status)
  - [ ] `vehicle_locations` table (plate number, lat/long or location string, timestamp) — one-to-many per vehicle
  - [ ] `users` table (citizens, with role field)
  - [ ] `cops` / `admins` table or role flag
- [ ] Build the **Hotlist Handler Service**:
  - [ ] Endpoint: add vehicle to hotlist (only after ownership verification passes)
  - [ ] Endpoint: check if a scanned plate number matches hotlist (used by scanner apps)
  - [ ] Endpoint: ingest location update for a hotlisted vehicle
  - [ ] Endpoint: remove vehicle from hotlist (cops only)
- [ ] Implement auth (JWT or session-based) with roles: `citizen`, `cop`
- [ ] Implement role-based authorization middleware:
  - [ ] Citizen/client apps → write-only access to hotlist-matching endpoint, no read access to DB
  - [ ] Cops → full CRUD + read access to vehicle info and locations
- [ ] OCR service/module for plate reading (decide: on-device in scanner apps, or server-side)

## 2. User Complaint Portal (Web)
- [ ] Simple frontend: form to upload plate number + info proving ownership
- [ ] Backend endpoint to receive complaint submissions
- [ ] Ownership verification step (manual review queue, or some automated check) — decide what "verified" means before building this
- [ ] On verification pass → call hotlist service to add vehicle
- [ ] On verification fail → reject, don't add to hotlist
- [ ] Auth flow for citizens to register/login and file a complaint
- [ ] UI to let a user check status of their filed complaint

## 3. Scanner App(s) — plate detection + reporting
*(Sketch shows two variants: a general "mobile application" that records video and scans, and a React Native volunteer app — treat as one app with a volunteer mode, unless you actually want two separate builds.)*
- [ ] Camera feed capture (continuous or every ~1 sec frame grab)
- [ ] Integrate AI/OCR model for plate detection from frames
- [ ] Local loop: every 1 sec detect plates, build list of identified vehicles + location
- [ ] Every 5 sec: send batch of (plate, location) to hotlist-check endpoint
- [ ] Handle match response: if plate is on hotlist, keep sending location updates every 5 sec for that vehicle
- [ ] App has **no read access** to the hotlist itself — write/query-only, never stores or displays hotlist data locally
- [ ] Auth for volunteer users (so their device can be used as a camera feed)
- [ ] (Optional) Photo capture of matched vehicle every ~30 sec, store as bytes, convert/upload

## 4. Cops Dashboard
- [ ] Auth-gated dashboard (cops only)
- [ ] Table view: all hotlisted vehicles + their latest location (hotlisted vehicles only, not all scanned traffic)
- [ ] Search/filter by plate number, status, date added
- [ ] CRUD actions: view full vehicle info, remove from hotlist, update status
- [ ] View location history / trail for a given hotlisted vehicle
- [ ] (Optional) Map view of current hotlisted vehicle locations

## 5. Business Rules / Automation
- [ ] Auto-remove a vehicle from hotlist if FIR isn't filed within 24–48 hrs of the complaint being added
- [ ] Cooldown period after removal before the same vehicle can be re-marked stolen
- [ ] Background job/scheduler to check and enforce the above (cron, celery, or equivalent)
- [ ] Decide and document what "FIR filed" actually means in the system (manual cop confirmation? external integration? status flag?)

## 6. Security / Access Control (cross-cutting — revisit after each module above)
- [ ] Confirm citizens truly cannot read the DB or hotlist contents at any endpoint
- [ ] Confirm citizens can only ever *add* to hotlist (via verified complaint) — never edit/remove
- [ ] Confirm only cops can read vehicle info and remove from hotlist
- [ ] Encrypt hotlist data in transit/at rest as needed
- [ ] Rate-limit or validate the every-5-second location/plate submissions to prevent abuse

## 7. Open Decisions (resolve before or during build, not after)
- [ ] What exactly counts as "proof of ownership" for the complaint portal verification step
- [ ] Whether the two mobile apps (general scanner vs volunteer app) are actually one app or two
- [ ] Final stack choice (FastAPI/React vs MERN vs Spring Boot)
- [ ] Storage strategy for optional car images (bytes in DB vs object storage)