# VoiceBrief Frontend

React dashboard for VoiceBrief — daily voice briefings, task inbox, and settings. Wired to the VoiceBrief API (auth, briefings, tasks, settings, integrations).

## Running with the API

From the **repo root**:

1. **Backend** (Postgres + Redis required, e.g. `docker-compose up -d`):
   ```sh
   npm run dev
   ```
2. **Frontend** (in another terminal):
   ```sh
   npm run frontend:dev
   ```
   Opens at http://localhost:8080. API requests are proxied to http://localhost:3000.

**Demo login:** Click “Try demo” on the landing page or go to Dashboard; the app uses `GET /api/auth/demo-token` and stores the JWT.

## Build

```sh
cd frontend && npm install && npm run build
```
Output: `frontend/dist`. In production the backend can serve this folder (see root `src/index.ts`).

---

## Project info (Lovable)

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
