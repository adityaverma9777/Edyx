const CF_API_BASE = "https://api.cloudflare.com/client/v4";

export async function kvPut(key: string, value: object) {
  const url = `${CF_API_BASE}/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE_ID}/values/${key}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudflare KV PUT failed: ${text}`);
  }
}

export async function kvDelete(key: string) {
  const url = `${CF_API_BASE}/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE_ID}/values/${key}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudflare KV DELETE failed: ${text}`);
  }
}
