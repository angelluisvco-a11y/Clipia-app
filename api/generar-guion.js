export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nicho, tema, tono, tonoDesc, escenas } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Falta configurar GEMINI_API_KEY en Vercel (Settings > Environment Variables)." });
  }
  if (!tema || !nicho) {
    return res.status(400).json({ error: "Falta el nicho o el tema." });
  }

  const cantidadEscenas = escenas || 4;

  const prompt = `Eres un guionista profesional especializado en videos narrados de formato vertical para el nicho "${nicho}". Escribes en español neutro, natural para narración en voz alta (frases cortas, ritmo hablado).

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks. Estructura exacta:
{
  "titulo": "string - título llamativo",
  "personaje_visual": "string en inglés, o cadena vacía \"\" - SOLO completa este campo si la historia gira en torno a UN mismo personaje o narrador reconocible a lo largo de todo el video (ej. una persona contando su historia). Si es contenido tipo documental/curiosidades/datos que abarca distintas épocas, lugares o personas (como este ejemplo), deja este campo como cadena vacía \"\".",
  "gancho": "string - 2-3 frases que enganchan de inmediato",
  "escenas": [{"numero": 1, "titulo": "string muy corto", "narracion": "string 1-2 frases cortas", "sugerencia_visual": "string en inglés, MUY concreto y específico: [sujeto principal exacto], [acción exacta que realiza], [lugar/época exacta], [1-2 detalles visuales clave]. Evita descripciones abstractas o poéticas, usa sustantivos y verbos directos."}],
  "cierre": "string - cierre con llamado a la acción"
}
El array "escenas" debe tener exactamente ${cantidadEscenas} escenas cortas y coherentes entre sí, desarrollando el tema de forma progresiva. Cada escena narra solo 1-2 frases (para que el video cambie de imagen seguido y no se sienta estático). Cada "sugerencia_visual" debe describir en inglés, de forma específica y autónoma, la época, vestuario y contexto exactos de ESA escena en particular (por ejemplo, ropa y objetos de 1760 si la escena ocurre en 1760) — nunca reutilices un mismo personaje o vestuario si la escena describe una época o contexto distinto. Tono: ${tono} (${tonoDesc}).
Tema: ${tema}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `Gemini respondió ${response.status}: ${errText.slice(0, 300)}` });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!raw.trim()) {
      return res.status(500).json({ error: "La respuesta de Gemini llegó vacía." });
    }

    let clean = raw.replace(/```json|```/g, "").trim();
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(clean);
    if (!parsed.titulo || !parsed.gancho || !Array.isArray(parsed.escenas) || !parsed.cierre) {
      return res.status(500).json({ error: "El guion llegó incompleto (faltan campos)." });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Error desconocido llamando a Gemini." });
  }
}
