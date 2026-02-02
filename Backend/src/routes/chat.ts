import { Router, Request, Response } from "express";

const router = Router();


const MODEL_ENDPOINTS: Record<string, string> = {
    convo: "https://edyxapi-convo-model.hf.space/v1/chat",
    balanced: "https://edyxapi-edyx-llama-balanced.hf.space/v1/chat",
    fast: "https://edyxapi-edyx-qwen-fast.hf.space/v1/chat",
};


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


        const hfResponse = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }),
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
