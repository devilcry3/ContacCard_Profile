# Digital flip business card — V11 animated compass

A free, static HTML/CSS/JavaScript project, suitable for GitHub Pages. No subscription, database, or paid hosting required.

## What's in this revision

- The profile face, portrait/logo swap, flip control, links, and Save Contact (.vcf) remain functional.
- The back uses the approved visual reference: scorched parchment, softened cartographic mountains, and a dark bronze/verdigris compass binding sitting over the paper.
- The **binding's compass** is now a separate transparent `compass-button.png` image inside the existing PNG download button. It glows and subtly enlarges/rotates on hover or keyboard focus, and stays independent of the surrounding bronze binding.
- The static compass was removed from the background image (`approved-no-compass.webp`) to avoid a double image when the button animates.
- The **PNG export captures the actual HTML/CSS layout**, instead of drawing a different version in a separate canvas. This was tested using Chromium.
- The QR image and all card text are live editable elements, not permanently embedded in the decorative artwork.

## Open on your computer

1. Unzip the download and open a terminal in the `fantasy_card` folder.
2. Run:

   ```powershell
   py -m http.server 5500
   ```

   If `py` isn't recognized, try `python -m http.server 5500`.
3. Open **http://localhost:5500** in Chrome or Edge.
4. Use **FLIP CARD** to see the back. Clicking the **bronze compass** on the binding downloads the PNG.
5. Stop the server with `Ctrl+C`.

Do not open `index.html` with `file:///` when testing PNG export. Browsers restrict some local-file access.

## Personalize the card

Open `config.js` and edit:
- `name`, `role`, `tagline`, `email`, and optionally `phone`
- `github`, `linkedin`, `website`, `projects`, `interests`, `resume`
- `logo`: default `assets/logo.svg` — replace the SVG with your personal logo or change the path
- `photo`: put `photo.jpg` into the `assets` folder, or change the path
- `photoSwapSeconds`: `7` alternates the photo and logo automatically, `0` disables the timer

The `.vcf` download is generated from this configuration when the webpage loads.

## Make the QR code real (important)

**The included QR code is only a DEMO — it is not a working public card URL.** Do not share it before these steps.

1. Publish the card to a public GitHub Pages URL.
2. Put that exact public URL in `config.js` under `cardUrl` (including `https://`).
3. With Python installed, run once:

   ```powershell
   py -m pip install "qrcode[pil]" pillow
   py generate_qr.py https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
   ```

4. This creates `assets/qr-code.png`. Reload the webpage and check the QR code using a different phone. The QR destination in `config.js` must match the URL passed to the generator.
5. Commit **both** `config.js` and `assets/qr-code.png` to GitHub Pages.

The logo is displayed as an overlay in the middle of the QR, so it is editable without regenerating the QR if the destination hasn't changed. QR error correction is configured at the high level; test with multiple phones, especially after replacing the logo.

## Publish free via GitHub Pages

1. Create a **public** GitHub repository.
2. Upload the contents of `fantasy_card` to the repository root (not the parent ZIP folder).
3. In the repository, open **Settings > Pages**, choose **Deploy from a branch**, and select the `main` branch at `/ (root)`.
4. Wait for your Pages URL to become active; then follow the QR-code steps above.

## Design and editing notes

- `styles.css` contains the full HTML card layout and the editable purple/green profile face. The profile design was left unchanged.
- `assets/approved-no-compass.webp` is the active approved parchment/mountain/binding artwork **without the fixed compass**; `assets/compass-button.png` is the extracted, transparent compass, positioned using percentages in `styles.css`. The original `assets/approved-blank-card.webp` is kept as an archival source reference. If the card artwork is changed, update the compass sprite and CSS coordinates together.
- `reference/approved_artwork.png` is the visual reference so you can compare and rework assets later.
- The card back's text fields and QR remain separate HTML elements, positioned with CSS percentages for responsive scaling.
- The exported PNG should match the website because it snapshots the live back face; for best results use a recent Chromium browser (Chrome or Edge). Other browser engines have not been verified for SVG-based capture.

## File reference

- `index.html` — profile, contact face, links, buttons
- `styles.css` — visual styles and responsive layout
- `script.js` — flip, photo/logo alternation, links, .vcf, and PNG export
- `config.js` — personal data and destinations
- `generate_qr.py` — build an actual scannable QR image after deployment
- `assets/` — approved decorative artwork, sample QR, logo


## Compass button details

- The transparent compass art is in `assets/compass-button.png`, rather than being embedded in the rail background.
- Adjust the `top`, `left`, `width`, and `height` percentages in the **V11** `.business .rail-compass` rules at the bottom of `styles.css` if you change the card artwork.
- The `:hover`, `:focus-visible`, and idle breathing styles live in that same block. `prefers-reduced-motion` disables animation.
- `script.js` removes the hover/idle effects while generating the PNG so the downloaded card remains clean and consistent.
- Keep the QR label in **DEMO** mode until `cardUrl` is configured and `generate_qr.py` has been run.
