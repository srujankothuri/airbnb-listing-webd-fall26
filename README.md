# StaySplit — Airbnb Listings

A responsive San Francisco listings page built with HTML, CSS, and vanilla JavaScript. It fetches a JSON file asynchronously and displays its first 50 records in their original order.

## Deployment

[Live demo](https://srujankothuri.github.io/airbnb-listing-webd-fall26/)

## Features

- First 50 listings loaded using `fetch`, `await`, and `response.json()`.
- Listing name, full description (expand “About this stay”), all amenities, host name/photo, nightly price, and listing thumbnail.
- **Creative addition: shared trip budget calculator.** Change nights and travelers to see each listing's estimated base total and cost per traveler. Warnings identify guest-capacity and stay-length mismatches.
- Responsive cards, keyboard-accessible expandable sections, loading/error/retry states, and image fallbacks.
- No framework, build step, API key, or external JavaScript dependency.

## Run locally

Open a terminal in this folder and run:

```bash
python3 -m http.server 8000
```

On Windows, use `py -m http.server 8000` if needed. Open http://localhost:8000. VS Code's Live Server extension also works. Do not double-click `index.html`: browsers may block fetch from `file://` URLs.

## Files

```text
index.html          Page structure and calculator controls
styles.css          Responsive layout and styling
app.js              AJAX loading, card rendering, and cost calculations
data/listings.json  Original source dataset (523 records)
LICENSE             Original source repository MIT notice
README.md           Project documentation
```

## How the AJAX code works

1. The deferred script runs after the HTML has been parsed.
2. `loadListings()` calls `await fetch('./data/listings.json')` to request the file over HTTP.
3. It checks `response.ok`, then uses `await response.json()` to parse the response.
4. `data.slice(0, 50)` selects the first 50 entries without sorting or changing the file.
5. `createCard()` builds DOM elements for every selected entry.
6. `updateEstimates()` computes `nightlyRate * nights / travelers` and updates the estimate panels when an input changes.

Descriptions in the dataset contain HTML, so they are converted to plain text. Dataset strings are displayed with `textContent`, not injected as executable HTML. Amenities are stored as JSON-encoded strings and parsed into lists.

## Data and credits

Starter reference and dataset: [John Guerra's Airbnb Listings demo](https://github.com/john-guerra/Airbnb_Listings_demo_page/tree/2023). This project contains a newly implemented interface; the JSON file comes from the repository's `2023` branch (`airbnb_sf_listings_500.json`). Despite its filename, it contains 523 records. Only the first 50 are rendered.

The instructor repository's main branch was empty when this project was prepared. The Canvas `airbnb_listings2.zip` attachment was not used. If your instructor requires that exact file, replace `data/listings.json` with the provided array and verify field names against `createCard()`.

Listing photos and host photos are loaded from URLs in the dataset; they may no longer work. The source repository's MIT notice is retained; no additional rights over third-party photos or listing content are asserted. This is an educational project, not affiliated with Airbnb. Prices are historical USD values, not live quotes. Estimates exclude taxes, cleaning/service fees, and discounts and do not establish availability.

## Publish on GitHub Pages

1. Create a new public GitHub repository named `airbnb-listings` in your account.
2. Upload the **contents of this folder**, preserving the `data` directory. `index.html` must be at the repository root. Commit the files to `main`.
3. Open repository **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save.
4. Wait for the deployment to finish and open the URL GitHub displays.
5. Replace the Deployment paragraph above with `[Live demo](YOUR_ACTUAL_DEPLOYMENT_URL)` using that exact URL, then commit the README edit.
6. Verify 50 cards load on the deployed page, then submit the repository URL to Canvas.

## Before submitting / class demo

- Confirm the deployed page displays 50 cards, from the first JSON record through the 50th.
- Expand a description and amenities list; check host name/photo, thumbnail, and price.
- Change nights/travelers and explain how the shared-cost calculation works.
- Try a small mobile viewport and navigate controls using Tab.
- Open the browser Network panel and show the successful `listings.json` request.
- Review and personalize this implementation and be prepared to explain it. Follow your course's policy on AI assistance.
- Complete the separately assigned peer review of a classmate's submission.
