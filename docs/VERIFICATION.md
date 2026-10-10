# Verification — 10 October 2026

Verified locally on Windows with Node.js 24 and MongoDB. These results describe local checks, not hosted CI or a public deployment.

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
| Responsive layout           | Desktop and 390-pixel mobile viewport checked; mobile menu works |

Local preview: `http://localhost:5173`. API: `http://localhost:5001` on the prepared computer, because an earlier development process occupies 5000. New clones default to API port 5000; see the README for matching client/server configuration.

The full development dependency audit reports three related high-severity entries in the `nodemon → chokidar → braces` chain. There is no patched braces version reported by the audit; its suggested automatic fix downgrades nodemon to an old major version. Nodemon remains installed to match the requested development setup. Production uses `node server.js` and `npm ci --omit=dev`, with zero reported production advisories. Do not run a forced dependency downgrade. Node's built-in `node --watch server.js` is an alternative development runner.

GitHub Actions and Render/Vercel configuration are supplied. A public repository and hosted live URL must be verified separately before being represented as submitted or deployed. No application has been sent to the internship provider.
