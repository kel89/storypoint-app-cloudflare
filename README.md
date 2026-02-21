# Storypointer

Real-time collaborative story point voting tool, deployed on Cloudflare Workers + Durable Objects.

Users create or join rooms via shareable links (`/room/a8f3b2`), pick a role, and vote on story points together in real time. Features include live vote tracking, results visualization, emoji reactions, user callouts, and presentation mode.

## Architecture

```
Browser <--WebSocket--> Cloudflare Worker --> Durable Object (one per room)
                         |
                    Static assets (React SPA served by Workers)
```

- **Worker** (`src/index.ts`) — Routes requests to the correct Durable Object based on room ID
- **Durable Object** (`src/voting-room.ts`) — Manages all room state and WebSocket connections using the Hibernation API
- **Frontend** (`front-end/`) — React + TypeScript + Vite + Tailwind SPA communicating over native WebSocket

Each room is a separate Durable Object instance. Room state (users, votes, results visibility) lives in WebSocket attachments and Durable Object storage, surviving hibernation and reconnects.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is sufficient)

## Setup

### 1. Install dependencies

```bash
npm install
cd front-end && npm install && cd ..
```

### 2. Authenticate with Cloudflare (one-time)

```bash
npx wrangler login
```

This opens your browser for OAuth. Credentials are stored locally at `~/.wrangler/`. No API keys to manage.

### 3. Verify it works

```bash
npx wrangler whoami
```

Should show your Cloudflare account name and ID.

## Local Development

Run the worker and frontend dev server together:

```bash
npm run dev
```

Or run them separately in two terminals:

```bash
# Terminal 1: Cloudflare Worker (port 8787)
npm run dev:worker

# Terminal 2: Vite dev server (port 5173, proxies /api/* to worker)
npm run dev:frontend
```

Open http://localhost:5173, create a room, and open the link in multiple tabs to test.

**Note:** If Durable Objects behave unexpectedly in local mode, try `npx wrangler dev --remote` which runs the DO on Cloudflare's infrastructure while still developing locally.

## Deploy to Cloudflare

```bash
npm run deploy
```

This builds the frontend and deploys everything (worker + assets + Durable Object) in one command. No dashboard configuration needed — wrangler handles creating the DO namespace, uploading assets, and binding everything together.

Your app will be available at:

```
https://storypointer.<your-subdomain>.workers.dev
```

Your subdomain is assigned when you first create your Cloudflare Workers account. You can find it at **Workers & Pages > Overview** in the Cloudflare dashboard.

## Cloudflare Configuration

### What's automatic (no action needed)

- Durable Object namespace creation and binding
- Static asset uploading and serving
- SPA fallback routing (all unmatched paths serve `index.html`)
- SSL/TLS certificates
- DO migrations (defined in `wrangler.toml`)

### What you might want to configure manually

#### Custom Domain (optional)

1. Add your domain to Cloudflare (Dashboard > Websites > Add a site)
2. Update your domain's nameservers to the ones Cloudflare provides
3. Go to **Workers & Pages > storypointer > Settings > Domains & Routes**
4. Click **Add** > **Custom Domain** and enter your domain (e.g., `storypointer.yourdomain.com`)

Alternatively, set it in `wrangler.toml`:

```toml
routes = [
  { pattern = "storypointer.yourdomain.com", custom_domain = true }
]
```

#### GitHub Actions CI/CD (optional)

To auto-deploy on push to main:

1. In the Cloudflare dashboard, go to **My Profile > API Tokens > Create Token**
2. Use the **Edit Cloudflare Workers** template
3. Add the token as a GitHub secret named `CLOUDFLARE_API_TOKEN`
4. Also add your account ID as `CLOUDFLARE_ACCOUNT_ID` (found on the Workers overview page)
5. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: cd front-end && npm install
      - run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## Project Structure

```
storypoint-app-cloudflare/
├── wrangler.toml                 # Cloudflare config (DO bindings, asset serving)
├── package.json                  # Root: wrangler, concurrently, workers-types
├── tsconfig.json                 # Worker TypeScript config
├── src/
│   ├── index.ts                  # Worker entry point (routes requests)
│   └── voting-room.ts            # Durable Object class (all room logic)
└── front-end/
    ├── package.json              # React app dependencies
    ├── vite.config.ts            # Dev proxy to wrangler on port 8787
    ├── index.html
    ├── public/                   # Favicons, manifest
    └── src/
        ├── main.tsx              # React Router (/ = lobby, /room/:id = app)
        ├── App.tsx               # Room WebSocket lifecycle + callback props
        ├── websocket.ts          # Native WebSocket wrapper with auto-reconnect
        ├── types/
        │   ├── Messages.ts       # Client/server message protocol types
        │   ├── User.ts           # User type
        │   └── Role.ts           # Role enum
        ├── components/
        │   ├── RoomLobby.tsx     # Create/join room landing page
        │   ├── Connect.tsx       # Username + role form
        │   ├── VotingView.tsx    # Main voting interface
        │   ├── ResultsView.tsx   # Results display with pie chart
        │   ├── PointSelector.tsx # Point voting buttons
        │   ├── UserList.tsx      # Connected users list
        │   ├── ReactionMenu.tsx  # Emoji reaction buttons
        │   ├── ResultsGraph.tsx  # Recharts pie chart
        │   └── RoleFilter.tsx    # Role filter toggles
        ├── context/UserContex.ts # Username context
        ├── helpers/              # DOM animation helpers
        └── assets/               # SVGs, audio
```

## WebSocket Message Protocol

All communication uses JSON messages over native WebSocket.

### Client to Server

| Message | Description |
|---|---|
| `{ type: "join", username, role }` | Join room with name and role |
| `{ type: "vote", points }` | Submit or change vote (0 = clear) |
| `{ type: "showResults" }` | Reveal all votes |
| `{ type: "clearPoints" }` | Reset all votes |
| `{ type: "hidePoints" }` | Hide results |
| `{ type: "reaction", reaction, sentBy }` | Send emoji reaction |
| `{ type: "callOutUser", sid }` | Call out a user |
| `{ type: "startTimer", time }` | Start countdown timer |
| `{ type: "stopTimer" }` | Stop timer |

### Server to Client

| Message | Description |
|---|---|
| `{ type: "state", users, showResults }` | Full room state (broadcast after any change) |
| `{ type: "joined", sid }` | Your assigned session ID (sent only to you) |
| `{ type: "reaction", reaction, sender }` | Emoji reaction broadcast |
| `{ type: "callout", sid }` | User callout broadcast |
| `{ type: "startTimer", time }` | Timer start broadcast |
| `{ type: "stopTimer" }` | Timer stop broadcast |
| `{ type: "clear" }` | Room cleared broadcast |

## Free Tier Limits

This app runs entirely on Cloudflare's free plan:

| Resource | Free Limit |
|---|---|
| Worker requests | 100,000/day |
| Durable Object requests | 100,000/day |
| Durable Object storage | 5 GB |
| Storage read/write charges | None on free plan |
| Asset bandwidth | Unlimited |

For a story pointing tool, this is effectively unlimited.

## Troubleshooting

**`wrangler dev` fails with Durable Object errors:**
Try `npx wrangler dev --remote` to run DOs on Cloudflare's infrastructure instead of locally.

**WebSocket connection fails in dev:**
Make sure both the worker (port 8787) and Vite dev server (port 5173) are running. The Vite proxy in `vite.config.ts` forwards `/api/*` requests (including WebSocket upgrades) to the worker.

**Deploy fails with auth errors:**
Run `npx wrangler login` again. Tokens can expire.

**Changes to Durable Object class aren't taking effect:**
If you rename or restructure the DO class, you may need to add a new migration entry in `wrangler.toml`. See [Cloudflare DO migrations docs](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/).
