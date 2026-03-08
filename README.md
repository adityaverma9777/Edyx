<div align="center">
  <img src="edyx-frontend/public/edyx-logo-white.png" alt="Edyx Logo" width="120" />
  <h1>Edyx</h1>
  <h3>Universal AI API Gateway</h3>
  <p><b>Free, Uncapped, Low-Latency LLM Access for Developers.</b></p>

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

# What is Edyx?
Edyx is a specialized API Gateway designed to remove the barriers between developers and Large Language Models. <br> If you've ever wanted to integrate AI into your project but were stopped by expensive tokens, complex setup, or credit card requirements, <br> Here This **Edyx** is built for you.

## How it solves your problems:
* **The "One-Key" Solution:** Instead of managing multiple accounts for different AI providers, Edyx provides a central hub to access diverse models.

* **Student-Friendly:** Completely free and uncapped access, allowing you to build, test, and break things without worrying about a bill.

* **Instant Integration:** Optimized for speed (sub-50ms latency) so your applications feel snappy and professional.

## How it Works (The User Journey)
**Edyx** simplifies the complex world of AI infrastructure into a straightforward 3-step workflow:

* **Identity:** Securely log in via Email OTP—no passwords to remember, no credit cards required.

* **Provision:** Choose one of our 4 specialized AI models (Fast, Balanced, Convo, or Physics), give your project a name, and generate your unique edyx_live_ API key.

* **Deploy:** Drop the key into your code. Edyx handles the routing and authentication at the "Edge" (closest to you), ensuring your AI responses are delivered instantly.

> Once you have generated your API key, use the _**Code Examples**_ given below to integrate it into your local environment or terminal. For more advanced implementation details, please refer to the _**Documentation**_ tab on our website.

---

### Code Example 
<details>
<summary>(For Python)</summary>
  
```python
import requests

url = "[https://www.edyx.in/api/chat](https://www.edyx.in/api/chat)"
headers = {"Authorization": "Bearer YOUR_API_KEY"} # replace "YOUR_API_KEY" with your unique API Key.
data = {
    "model": "fast",
    "messages": [{"role": "user", "content": "Hello Edyx!"}]
}

print(requests.post(url, headers=headers, json=data).json())
```
</details>

<details>
  <summary>(For CURL)</summary>
  
  ```CURL
  curl -X POST https://edyx-backend.onrender.com/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \  # replace "YOUR_API_KEY" with your unique API Key.
  -H "Content-Type: application/json" \
  -d '{
    "model": "fast",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello world!"}
    ],
    "max_tokens": 512,
    "temperature": 0.7
  }'
  ```
</details>

<details>
  <summary>(For POWERSHELL)</summary>
  
  ```POWERSHELL
  $apiKey = "YOUR_API_KEY" # replace "YOUR_API_KEY" with your unique API Key.
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

$body = @{
    model       = "fast"
    messages    = @(
        @{ role = "system"; content = "You are a helpful assistant." },
        @{ role = "user"; content = "Hello world!" }
    )
    max_tokens  = 512
    temperature = 0.7
} | ConvertTo-Json -Depth 4

$response = Invoke-RestMethod -Uri "https://edyx-backend.onrender.com/chat" -Method Post -Headers $headers -Body $body
Write-Output $response.text
  ```
</details>

<details>
  <summary>(For Node.js)</summary>
  
  ```Node.js
const fetch = require('node-fetch');
const apiKey = "YOUR_API_KEY"; /*replace "YOUR_API_KEY" with your unique API Key.*/

async function chat() {
  const response = await fetch("https://edyx-backend.onrender.com/chat", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "fast",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello world!" }
      ],
      max_tokens: 1024,
      temperature: 0.7
    })
  });

  const data = await response.json();
  console.log(data);
}

chat();
  ```
</details>

<details>
  <summary>(Customizing Personas)</summary>
  <summary>You can completely change how the AI behaves by setting a system message at the start of your conversation. <br> This is the "Persona File" concept.</summary>
  
  ```
Example: Creating a Math Tutor
{
  "model": "fast",
  "messages": [
    { 
      "role": "system", 
      "content": "You are a helpful math tutor. You only answer in rhymes." 
    },
    { 
      "role": "user", 
      "content": "What is the square root of 144?" 
    }
  ]
}
  ```
</details>


## Available Models

| Model | Capability | Best For |
| --- | --- | --- |
| **fast** | High Speed | Real-time chat, simple queries |
| **balanced** | Quality + Speed | General purpose, coding tasks |
| **convo** | Long Context | Extended dialogues, deep threads |
| **physics** | Scientific RAG | Academic queries, physics homework |


## Created By

| <div align="center"><img src="edyx-frontend/public/assets/manika.webp" width="100" /><br/><b>Manika Kutiyal</b></div> | <div align="center"><img src="edyx-frontend/public/assets/aditya.png" width="100" /><br/><b>Aditya Verma</b></div> |
| :--- | :--- |
| **Product Strategist & UX Architect** | **Software Architect & Lead Developer** |
| Drives product vision, user flows, and design decisions. | Implements the full-stack infrastructure. |


<div align="center">
<p>Built with ❤️ for the developer community.</p>
<p><a href="https://edyx.in">edyx.in</a></p>
</div>