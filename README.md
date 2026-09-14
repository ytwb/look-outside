# Outside

Outside is a small focus-break timer that helps you rest your eyes and move during long periods at a desk.

The app runs two independent reminder cycles:

- An eye-rest reminder every 20 minutes, followed by a 20-second rest.
- A movement reminder every 30 minutes, with a rotating stretch or mobility suggestion.

It is available in English, Traditional Chinese, and Simplified Chinese. The interface also includes light and dark modes, pause/resume controls, reset, and browser notifications.

Live site: [ytwb.github.io/look-outside](https://ytwb.github.io/look-outside)

## Requirements

- Node.js 24 or newer for the Docker image and local development
- npm
- A modern browser

## Run Locally

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173/look-outside/` in your browser.

The development server supports hot module replacement. Browser notifications are requested the first time you start the timers. Notification support and permission behavior depend on the browser and its site settings.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local React Router development server. |
| `npm run typecheck` | Generate route types and run the TypeScript compiler. |
| `npm run build` | Create the production client and server build. |
| `npm run start` | Serve the existing production build. |
| `npm run deploy` | Build and publish `build/client` to GitHub Pages. |

## Production Build

Build the application:

```bash
npm run build
```

The build output is written to:

```text
build/client/  Static client assets
build/server/  Production server bundle
```

To serve the production build locally:

```bash
npm run start
```

The app is configured with the `/look-outside/` base path for GitHub Pages hosting.

## Docker

Build the production image:

```bash
docker build -t outside-timer .
```

Run the container:

```bash
docker run --rm -p 3000:3000 outside-timer
```

Open `http://localhost:3000/look-outside/` in your browser. The container uses the production React Router server and Node.js 24 Alpine.

## How It Works

1. Select a language and choose light or dark mode.
2. Select **Start focus timer** and grant notification permission when prompted.
3. After 20 minutes, start the 20-second eye rest from the page or from the browser notification.
4. After 30 minutes, follow the displayed movement reminder.
5. Use **Pause timers** to pause all countdowns, **Resume timers** to continue, or **Reset** to restore both cycles to their initial durations.

If a browser does not support notifications, or notifications are blocked, the on-page timers still work.

## Technology

- React 19
- React Router 8 in Framework Mode
- TypeScript
- Vite
- Tailwind CSS
- GitHub Pages deployment through `gh-pages`

## Project Structure

```text
app/
	app.css              Global styles
	root.tsx             Application shell and document metadata
	routes.ts            Route configuration
	routes/home.tsx      Timer UI and timer behavior
Dockerfile             Multi-stage production image
react-router.config.ts React Router configuration
```
