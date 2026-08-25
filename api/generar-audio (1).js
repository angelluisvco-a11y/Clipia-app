import { EdgeTTS } from "edge-tts-universal";

// Mapa de tus voces de catálogo a voces reales de Edge TTS en español
const VOCES = {
  v1: { id: "es-MX-JorgeNeural", label: "Mateo" },
  v2: { id: "es-MX-DaliaNeural", label: "Elena" },
  v3: { id: "es-CO-SalomeNeural", label: "Rocío" },
  v4: { id: "es-AR-TomasNeural", label: "Darío" },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { texto, vozId } = req.body || {};

  if (!texto || !texto.trim()) {
    return res.status(400).json({ error: "Falta el texto a narrar." });
  }

  const voz = VOCES[vozId] || VOCES.v2;

  try {
    const tts = new EdgeTTS(texto, voz.id, {
      rate: "+0%",
      volume: "+0%",
      pitch: "+0Hz",
    });

    const result = await tts.synthesize();
    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    return res.status(200).json({
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      voz: voz.label,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Error generando el audio." });
  }
}
