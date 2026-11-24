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
