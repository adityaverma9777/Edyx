<div align="center">
  <img src="edyx-frontend/public/edyx-logo-white.png" alt="Edyx Logo" width="120" />
  <h1>Edyx</h1>
  <h3>Universal AI API Gateway</h3>
  <p>Free, Uncapped, Low-Latency LLM Access for Developers.</p>

  <p>
    <a href="https://edyx.in">
      <img src="https://img.shields.io/badge/Website-edyx.in-blue?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Website" />
    </a>
    <a href="#contributing">
      <img src="https://img.shields.io/badge/Contributions-Welcome-green?style=for-the-badge&logo=github&logoColor=white" alt="Contributions Welcome" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
    </a>
  </p>
</div>

---

## What is Edyx?

**Edyx** is an open-source AI API Gateway that gives developers free, unlimited access to Large Language Models (LLMs). Think of it like a bridge between your application and powerful AI models — but without the usual costs or rate limits.

**In simple terms:**
1. You sign up and get an API key
2. You use that key to send questions/messages to AI models
3. You get smart responses back — for free!

---

## Project Structure

This project has **3 main folders**:

```
edyx/
├── Backend/              # The brain - handles users, keys, and talks to AI
├── edyx-frontend/        # The face - what users see in their browser
└── edyx-gateway/         # The speed layer - makes API calls super fast
```

---

## Backend Folder

The Backend is a **Node.js/Express** server. It handles:
- User login (via email OTP)
- API key creation and management
- Talking to the AI models

### Backend File Structure

```
Backend/
├── src/
│   ├── index.ts          # Starts the server on port 3001
│   ├── app.ts            # Sets up Express routes and middleware
│   │
│   ├── routes/           # API endpoints (what URLs do what)
│   │   ├── auth.ts       # Login system (email + OTP)
│   │   ├── apikeys.ts    # Create, list, delete API keys
│   │   └── chat.ts       # Send messages to AI models
│   │
│   ├── lib/              # Helper functions
│   │   ├── supabase.ts   # Database connection
│   │   ├── otp.ts        # Generate & verify login codes
│   │   ├── mailer.ts     # Send emails via Mailjet
│   │   └── cloudflare-kv.ts # Sync keys to edge cache
│   │
│   └── middleware/
│       └── auth.ts       # Check if user is logged in (JWT)
│
└── package.json          # Dependencies
```

### What Each Backend File Does

| File | What It Does |
| :--- | :--- |
| `index.ts` | Starts the server. Listens on port 3001. |
| `app.ts` | Creates the Express app. Mounts all routes: `/auth`, `/keys`, `/chat`. Also has health check endpoints. |
| `routes/auth.ts` | **Login system.** Two endpoints: `POST /auth/request-otp` (sends 6-digit code to email) and `POST /auth/verify-otp` (checks code, returns JWT token). |
| `routes/apikeys.ts` | **Key management.** `POST /keys` creates a new key. `GET /keys` lists all your keys. `DELETE /keys/:id` deletes a key. Keys are stored in database AND synced to Cloudflare KV for speed. |
| `routes/chat.ts` | **The AI brain.** Receives your message, validates your API key, forwards to the correct AI model (fast/balanced/convo/physics), and returns the response. |
| `lib/supabase.ts` | Creates connection to Supabase (PostgreSQL database). |
| `lib/otp.ts` | Generates random 6-digit codes, hashes them with SHA-256, verifies them. Codes expire in 5 minutes. |
| `lib/mailer.ts` | Sends beautiful HTML emails using Mailjet API. |
| `middleware/auth.ts` | Checks `Authorization: Bearer <token>` header. Decodes JWT. Attaches `user_id` and `email` to request. |

### Backend API Routes Summary

| Method | Endpoint | Auth Required? | What It Does |
| :--- | :--- | :--- | :--- |
| POST | `/auth/request-otp` | No | Send login code to email |
| POST | `/auth/verify-otp` | No | Verify code, get JWT token |
| POST | `/keys` | Yes (JWT) | Create new API key |
| GET | `/keys` | Yes (JWT) | List all your API keys |
| DELETE | `/keys/:id` | Yes (JWT) | Delete an API key |
| POST | `/keys/validate` | No | Internal: Check if API key is valid |
| POST | `/chat` | Yes (API Key) | Send message to AI model |
| POST | `/chat/demo` | No | Demo endpoint for landing page |

---

## edyx-frontend Folder

The Frontend is a **React + Vite** application. It's what users see when they visit edyx.in.

### Frontend File Structure

```
edyx-frontend/
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Router - decides which page to show
│   │
│   ├── pages/            # Full page components
│   │   ├── LandingPage.tsx   # Home page (/)
│   │   ├── LoginPage.tsx     # Login page (/login)
│   │   ├── Dashboard.tsx     # User dashboard (/dashboard)
│   │   ├── Docs.tsx          # Documentation (/docs)
│   │   └── DevelopersPage.tsx # Meet the team (/developers)
│   │
│   ├── components/       # Reusable UI pieces
│   │   ├── Auth/         # Login form, OTP input, animated emoji
│   │   ├── Home/         # Hero section, features, chat demo
│   │   ├── Layout/       # Navbar, footer, page wrapper
│   │   ├── Effects/      # 3D animations, WebGL scenes
│   │   └── Footer/       # Footer component
│   │
│   └── styles/           # CSS files
│
├── public/               # Static files (images, favicon)
└── vite.config.ts        # Build configuration
```

### Frontend Routes

| Path | Page | What Users See |
| :--- | :--- | :--- |
| `/` | LandingPage | Marketing page with features, demo chat, call-to-action |
| `/login` | LoginPage | Email input, OTP verification, animated emoji mascot |
| `/dashboard` | Dashboard | API key management, usage stats, model selection |
| `/docs` | Docs | How to use the API, code examples |
| `/developers` | DevelopersPage | Team bios, contributor information |

### How Login Works (User Flow)

```
1. User visits /login
2. User enters email → clicks "Send Code"
3. Frontend calls POST /auth/request-otp
4. Backend generates 6-digit code, hashes it, stores in database
5. Backend sends email via Mailjet with the code
6. User checks inbox, copies code
7. User enters code in frontend
8. Frontend calls POST /auth/verify-otp
9. Backend checks: is code correct? is it expired?
10. If valid: Backend creates JWT token, sends it back
11. Frontend stores token in localStorage
12. User is redirected to /dashboard
```

---

## edyx-gateway Folder

The Gateway is a **Cloudflare Worker**. It's the secret to making API calls super fast (under 50ms worldwide).

### Gateway File Structure

```
edyx-gateway/
└── edyx-gateway-cf/
    └── silent-union-0f08/
        ├── src/
        │   └── index.ts      # The entire gateway logic
        ├── wrangler.jsonc    # Cloudflare configuration
        └── package.json
```

### What the Gateway Does

The Gateway sits between users and the AI models. When someone makes an API call:

```
1. Request arrives at Cloudflare edge (300+ cities worldwide)
2. Gateway checks API key in Cloudflare KV (super fast, <10ms)
3. If not in KV, falls back to Backend /keys/validate endpoint
4. Gateway checks: is this key allowed for the requested model?
5. Gateway forwards request to the correct Hugging Face model
6. Response is sent back to user
```

### Why Two Places for Keys?

Keys are stored in 2 places:
- **Supabase (PostgreSQL)** - The "source of truth". Always accurate.
- **Cloudflare KV** - Edge cache. Distributed globally. Super fast reads.

When you create a key, it's saved to Supabase first, then pushed to Cloudflare KV. This way, API calls are validated at the edge (fast!) but new keys might take a few seconds to propagate.

---

## The 4 AI Models

Edyx provides access to **4 different AI models**, each optimized for different use cases:

| Model | Endpoint | Best For |
| :--- | :--- | :--- |
| **fast** | `edyxapi-edyx-qwen-fast.hf.space` | Quick responses, real-time chat, simple questions |
| **balanced** | `edyxapi-edyx-llama-balanced.hf.space` | General purpose, good balance of speed and quality |
| **convo** | `edyxapi-convo-model.hf.space` | Long conversations, maintaining context |
| **physics** | `edyxapi-edyx-phy.hf.space` | Physics questions, scientific queries (RAG-based) |

### Physics Model - Special Notes

The **physics** model is different! It's a RAG (Retrieval Augmented Generation) system:
- Uses `/v1/query` endpoint instead of `/v1/chat`
- Accepts `question`, `top_k`, and `max_tokens` parameters
- Returns `answer` plus `sources_used` count
- Great for physics homework, scientific explanations

---

## Database Schema

The app uses **Supabase** (PostgreSQL) with these main tables:

### Users Table
```
users
├── id (uuid, primary key)
├── email (text, unique)
└── created_at (timestamp)
```

### API Keys Table
```
api_keys
├── id (uuid, primary key)
├── user_id (uuid, foreign key → users.id)
├── api_key (text) - starts with "edyx_live_"
├── name (text) - user-friendly name
├── model (text) - "fast", "balanced", "convo", or "physics"
├── total_requests (integer)
├── total_tokens (integer)
└── created_at (timestamp)
```

### OTP Codes Table
```
otp_codes
├── email (text, primary key)
├── otp_hash (text) - SHA-256 hash of the code
└── expires_at (integer) - Unix timestamp
```

---

## How to Use the API

### Step 1: Get an API Key
1. Go to [edyx.in](https://edyx.in)
2. Click "Get Started" → Enter email → Enter OTP
3. In Dashboard, click "Create Key"
4. Choose a model (fast/balanced/convo/physics)
5. Copy your key (starts with `edyx_live_`)

### Step 2: Make API Calls

**Python Example:**
```python
import requests

response = requests.post(
    "https://edyx-backend.onrender.com/chat",
    headers={
        "Authorization": "Bearer edyx_live_your_key_here",
        "Content-Type": "application/json"
    },
    json={
        "model": "fast",
        "messages": [
            {"role": "user", "content": "What is quantum computing?"}
        ]
    }
)

print(response.json()["choices"][0]["message"]["content"])
```

**Physics Model Example:**
```python
response = requests.post(
    "https://edyx-backend.onrender.com/chat",
    headers={
        "Authorization": "Bearer edyx_live_your_physics_key",
        "Content-Type": "application/json"
    },
    json={
        "model": "physics",
        "messages": [
            {"role": "user", "content": "Explain Newton's third law"}
        ],
        "top_k": 5,
        "max_tokens": 512
    }
)

data = response.json()
print(data["choices"][0]["message"]["content"])
print(f"Sources used: {data['sources_used']}")
```

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TypeScript | User interface |
| **Frontend 3D** | Three.js, React Three Fiber | Cool animations |
| **Frontend Styling** | CSS, Framer Motion | Beautiful UI |
| **Backend** | Node.js, Express, TypeScript | API server |
| **Database** | Supabase (PostgreSQL) | Store users, keys |
| **Email** | Mailjet | Send OTP codes |
| **Edge Gateway** | Cloudflare Workers | Fast global proxy |
| **Edge Cache** | Cloudflare KV | Store keys at edge |
| **AI Models** | Hugging Face Spaces | LLM inference |

---

## Environment Variables

### Backend (.env)
```
PORT=3001
JWT_SECRET=your_secret_key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
MJ_APIKEY_PUBLIC=xxx
MJ_APIKEY_PRIVATE=xxx
MJ_SENDER_EMAIL=noreply@edyx.in
CF_ACCOUNT_ID=xxx
CF_KV_NAMESPACE_ID=xxx
CF_API_TOKEN=xxx
EDYX_ACCESS_TOKEN=xxx
```

---

## Complete Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER'S APP                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ POST /chat
                                │ Authorization: Bearer edyx_live_xxx
                                │ Body: { model: "fast", messages: [...] }
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE GATEWAY                          │
│  (Closest data center to user - 300+ locations worldwide)           │
│                                                                     │
│  1. Check API key format (must start with "edyx_live_")             │
│  2. Look up key in Cloudflare KV cache                              │
│  3. If not in KV, call Backend /keys/validate                       │
│  4. Verify: key's model == requested model                          │
│  5. Forward to Hugging Face                                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      HUGGING FACE SPACES                            │
│                                                                     │
│  fast     → edyxapi-edyx-qwen-fast.hf.space/v1/chat                 │
│  balanced → edyxapi-edyx-llama-balanced.hf.space/v1/chat            │
│  convo    → edyxapi-convo-model.hf.space/v1/chat                    │
│  physics  → edyxapi-edyx-phy.hf.space/v1/query                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ AI Response
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           USER'S APP                                │
│           { choices: [{ message: { content: "..." } }] }            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Created By

| <div align="center"><img src="edyx-frontend/public/assets/manika.webp" width="100" /><br/><b>Manika Kutiyal</b></div> | <div align="center"><img src="edyx-frontend/public/assets/aditya.png" width="100" /><br/><b>Aditya Verma</b></div> |
| :--- | :--- |
| **Product Strategist & UX Architect** | **Software Architect & Lead Developer** |
| Drives product vision, user flows, and design decisions. | Implements the full-stack infrastructure. |

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

<div align="center">
  <p>Built with ❤️ for the developer community.</p>
  <p><a href="https://edyx.in">edyx.in</a></p>
</div>
