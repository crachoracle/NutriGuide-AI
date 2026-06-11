# NutriGuide AI

NutriGuide AI is a hackathon-ready MVP for AI-powered restaurant menu guidance. It helps a user scan or paste a menu, choose a dietary profile, review ranked and explainable recommendations, save a meal decision to a food journal, and view a clinician-friendly summary of trends over time.

This is a polished demo, not a production medical device.

## Problem Statement

Restaurant menus are inconsistent, unstructured, and rarely personalized. People managing dietary needs often have to infer which dishes fit their health goals, preferences, religious dietary restrictions, or allergy constraints. That creates risk, frustration, and poor adherence to food plans.

## Target Users

- People managing diabetes, low-carb diets, heart-health goals, weight loss, allergies, or nutrition constraints
- People with vegetarian, vegan, pescatarian, flexitarian, Mediterranean, keto, paleo, or high-protein preferences
- Caregivers helping family members choose safer meals
- Dietitians, clinicians, or caregivers reviewing food choices over time

## MVP Demo Flow

1. Open the app.
2. Choose the seeded restaurant menu, take a menu photo, upload a photo/PDF, or paste/upload menu text.
3. Pick one dietary profile from grouped options.
4. Select allergy sub-options when using Allergy-aware mode.
5. Analyze the menu.
6. Review Best Choices, Use Caution, and Avoid sections.
7. Save a dish with optional notes.
8. Open the journal history.
9. Open the clinician summary to review trends and recurring risks.

## Tech Stack

- React and Vite frontend
- Node.js and Express backend
- Browser localStorage for hackathon journal persistence on static/serverless hosts
- JSON file storage fallback for the local Express journal endpoint
- Mock OCR service
- Mock deterministic recommendation service
- Seeded sample menu data

## Architecture

```text
React client
  |
  | HTTP /api/*
  v
Express API / Vercel serverless function
  |-- routes/menuRoutes.js
  |     |-- sample menu
  |     |-- dietary profiles
  |     `-- mock OCR
  |-- routes/recommendationRoutes.js
  |     `-- mock recommendation service
  `-- routes/journalRoutes.js
        |-- local JSON journal fallback
        `-- clinician summary aggregation

Browser localStorage
  |-- saved meal journal used by the deployed demo
  `-- clinician summary aggregation used by the deployed demo

server/src/services/ocr
  `-- provider boundary for future OCR replacement

server/src/services/ai
  `-- provider boundary for future LLM or rules engine replacement
```

## Setup

Install dependencies from the project root:

```bash
npm install
```

Run the full app:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:4000
```

Run only the backend:

```bash
npm run server
```

Run only the frontend:

```bash
npm run client
```

Build the frontend:

```bash
npm run build
```

## Single-Port Demo With HTTPS

For an external HTTPS demo URL, build the React app and serve it from Express on one port:

```bash
npm run demo
```

Then expose the single Express port with ngrok:

```bash
ngrok http 4000
```

Use the HTTPS forwarding URL that ngrok prints. In this mode, the frontend and API share one origin:

```text
https://your-ngrok-url.ngrok-free.app/
https://your-ngrok-url.ngrok-free.app/api/health
```

This avoids separate frontend and backend tunnel URLs.

## Deploy To Vercel

This repo is configured for Vercel with:

- Vite building the frontend into `client/dist`
- The root build script mirroring `client/dist` to root `dist` for Vercel project-root builds
- `api/[...path].js` exposing the Express API as a Vercel Function
- Browser `localStorage` journal persistence for the deployed demo

Steps:

1. Push this project to GitHub.
2. Create a Vercel account and choose `Add New... > Project`.
3. Import the GitHub repo.
4. Keep the root directory as the project root when possible. This keeps the `/api` Vercel Function included in the deployment.
5. Use these settings if Vercel does not auto-detect them:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

If the Vercel project is already configured with `client/` as the root directory, the frontend build will still create `client/dist` as that project's local `dist/` output. For the API function to deploy too, switch the Vercel project root back to the repository root and redeploy.

6. Deploy.

Vercel will provide an HTTPS URL like:

```text
https://your-project.vercel.app
```

The API should be available at:

```text
https://your-project.vercel.app/api/health
```

For a production version, replace browser-local journal persistence with Vercel KV, Vercel Postgres, OCI Object Storage, or another durable database.

## API Endpoints

- `GET /api/sample-menu` returns demo menu text and metadata.
- `GET /api/dietary-profiles` returns grouped profile options and allergy sub-options.
- `POST /api/ocr` accepts a sample-menu flag, uploaded text, or photo/PDF file metadata and returns mocked extracted menu text.
- `POST /api/recommendations` accepts `menuText`, `dietaryProfile`, and optional `allergyOptions`.
- `GET /api/journal` returns saved journal entries from the local/server fallback.
- `POST /api/journal` saves a selected dish recommendation to the local/server fallback.
- `GET /api/clinician-summary` returns aggregate fallback journal trends.

## Demo Script

1. Start the app with `npm run dev`.
2. Use the sample Harbor Market Cafe menu, or choose `Photo/PDF` and select a menu image or PDF to show the mock OCR upload flow.
3. Select `Low sugar / diabetic-friendly`.
4. Click `Analyze Menu`.
5. Point out the ranked sections and explainable recommendation cards.
6. Save `Salmon with Steamed Vegetables` with a short note.
7. Switch to `Allergy-aware`, select `Shellfish` or `Sesame`, and analyze again to show allergy risk behavior.
8. Save one more dish.
9. Open the journal and clinician summary to show longitudinal review.

## Product Principles

- Make the before-and-after workflow obvious.
- Separate facts from assumptions.
- Do not invent exact nutrition values.
- Treat allergy, halal, and kosher guidance as risk guidance, not guarantees.
- Keep recommendations explainable and actionable.
- Make the journal useful for a later clinician, caregiver, or dietitian review.

## Medical Disclaimer

NutriGuide AI provides dietary guidance only and is not medical advice. Users should consult a qualified medical professional for clinical decisions.

## Allergy And Restriction Disclaimer

Menu ingredients and preparation methods may vary. Users with allergies or strict dietary restrictions should confirm ingredients and cross-contact risks directly with the restaurant.

## Future Roadmap

The menu scan is the entry point into a continuous nutrition intelligence platform. Future versions could combine restaurant decisions with longitudinal health context and clinician review.

- Wearable integration
- Continuous glucose monitor data
- Apple Health / Google Fit
- Smart scale data
- Dietitian or physician review
- Outcome-based personalization over time
- Restaurant-specific learning
- User-specific tolerance and adherence patterns
- Multi-profile support for families and caregivers
- Restaurant certification and allergen-data integrations
- User-specific safe ordering patterns over time

## Known MVP Limitations

- OCR is mocked and accepts seeded sample data, uploaded text, or photo/PDF metadata. It does not extract real text from image or PDF bytes yet.
- Recommendations are deterministic keyword heuristics, not real LLM output.
- In deployed Vercel demos, journal storage is browser-local and device-specific.
- The local Express fallback journal endpoint uses a JSON file; the Vercel function fallback is temporary in-memory storage.
- There is no authentication, multi-user isolation, or production deployment configuration.
- The app does not provide exact nutrition values unless a menu explicitly includes them.
