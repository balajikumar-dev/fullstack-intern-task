# Verification — 10 October 2026

Verified locally on Windows with Node.js 24 and MongoDB. The application title is **Mini SaaS Template Store** in the header, home page, browser tab and documentation. The checks below were reviewed against all three assessment screenshots.

| Check                       | Result                                                           |
| --------------------------- | ---------------------------------------------------------------- |
| Backend integration suite   | 15 passed, 0 failed                                              |
| Frontend lint               | Passed with no warnings                                          |
| Frontend production build   | Passed                                                           |
| Production dependency audit | Zero reported vulnerabilities in both client and server          |
| Database health             | Connected; six sample templates and model indexes verified       |
| Repeat seed                 | Preserves existing records and avoids duplicate samples          |
| Browser registration        | Empty fields validated; test account registered successfully     |
| Browser login               | Incorrect password rejected; correct credentials accepted        |
| Protected navigation        | Guest favorite redirects to login; Favorites requires sign-in    |
| Favorite return flow        | Selected template saved after registration                       |
| Persistence                 | Favorite remains after page refresh and subsequent login         |
| Favorite removal            | Saved entry removed; empty collection displayed                  |
| Catalog                     | Search, categories, alphabetical sort and empty results checked  |
| Details                     | Template fields, saved state and full-size preview link verified |
| Responsive layout           | Desktop, 390-pixel and 320-pixel mobile widths checked; mobile menu works |

Local preview: `http://localhost:5173`. API: `http://localhost:5001` on the prepared computer, because an earlier development process occupies 5000. New clones default to API port 5000; see the README for matching client/server configuration.

The full development dependency audit reports three related high-severity entries in the `nodemon → chokidar → braces` chain. There is no patched braces version reported by the audit; its suggested automatic fix downgrades nodemon to an old major version. Nodemon remains installed to match the requested development setup. Production uses `node server.js` and `npm ci --omit=dev`, with zero reported production advisories. Do not run a forced dependency downgrade. Node's built-in `node --watch server.js` is an alternative development runner.

## Required feature coverage

| Assessment requirement | Status and evidence |
| --- | --- |
| React frontend, Express backend and database/ORM | Complete: React + Vite, Tailwind, Express, MongoDB and Mongoose |
| Register and login | Complete: form and API validation, bcrypt password hashes and JWT authentication |
| Template fields | Complete: `id`, `name`, `description`, `thumbnail_url`, `category` |
| `GET /api/templates` and `GET /api/templates/:id` | Complete: catalog, details and safe JSON errors verified by integration tests |
| `POST /api/favorites/:templateId` and `GET /api/favorites` | Complete: authenticated, persisted and scoped to the current user |
| Seed at least five templates | Complete: six records, stable IDs and repeatable seed |
| Validate registration/login and return proper status codes | Complete: success plus 400/401/404/409/429 cases covered |
| `/register`, `/login`, `/templates`, `/favorites` pages | Complete: React Router routes, with authentication redirect for favorites |
| JWT in localStorage and Axios API calls | Complete: persisted token and centralized Axios client |
| Cards with images, titles, descriptions and Favorite button | Complete: six original preview illustrations, saved markers and remove action |
| Responsive, clean UI | Verified on desktop and mobile; loading, empty and error states included |
| Public `fullstack-intern-task` repository with client/server | [Published under balajikumar-dev](https://github.com/balajikumar-dev/fullstack-intern-task) |
| README setup, stack, name and contact | Complete: installation/run instructions, technologies, Balaji Kumar and public GitHub contact |

The legacy internal storage key `forma.accessToken` is retained so the title change does not log existing users out. It is an implementation detail, not the displayed project name.

## Bonus and submission status

- Search, category filters, logout and protected routes: complete. Alphabetical sorting, template details, favorite removal and CI are also included.
- GitHub Actions: [frontend and backend checks passed for the initial published version](https://github.com/balajikumar-dev/fullstack-intern-task/actions/runs/38021887186). The current revision's status is available in [Actions](https://github.com/balajikumar-dev/fullstack-intern-task/actions).
- Live deployment: **not deployed**. Render/Vercel configuration and deployment instructions are supplied; hosting is optional in this assessment.
- Repository link submission to Gnxtace: **still to be done by the applicant**. No application or message has been sent to the internship provider.

All mandatory application features are implemented and verified. Evaluation scores and internship selection are determined by Gnxtace; this report does not claim a score.
