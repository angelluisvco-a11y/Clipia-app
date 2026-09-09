export default async function handler(req, res) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;

  const prompt = req.query.prompt || "a cat playing piano";
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

    const base64Image = data.result.image;
    const imgBuffer = Buffer.from(base64Image, "base64");
    res.setHeader("Content-Type", "image/jpeg");
    return res.status(200).send(imgBuffer);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
    }
