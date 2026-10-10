# Understand and demonstrate Forma

Forma is a template discovery catalog. A visitor can browse six design concepts; a registered user can keep a private collection of favorites. The SVG thumbnails are design illustrations. The application demonstrates authentication, API integration and database persistence.

## Trace the main flows

### 1. Register and sign in

Start with [`AuthForm.jsx`](../client/src/components/AuthForm.jsx). The form checks input and calls the authentication function from [`AuthContext.jsx`](../client/src/context/AuthContext.jsx). The context calls the matching function in [`authService.js`](../client/src/services/authService.js).

On the backend, [`authRoutes.js`](../server/routes/authRoutes.js) connects the URL to the controller. [`authService.js`](../server/services/authService.js) validates the request, normalizes the email and hashes a registration password with bcrypt. Login compares the submitted password with the stored hash. The response contains a public user object and a signed JWT that expires after seven days.

The client stores that token under `forma.accessToken` in `localStorage`, as the assessment requires. [`api.js`](../client/src/services/api.js) adds it to later requests as a bearer token. After a refresh, the context calls `/api/auth/me` to restore the user's session. Logout removes the token and clears the in-memory user and favorite state.

### 2. Browse templates

[`Templates.jsx`](../client/src/pages/Templates.jsx) fetches `/api/templates`, displays loading or error feedback and renders a `TemplateCard` for each result. Search and category controls filter the loaded catalog in the browser and keep filter values in the page URL. The API separately supports `search` and `category` query parameters.

Selecting a card opens `/templates/:id`. [`TemplateDetails.jsx`](../client/src/pages/TemplateDetails.jsx) calls the detail endpoint and displays the selected preview. The backend serves images from `server/public/previews/`; the frontend resolves their origin correctly for local development or a separate hosted API.

### 3. Save a favorite

The favorite button asks the shared context to add or remove a template. [`favoriteService.js`](../client/src/services/favoriteService.js) sends `POST` or `DELETE` to `/api/favorites/:templateId`.

[`authMiddleware.js`](../server/middleware/authMiddleware.js) verifies the JWT and loads the user. [`favoriteController.js`](../server/controllers/favoriteController.js) uses that verified user's ID in the database query. It does not accept a user ID from the browser. Each Favorite references one User and one Template, with a unique index on that pair to prevent duplicates.

After a successful response, the context updates the visible saved state. `/api/favorites` reads the stored collection, which explains why favorites survive a refresh or a later login. [`ProtectedRoute.jsx`](../client/src/components/ProtectedRoute.jsx) redirects signed-out visitors to login; server middleware still protects the API independently.

## A four-minute demo

1. Open the catalog and show the six cards. Search for “dashboard”, switch categories and clear the filters.
2. Open a template's details and its full-size preview. Explain that these are sample design previews.
3. Create an account with your own demo credentials. Show the save indicator when adding a favorite.
4. Open Favorites, refresh and confirm the saved item remains.
5. Log out, visit `/favorites` and show the login redirect. Sign back in and show the same saved item.
6. Remove the favorite and show the empty state. Finish by opening the source folders and explaining one request from React to MongoDB.

Before demonstrating, run the commands in the README and check their actual output. Keep passwords and signing secrets out of screen recordings. Only describe checks as passing after you have seen them pass.

## Learn the implementation before the interview

Read one flow end to end, then reproduce it with the browser's Network panel open. Identify the request method, URL, status and JSON response. Next, make a small change, such as adding a category to a sample template, and predict what the interface will do before trying it.

Be ready to explain these decisions in your own words:

- **Hashing and JWT signing solve different problems.** Bcrypt verifies a password without storing it directly; the JWT lets the API verify a session.
- **Client route guards are not the security boundary.** Requests can bypass React, so the backend verifies private requests itself.
- **Favorite ownership comes from the verified user.** This prevents one user from selecting another user's collection through request data.
- **Unique indexes handle competing writes.** A duplicate check alone cannot prevent two simultaneous saves or registrations.
- **The seed is repeatable.** Fixed template IDs avoid duplicate records, and the seed preserves existing edits.
- **There are deliberate limits.** This version stores JWTs in `localStorage`, has no token revocation list and uses a small catalog without pagination. Explain how you would revisit those choices for a production service.

Describe the tools or assistance used during development accurately, and distinguish the code you have reviewed and understood from parts you are still learning. A clear explanation of the working flows and tradeoffs is more useful than memorizing the README.
