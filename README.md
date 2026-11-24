# SGM Factory Inspection

An installable inspection app for SGM Windows Manufacturing Ltd. It saves drafts
and completed records in the browser on the inspection device.

## Run a local preview

Extract the ZIP, keeping the folder structure. From a terminal opened in the
`SGM_Factory_Inspection` folder, run one of these commands:

- Windows with Python installed: `py -m http.server 8000 --bind 127.0.0.1`
- macOS or Linux with Python installed: `python3 -m http.server 8000 --bind 127.0.0.1`

Open <http://localhost:8000/> in a current browser. This preview is only reachable
on the same computer. Use the same browser profile and address on each visit
to see your saved test records.

## Deploy and use

1. Have SGM's inspection owner review the starter checklist in `js/config.js`.
   Edit the factory areas and checks as needed and increment the checklist version.
   Each record keeps a copy of its checklist when it is created.
2. Place the full folder on an internal HTTPS web server. Open its address on
   each factory device while online and wait for **Offline ready**. Use the
   browser's install or Add to Home Screen command where available.
3. Start an inspection, enter the area, date and inspector, and record a result
   for each check. A failed check must have a corrective action. **Save draft**
   allows incomplete records. **Complete inspection** saves a read-only record.
4. In **Saved inspections**, reopen a draft or select **View report** for a
   completed record. Choose **Print / save PDF** and select your browser's PDF
   destination. Where available, turn off browser headers and footers for a
   clean report.
5. Try a full inspection in airplane mode on the devices staff will use. Save
   a draft, reopen it, complete it and keep a PDF copy.

Records stay in one browser profile on one device and are not synchronised.
Clearing site data or using a different site address may make records
unavailable. Save completed PDFs to SGM's approved records location. Hosting
this static app does not send inspection contents to the server.

## Publish updates

After changing app files, increment the cache version in `sw.js`. Publish the
entire folder together. On devices with the previous version open, save work
and close all inspection tabs or app windows to let the new version activate.
Use the same deployment URL to retain access to existing records.
