import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

const MODEL_ENDPOINTS: Record<string, string> = {
    convo: "https://edyxapi-convo-model.hf.space/v1/chat",
    balanced: "https://edyxapi-edyx-llama-balanced.hf.space/v1/chat",
    fast: "https://edyxapi-edyx-qwen-fast.hf.space/v1/chat",
};

// Protected Chat Endpoint (Uses API Key)
router.post("/", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Missing API Key" });
            return;
        }

        const apiKey = authHeader.split(" ")[1];
        const { model, messages } = req.body;

        if (!model || !messages) {
            res.status(400).json({ error: "Missing model or messages" });
            return;
        }

        // 1. Validate API Key & Get User
        // OPTIMIZATION: Ideally use Redis/Cloudflare KV here for speed. 
        // For now, checking DB directly as requested for "real metrics".
        const { data: keyData, error: keyError } = await supabase
            .from("api_keys")
            .select("id, model, user_id")
            .eq("api_key", apiKey)
            .single();

        if (keyError || !keyData) {
            res.status(401).json({ error: "Invalid API Key" });
            return;
        }

        if (keyData.model !== model) {
            res.status(403).json({ error: `Key is for ${keyData.model}, but you requested ${model}` });
            return;
        }

        // 2. Proxy to Inference Engine
        const targetUrl = MODEL_ENDPOINTS[model];
        if (!targetUrl) {
            res.status(400).json({ error: "Invalid model configuration" });
            return;
        }

        const start = Date.now();
        const hfResponse = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }),
        });

        if (!hfResponse.ok) {
            const err = await hfResponse.text();
            console.error("Model Error:", err);
            res.status(hfResponse.status).json({ error: "Model Service Error" });
            return;
        }

        const data = await hfResponse.json();

        // 3. Track Usage (Async to not block response)
        // Estimate tokens (approx 4 chars = 1 token)
        const inputTokens = JSON.stringify(messages).length / 4;
        const outputTokens = JSON.stringify(data).length / 4; // Rudimentary estimation
        const totalTokens = Math.ceil(inputTokens + outputTokens);

        // RPC call to increment usage atomically
        supabase.rpc('increment_usage', {
            key_id: keyData.id,
            tokens: totalTokens
        }).then(({ error }) => {
            if (error) console.error("Failed to track usage:", error);
        });

        res.json(data);

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Public Demo Route (Rate limited typically, but keeping for frontend demo)
router.post("/demo", async (req: Request, res: Response) => {
    try {
        const { model, messages } = req.body;
        // ... (rest of demo route)

        if (!model || !messages || !Array.isArray(messages)) {
            res.status(400).json({ error: "Invalid request body" });
            return;
        }

        const targetUrl = MODEL_ENDPOINTS[model];
        if (!targetUrl) {
            res.status(400).json({ error: "Invalid model selected" });
            return;
        }


        const hfResponse = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages
            }),
        });

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error("HF Error:", errorText);
            res.status(hfResponse.status).json({ error: "Model service error" });
            return;
        }

        const data = await hfResponse.json();
        res.json(data);

    } catch (error) {
        console.error("Chat Demo Proxy Error:", error);
        res.status(502).json({ error: "Failed to connect to model service" });
    }
});

export default router;
