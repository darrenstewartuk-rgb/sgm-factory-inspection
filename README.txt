SGM FACTORY INSPECTION — STANDALONE REPLICA

A locally built implementation based on the publicly viewable SGM Factory Inspection v1.1 repository and screenshot (24 November 2026).

Contents: index.html, manifest.json, sw.js, assets/icon.svg.

HOSTING
Upload these files preserving the folder structure to a secure HTTPS site, for example GitHub Pages (as a separate repository or replacing files only after backing up the original). Visit the resulting index.html in Android Chrome and use the Chrome menu > Add to Home screen > Install app. HTTPS is required for offline service-worker installation and GPS.

LOCAL TEST
On a computer with Python: from this folder run "python -m http.server 8000" and open http://localhost:8000 in the same computer's browser. Android requires HTTPS hosting or local-network networking with additional configuration.

FUNCTIONS
Multiple inspections; unit selection; 38 original questions across 9 sections; four statuses; notes; camera/photos; corrective actions, responsibility, priority and due date; general comments; automatic IndexedDB saving; score overview; detailed reporting and browser Print/Save-as-PDF; photo saving; JSON backups and restore; offline cache.

IMPORTANT LIMITATIONS
This is a FUNCTIONAL REIMPLEMENTATION, not a byte-for-byte copy of the GitHub repository. The original's bundled jsPDF layout has NOT been replicated; use the Android Chrome Print > Save as PDF method. Saved inspections reside only in that browser's IndexedDB. They are not synced to the original GitHub Pages site or across devices. Export JSON backups regularly and do not clear website data until they are safely stored. A backup from this replica may be imported back into this replica, but importing into the original has not been verified. No server-side user accounts or centrally shared database are present.

For inspections requiring statutory records, validate the question set, legal references and PDF output before deployment.


VERSION 1.3 — 24 NOVEMBER 2026
Added seven inspection locations: Unit 1 Offices, Unit 2 Offices, Customer Care Offices, Accounts Offices, Dispatch Office, Aluminium Office and Reception Area.
Added Visual Display Units (DSE) inspection section (12 checks), based on HSE's DSE workstation guidance.
Previously saved v1.2 inspection records are supported: the new DSE section is added when an older record is opened or imported. Previous answers and photographs are retained.
Inspect one workstation/location at a time where individual DSE risks or adjustments are concerned. This workplace checklist is not a substitute for an individual DSE workstation assessment.
If upgrading an existing site, retain the same GitHub Pages URL and upload index.html, sw.js, manifest.json and the assets folder. Make a JSON backup in the app before updating.
