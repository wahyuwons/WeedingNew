# WeedingNew Revision V5

This patch builds on the existing WW override files and applies only the latest requested revisions:

- Removes the duplicate location button under Akad.
- Keeps one `Lihat Lokasi` button under Resepsi.
- Adds a Google Maps iframe for Graha Menur below the reception details and above the remaining button.
- Updates both venue text blocks to Graha Menur.
- Restores the Wedding Frame title to the original Pinyon Script styling while preserving the current gold color.
- Retains all previous V3/V4 revisions, including image replacement, hidden sections, the local Wedding Frame generator, E-Amplop-only gift section, and simplified footer.

## Installation

1. Extract this folder inside the `WeedingNew` repository.
2. Run `INSTALL.bat` on Windows or `./INSTALL.sh` on macOS/Linux.
3. Confirm `FINAL VERIFICATION: PASS`.
4. Preview `index.html` with VS Code Live Server.
5. Hard refresh using `Ctrl + Shift + R`.
6. Commit:
   - `index.html`
   - `ww-custom-overrides.css`
   - `ww-custom-overrides.js`

The installer updates the cache version to `?v=5` and creates `index.before-ww-revision-v5.html` as a backup.
