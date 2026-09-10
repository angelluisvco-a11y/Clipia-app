export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Falta el prompt." });
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({ error: "Cloudflare respondió con error", detalle: data.errors });
    }

    return res.status(200).json({ imagen: `data:image/jpeg;base64,${data.result.image}` });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
