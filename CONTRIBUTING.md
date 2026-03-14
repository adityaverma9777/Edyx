<div align="center"> <h1>CONTRIBUTING TO EDYX</h1></div>
  
First off, thank you for considering contributing to Edyx! It is BEST for community members like you who make open-source such a powerful tool for learning and building.

Whether you are a seasoned engineer or a student making your first-ever Pull Request (PR), this guide will help you get started.

## Quick Start: Local Development

Follow these steps to get a local copy of Edyx running on your machine.

### 1. Prerequisites

Ensure you have the following installed:

* **Node.js** (v18 or higher)
* **npm** or **yarn**
* **Git** installed on your system.

### 2. Clone the Repository

```bash
git clone https://github.com/adityaverma9777/Edyx.git
cd Edyx
```

### 3. Setup the Backend (The Brain)

The backend manages users, security, and AI routing.

```bash
cd Backend
npm install
# Create a .env file and add the variables listed in the Environment section below
npm run dev
```

*Your server should now be running on `http://localhost:3001`.*

### 4. Setup the Frontend (The Face)

The frontend is what users interact with.

```bash
cd ../edyx-frontend
npm install
npm run dev
```

*The dashboard should now be accessible at `http://localhost:5173` (default Vite port).*

---

## Technical Architecture

Understanding how the "Three Pillars" of Edyx interact is key to contributing effectively:

| Module | Technology | Responsibility |
| --- | --- | --- |
| **Backend** | Node.js, Express | Handles OTP, API key generation, and Supabase logic. |
| **Frontend** | React, Vite, Three.js | The User Interface, Dashboard, and 3D animations. |
| **Gateway** | Cloudflare Workers | The high-speed proxy that validates keys and calls the AI. |

### Deep Dive: File Structure

<details>
<summary><b>Click to expand Backend & Frontend Details</b></summary>

#### Backend Logic (`/Backend/src`)

* `routes/`: Where the API endpoints live (e.g., `/auth`, `/chat`).
* `lib/`: Utility functions for Supabase, Mailjet, and Cloudflare KV.
* `middleware/`: Security checks like JWT validation.

#### Frontend Logic (`/edyx-frontend/src`)

* `pages/`: The full views (Landing, Dashboard, Docs).
* `components/`: Reusable UI elements (Buttons, Layouts, 3D Effects).
</details>


## Database & Environment

### Database Schema (Supabase)

Edyx uses PostgreSQL. If you are adding features, you may need to interact with these tables:

* **`users`**: Records of registered developers.
* **`api_keys`**: Links keys to specific users and their chosen AI models.
* **`otp_codes`**: Temporary hashes for secure email login.

### Environment Variables (`.env`)

You will need to create a `.env` file in the `/Backend` folder with these keys:

```text
JWT_SECRET=your_secret        # Secret for user sessions
SUPABASE_URL=your_url         # Connection to your Supabase project
MJ_APIKEY_PUBLIC=your_key     # Mailjet public key
CF_KV_NAMESPACE_ID=your_id    # Cloudflare KV ID
```

## The Request Flow (Logic Map)

1. **User Request:** Hits the **Cloudflare Gateway**.
2. **Validation:** The Gateway checks the API Key against **Cloudflare KV** (Speed Layer).
3. **Inference:** Once validated, the request is proxied to **Hugging Face Spaces** (The AI).
4. **Response:** The user receives the AI's output in milliseconds.


## 🤝 How to Contribute (For Newcomers)

If this is your first time contributing to open source, follow this "Golden Path":

1. **Find an Issue:** Look at the <kbd>[Issues tab]</kbd>. If you find a bug or have an idea, open a new issue first to discuss it.
2. **Fork the Project:** Click the "Fork" button at the top right of the repo. This creates your own copy of the code.
3. **Create a Branch:** Work on a specific branch, not `main`.
* `git checkout -b feat/your-feature-name`


4. **Commit with Meaning:** Use clear messages.
* *Bad:* `git commit -m "fixed stuff"`
* *Good:* `git commit -m "docs: add python example to readme"`


5. **Submit a Pull Request (PR):** Go back to the original Edyx repo and click "New Pull Request." Describe what you changed! <br>


<div align="center">
  <p><b>Questions?</b> Reach out to the Project Leads via 
    <a href="https://www.linkedin.com/in/adityaverma9777/"><kbd>LinkedIn</kbd></a>.
  </p>
  <p>Happy Coding! 🚀</p>
    <a href="https://github.com/adityaverma9777/Edyx/blob/master/README.md"><kbd>GO BACK TO README.md</kbd></a>
</div>
