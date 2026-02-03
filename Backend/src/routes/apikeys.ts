import { Router } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth, AuthRequest } from "../middleware/auth";
import crypto from "crypto";

const router = Router();


const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

function generateApiKey(): string {
  return "edyx_live_" + crypto.randomBytes(24).toString("hex");
}

async function pushToCloudflareKV(
  apiKey: string,
  data: { model: string; user_id: string; name: string }
): Promise<void> {
  if (!CF_ACCOUNT_ID || !CF_KV_NAMESPACE_ID || !CF_API_TOKEN) {
    console.warn("Cloudflare KV credentials not configured, skipping KV push");
    return;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${apiKey}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Cloudflare KV PUT failed:", text);
    throw new Error(`Failed to push API key to Cloudflare KV: ${text}`);
  }

  console.log(`API key pushed to Cloudflare KV: ${apiKey.slice(0, 20)}...`);
}


async function deleteFromCloudflareKV(apiKey: string): Promise<void> {
  if (!CF_ACCOUNT_ID || !CF_KV_NAMESPACE_ID || !CF_API_TOKEN) {
    return;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${apiKey}`;

  await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
    },
  });
}


router.post("/", requireAuth, async (req: AuthRequest, res) => {
  console.log("DEBUG: Hit POST /keys route");
  try {
    const { name, model } = req.body;
    const userId = req.user!.user_id;

    if (!name || !model) {
      return res.status(400).json({ error: "Missing name or model" });
    }

    if (!["convo", "balanced", "fast"].includes(model)) {
      return res.status(400).json({ error: "Invalid model. Must be: convo, balanced, or fast" });
    }

    // Check Limit (Max 10 per model)
    const { count, error: countError } = await supabase
      .from("api_keys")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("model", model);

    if (countError) {
      console.error("Failed to check key limit", countError);
      return res.status(500).json({ error: "Failed to check key limits" });
    }

    if ((count || 0) >= 10) {
      return res.status(400).json({ error: `Limit reached. You can only have 10 keys for ${model} model.` });
    }

    const apiKey = generateApiKey();

    const { error } = await supabase.from("api_keys").insert({
      user_id: userId,
      model,
      api_key: apiKey,
      name, // Save the name!
      total_requests: 0,
      total_tokens: 0
    });

    if (error) {
      console.error("API key insert error:", JSON.stringify(error, null, 2));
      return res.status(500).json({ error: "Failed to store API key", details: error.message });
    }

    try {
      await pushToCloudflareKV(apiKey, {
        model,
        user_id: userId,
        name: name || "Untitled Key",
      });
    } catch (kvError) {
      console.error("KV push failed, but key is stored in Supabase:", kvError);
    }

    return res.json({
      api_key: apiKey,
      name,
      model,
      message: "API key created successfully.",
    });
  } catch (err) {
    console.error("Create key error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.user_id;

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, model, created_at, api_key, name, total_requests, total_tokens")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("API keys fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch API keys" });
    }

    // Mask the API keys 
    const maskedKeys = (data || []).map((key) => ({
      id: key.id,
      name: key.name || "Untitled Key",
      model: key.model,
      created_at: key.created_at,
      api_key_prefix: key.api_key.slice(0, 20) + "...",
      total_requests: key.total_requests || 0,
      total_tokens: key.total_tokens || 0
    }));

    return res.json({ keys: maskedKeys });
  } catch (err) {
    console.error("List keys error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.user_id;
    const keyId = req.params.id;


    const { data: keyData } = await supabase
      .from("api_keys")
      .select("api_key")
      .eq("id", keyId)
      .eq("user_id", userId)
      .single();

    if (keyData) {
      await deleteFromCloudflareKV(keyData.api_key);
    }

    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", keyId)
      .eq("user_id", userId);

    if (error) {
      console.error("API key delete error:", error);
      return res.status(500).json({ error: "Failed to delete API key" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete key error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/validate", async (req, res) => {
  const { api_key } = req.body;

  if (!api_key) {
    return res.json({ valid: false });
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, model, user_id")
    .eq("api_key", api_key)
    .single();

  if (error || !data) {
    return res.json({ valid: false });
  }

  return res.json({
    valid: true,
    model: data.model,
    user_id: data.user_id,
  });
});

export default router;
