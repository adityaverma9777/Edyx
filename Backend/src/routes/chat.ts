import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

const MODEL_ENDPOINTS: Record<string, string> = {
    convo: "https://edyxapi-convo-model.hf.space/v1/chat",
    balanced: "https://edyxapi-edyx-llama-balanced.hf.space/v1/chat",
    fast: "https://edyxapi-edyx-qwen-fast.hf.space/v1/chat",
    physics: "https://edyxapi-edyx-phy.hf.space/v1/query",
};

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


        const targetUrl = MODEL_ENDPOINTS[model];
        if (!targetUrl) {
            res.status(400).json({ error: "Invalid model configuration" });
            return;
        }

        const start = Date.now();
        let hfResponse;

        if (model === "physics") {
            const userMessage = messages.find((m: any) => m.role === "user");
            const question = userMessage?.content || "";

            hfResponse = await fetch(targetUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Edyx-Token": process.env.EDYX_ACCESS_TOKEN || "edyx-secret-key-v1"
                },
                body: JSON.stringify({
                    question,
                    top_k: req.body.top_k || 5,
                    max_tokens: req.body.max_tokens || 512
                }),
            });
        } else {
            hfResponse = await fetch(targetUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Edyx-Token": process.env.EDYX_ACCESS_TOKEN || "edyx-secret-key-v1"
                },
                body: JSON.stringify({
                    messages,
                    max_tokens: req.body.max_tokens || 4096,
                    temperature: req.body.temperature || 0.7
                }),
            });
        }

        if (!hfResponse.ok) {
            const err = await hfResponse.text();
            console.error("Model Error:", err);
            res.status(hfResponse.status).json({ error: "Model Service Error" });
            return;
        }

        const data = await hfResponse.json();

        const inputTokens = JSON.stringify(messages).length / 4;
        const outputTokens = JSON.stringify(data).length / 4;
        const totalTokens = Math.ceil(inputTokens + outputTokens);

        supabase.rpc('increment_usage', {
            key_id: keyData.id,
            tokens: totalTokens
        }).then(({ error }) => {
            if (error) console.error("Failed to track usage:", error);
        });

        if (model === "physics") {
            res.json({
                choices: [{
                    message: {
                        role: "assistant",
                        content: data.answer || data.text || JSON.stringify(data)
                    }
                }],
                sources_used: data.sources_used || 0
            });
        } else {
            res.json(data);
        }

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.post("/demo", async (req: Request, res: Response) => {
    try {
        const { model, messages } = req.body;


        if (!model || !messages || !Array.isArray(messages)) {
            res.status(400).json({ error: "Invalid request body" });
            return;
        }

        const targetUrl = MODEL_ENDPOINTS[model];
        if (!targetUrl) {
            res.status(400).json({ error: "Invalid model selected" });
            return;
        }


        let hfResponse;

        if (model === "physics") {
            const userMessage = messages.find((m: any) => m.role === "user");
            const question = userMessage?.content || "";

            hfResponse = await fetch(targetUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Edyx-Token": process.env.EDYX_ACCESS_TOKEN || "edyx-secret-key-v1"
                },
                body: JSON.stringify({
                    question,
                    top_k: 5,
                    max_tokens: 1024
                }),
            });

            if (!hfResponse.ok) {
                const errorText = await hfResponse.text();
                console.error("HF Error:", errorText);
                res.status(hfResponse.status).json({ error: "Model service error" });
                return;
            }

            const data = await hfResponse.json();
            res.json({
                choices: [{
                    message: {
                        role: "assistant",
                        content: data.answer || data.text || JSON.stringify(data)
                    }
                }],
                sources_used: data.sources_used || 0
            });
            return;
        }

        hfResponse = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Edyx-Token": process.env.EDYX_ACCESS_TOKEN || "edyx-secret-key-v1"
            },
            body: JSON.stringify({
                messages,
                max_tokens: 4096,
                max_new_tokens: 4096,
                temperature: 0.6,
                repetition_penalty: 1.1,
                stop: ["<|end|>", "<|endoftext|>", "<|im_end|>", "<|eot_id|>", "User:", "\nUser:"]
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
