interface Env {
  API_KEYS: KVNamespace;
}

interface ApiKeyData {
  model: string;
  user_id: string;
  name: string;
}

interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
}

const MODEL_ENDPOINTS: Record<string, string> = {
  convo: "https://edyxapi-convo-model.hf.space/v1/chat",
  balanced: "https://edyxapi-edyx-llama-balanced.hf.space/v1/chat",
  fast: "https://edyxapi-edyx-qwen-fast.hf.space/v1/chat",
  physics: "https://edyxapi-edyx-phy.hf.space/v1/chat",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ status: "error", message }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function jsonSuccess(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }


    if (request.method !== "POST") {
      return jsonError(405, "Method Not Allowed");
    }

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return jsonSuccess({ status: "ok", service: "edyx-gateway" });
    }

    if (url.pathname !== "/chat") {
      return jsonError(404, "Not Found");
    }


    const auth = request.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return jsonError(401, "Missing API key");
    }

    const apiKey = auth.slice(7);
    if (!apiKey.startsWith("edyx_live_")) {
      return jsonError(401, "Invalid API key format");
    }


    let body: ChatRequest;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "Invalid JSON body");
    }

    const requestedModel = body.model;
    if (!requestedModel) {
      return jsonError(400, "Missing model in request body");
    }


    let keyData: ApiKeyData | null = null;
    const keyDataRaw = await env.API_KEYS.get(apiKey);

    if (keyDataRaw) {
      try {
        keyData = JSON.parse(keyDataRaw);
      } catch {
        console.error("Corrupted KV data for key");
      }
    }

    if (!keyData) {
      const BACKEND_URL = "https://edyx-backend.onrender.com";
      try {
        const validateResp = await fetch(`${BACKEND_URL}/keys/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: apiKey }),
        });

        if (validateResp.ok) {
          const validation = (await validateResp.json()) as any;
          if (validation.valid) {
            keyData = {
              model: validation.model,
              user_id: validation.user_id,
              name: "Remote Key",
            };
          }
        }
      } catch (err) {
        console.error("Backend validation failed:", err);
      }
    }

    if (!keyData) {
      return jsonError(403, "Invalid API key");
    }

    const { model, user_id } = keyData;


    if (model !== requestedModel) {
      return jsonError(
        403,
        `API key not authorized for model '${requestedModel}'. Key is for '${model}'`
      );
    }


    const target = MODEL_ENDPOINTS[requestedModel];
    if (!target) {
      return jsonError(400, `Invalid model: ${requestedModel}`);
    }


    try {
      const hfResp = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: body.messages }),
      });

      const responseBody = await hfResp.text();

      return new Response(responseBody, {
        status: hfResp.status,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    } catch (err) {
      return jsonError(502, `Failed to reach model endpoint: ${err}`);
    }
  },
};
