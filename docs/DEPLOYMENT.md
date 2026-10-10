# Deploy Mini SaaS Template Store

The repository includes configuration for a Vercel frontend and a Render backend. MongoDB Atlas provides the database. These files prepare deployment; they do not create accounts or provision services.

## 1. Prepare MongoDB Atlas

Create an Atlas deployment and an application database user with access to the application's database. Add the backend's outbound IP addresses to the Atlas network access list. Use the `mini_saas_template_store` database in the connection URI. Store the real URI only in the hosting provider's environment settings or an ignored local `.env` file.

Atlas distinguishes database users from the account used to sign in to its dashboard. Its [connection guide](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/) explains the database-user, network-access and connection-string steps.

## 2. Deploy the backend to Render

Connect the GitHub repository in Render and create a Blueprint using the root `render.yaml` file. It selects `server` as the service root, installs from the lockfile, starts the API with `npm start`, and checks `/health`.

Set the requested values:

| Variable        | Value                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `MONGO_URI`     | Your Atlas connection URI, including the application database name.                                       |
| `CLIENT_ORIGIN` | Your frontend origin, for example `https://your-project.vercel.app`, without a path or trailing slash.    |
| `JWT_SECRET`    | The Blueprint generates a random value. Keep it private.                                                  |
| `NODE_ENV`      | `production`, already set by the Blueprint.                                                               |
| `TRUST_PROXY`   | `1` for Render's trusted reverse proxy, already set by the Blueprint. Keep `0` for direct local requests. |

Render supplies `PORT`; do not hardcode the development port in its dashboard. `TRUST_PROXY=1` lets the API use the client IP forwarded by the hosting proxy for authentication rate limits. Use this setting only when the API is behind one trusted proxy. The initial Blueprint flow prompts for the values marked `sync: false`. If you later change these values, edit them in the service's environment settings. See the [Render Blueprint reference](https://render.com/docs/blueprint-spec).

If the final frontend URL is not known yet, use `http://localhost:5173` for `CLIENT_ORIGIN` initially, then replace it with the real Vercel origin after the next step. Save the backend URL Render assigns; the frontend will use that URL plus `/api`.

The Blueprint requests Render's Free plan for this assessment demo. Free services sleep after 15 minutes without incoming traffic, so an initial request can take about a minute to start the service. Check current quotas and account requirements before deploying. See [Render Free service limits](https://render.com/docs/free).

The frontend waits up to 75 seconds for each API request so the backend has time to wake. Keep the page open while its loading indicator is visible. Requests are not retried automatically, including registration and favorite changes. If a catalog request times out, wait briefly and use **Try again**. If registration times out, try logging in before submitting another registration because the server may already have created the account.

## 3. Seed the hosted database

Seeding is an explicit command, separate from application startup. On your local computer, temporarily set `MONGO_URI` in the ignored `server/.env` file to the Atlas URI and allow your current IP in Atlas. From `server/`, run:

```powershell
npm.cmd run db:seed
npm.cmd run db:check
```

Then restore the local URI if you want local development to use the local database again. The seed uses stable template IDs and does not create duplicate samples on repeat runs. Do not run the integration-test suite against your hosted application database.

## 4. Deploy the frontend to Vercel

Import the same repository into Vercel with these project settings:

| Setting              | Value                                                |
| -------------------- | ---------------------------------------------------- |
| Root Directory       | `client`                                             |
| Framework Preset     | Vite                                                 |
| Install Command      | `npm ci`                                             |
| Build Command        | `npm run build`                                      |
| Output Directory     | `dist`                                               |
| Node.js version      | 24.x                                                 |
| Environment variable | `VITE_API_URL=https://your-backend.onrender.com/api` |

Replace the example hostname with your real Render URL. The `/api` suffix is required. `VITE_API_URL` is a public frontend configuration value; never put database credentials or the JWT signing secret in any `VITE_` variable. Vite embeds these values during the build, so redeploy after changing them. See [Vite environment variables](https://vite.dev/guide/env-and-mode).

The included `client/vercel.json` sends page requests to `index.html`, allowing React Router to handle direct visits and refreshes on `/templates` and `/favorites`. See [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

After Vercel assigns the production URL, set the backend's `CLIENT_ORIGIN` to that exact origin and redeploy the backend if needed. Preview deployments have different origins and require separate CORS configuration; the production origin is the intended assessment URL.

## 5. Verify the deployed application

1. Visit the backend's `/health` URL and confirm HTTP 200 with `{"status":"ok","database":"connected"}`.
2. Open the Vercel URL and confirm all template thumbnails load.
3. Register a new account, log out and log in again.
4. Search templates and change the category filter.
5. Save a template, refresh the page and confirm it stays in Favorites.
6. Remove the favorite and confirm it disappears.
7. Refresh `/templates` and `/favorites` directly to verify route handling.
8. Add the real live URL to the repository README only after these checks pass.

## Troubleshooting

| Symptom                                          | Check                                                                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend shows a network error                   | Confirm `VITE_API_URL` ends in `/api`, then rebuild the frontend. On a sleeping free backend, allow up to 75 seconds; after a timeout, wait briefly and retry the catalog manually. |
| Browser reports a CORS error                     | Match `CLIENT_ORIGIN` to the frontend's exact scheme and hostname. It must not include a route.                                            |
| Backend fails to start                           | Check Atlas network access, database-user permissions, `MONGO_URI` and `JWT_SECRET` in the hosting settings.                               |
| Template list is empty                           | Run the seed against the same database URI used by the deployed backend.                                                                   |
| A page refresh returns 404                       | Confirm Vercel's root directory is `client`, where `vercel.json` is stored.                                                                |
| Changed frontend environment value has no effect | Deploy a fresh frontend build; Vite reads the value at build time.                                                                         |
