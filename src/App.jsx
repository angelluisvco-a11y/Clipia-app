import React, { useState } from "react";
import {
  Sparkles, Flame, Ghost, Heart, Landmark, FlaskConical, Wallet, HandHeart, Laugh, Church,
  Loader2, Copy, Check, ChevronRight, ChevronLeft, Mic, Play, Pause, User, Lock,
  FileText, Volume2, Clapperboard, Wand2, RotateCcw,
} from "lucide-react";

const NICHOS = [
  { id: "curiosidades", label: "Curiosidades", icon: Sparkles, tier: "free" },
  { id: "terror", label: "Terror / Misterio", icon: Ghost, tier: "free" },
  { id: "motivacion", label: "Motivación", icon: Flame, tier: "free" },
  { id: "vida_real", label: "Historias de vida", icon: Heart, tier: "free" },
  { id: "finanzas", label: "Finanzas", icon: Wallet, tier: "premium" },
  { id: "historia", label: "Historia", icon: Landmark, tier: "premium" },
  { id: "ciencia", label: "Ciencia y tech", icon: FlaskConical, tier: "premium" },
  { id: "relaciones", label: "Relaciones", icon: HandHeart, tier: "premium" },
  { id: "humor", label: "Humor", icon: Laugh, tier: "premium" },
  { id: "religioso", label: "Religioso", icon: Church, tier: "premium" },
];
const TONOS = [
  { id: "narrador_serio", label: "Serio", desc: "Grave, cinematográfico" },
  { id: "cercano", label: "Cercano", desc: "Como un amigo" },
  { id: "energico", label: "Enérgico", desc: "Rápido, entusiasta" },
  { id: "misterioso", label: "Misterioso", desc: "Tenso, intrigante" },
];
const DURACIONES = [
  { id: "corta", label: "3 min", blocks: 3 },
  { id: "media", label: "5 min", blocks: 4 },
  { id: "larga", label: "8 min", blocks: 6 },
];
const VOCES = [
  { id: "v1", nombre: "Mateo", genero: "Hombre", rasgo: "Grave, cinematográfico", tier: "free" },
  { id: "v2", nombre: "Elena", genero: "Mujer", rasgo: "Cálida, cercana", tier: "free" },
  { id: "v3", nombre: "Rocío", genero: "Mujer", rasgo: "Enérgica, joven", tier: "premium" },
  { id: "v4", nombre: "Darío", genero: "Hombre", rasgo: "Susurrante, tenso", tier: "premium" },
];
const ESTILOS = [
  { id: "cinematico", label: "Cinemático", tier: "free", grad: "linear-gradient(135deg,#2B2620,#4A3B22,#C9A24B)" },
  { id: "realista", label: "Realista", tier: "free", grad: "linear-gradient(135deg,#1F2A24,#3D5647,#8FAE95)" },
  { id: "anime", label: "Anime", tier: "premium", grad: "linear-gradient(135deg,#2A1E3A,#6E3F82,#E88BC8)" },
  { id: "comic", label: "Cómic", tier: "premium", grad: "linear-gradient(135deg,#2E1A14,#8C3A22,#E8A23B)" },
];

const STEPS = ["nicho", "tema", "tono", "duracion", "voz", "estilo", "resumen", "resultado"];

export default function ClipIAApp() {
  const [step, setStep] = useState(0);
  const [nicho, setNicho] = useState(null);
  const [tema, setTema] = useState("");
  const [tono, setTono] = useState(TONOS[0]);
  const [duracion, setDuracion] = useState(DURACIONES[1]);
  const [voz, setVoz] = useState(VOCES[1]);
  const [estilo, setEstilo] = useState(ESTILOS[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guion, setGuion] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resultTab, setResultTab] = useState("guion");
  const [audioListo, setAudioListo] = useState(false);
  const [generandoAudio, setGenerandoAudio] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = React.useRef(null);
  const [storyboardListo, setStoryboardListo] = useState(false);
  const [generandoStoryboard, setGenerandoStoryboard] = useState(false);
  const [escenaAnimando, setEscenaAnimando] = useState(null);

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function generarTodo() {
    setStep(7);
    setLoading(true);
    setError(null);
    setGuion(null);
    setAudioListo(false);
    setAudioError(null);
    setAudioUrl(null);
    setReproduciendo(false);
    setStoryboardListo(false);
    setResultTab("guion");

    try {
      const response = await fetch("/api/generar-guion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicho: nicho.label,
          tema,
          tono: tono.label,
          tonoDesc: tono.desc,
          escenas: duracion.blocks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      setGuion(data);
    } catch (e) {
      setError(`No se pudo generar el guion: ${e.message || "error desconocido"}`);
    } finally {
      setLoading(false);
    }
  }

  function generarAudio() {
    if (!guion) return;
    setGenerandoAudio(true);
    setAudioListo(false);
    setAudioError(null);

    const textoCompleto = [
      guion.gancho,
      ...guion.escenas.map((e) => e.narracion),
      guion.cierre,
    ].join(" ... ");

    fetch("/api/generar-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: textoCompleto, vozId: voz.id }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `Error ${r.status}`);
        setAudioUrl(data.audio);
        setAudioListo(true);
      })
      .catch((e) => setAudioError(e.message || "No se pudo generar el audio."))
      .finally(() => setGenerandoAudio(false));
  }

  function toggleReproducir() {
    if (!audioRef.current) return;
    if (reproduciendo) {
      audioRef.current.pause();
      setReproduciendo(false);
    } else {
      audioRef.current.play()
        .then(() => setReproduciendo(true))
        .catch((e) => setAudioError(`No se pudo reproducir: ${e.message}`));
    }
  }
  function generarStoryboard() {
    setGenerandoStoryboard(true);
    setTimeout(() => { setGenerandoStoryboard(false); setStoryboardListo(true); }, 2000);
  }
  function copiarGuion() {
    if (!guion) return;
    const texto = [guion.titulo, "", guion.gancho, ...guion.escenas.map((e) => `${e.titulo}\n${e.narracion}`), guion.cierre].join("\n\n");
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  function reiniciar() {
    setStep(0); setNicho(null); setTema(""); setTono(TONOS[0]); setDuracion(DURACIONES[1]);
    setVoz(VOCES[1]); setEstilo(ESTILOS[0]); setGuion(null); setAudioListo(false); setStoryboardListo(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.phone}>
        <div style={styles.statusBar}>
          <span>9:41</span>
          <span style={styles.brand}>ClipIA</span>
          <span>●●●</span>
        </div>

        {step < 6 && <ProgressDots current={step} total={6} />}

        <div style={styles.screen}>
          {step === 0 && (
            <StepWrap title="Elige un nicho" sub="Sobre qué tratará tu video">
              <div style={styles.grid2}>
                {NICHOS.map((n) => {
                  const Icon = n.icon;
                  const active = nicho?.id === n.id;
                  return (
                    <button key={n.id} onClick={() => setNicho(n)} style={{ ...styles.tile, ...(active ? styles.tileActive : {}) }}>
                      <Icon size={20} strokeWidth={1.6} color={active ? "#0B0B0F" : "#C9A24B"} />
                      <span style={{ ...styles.tileLabel, color: active ? "#0B0B0F" : "#E8E4DC" }}>{n.label}</span>
                      {n.tier === "premium" && <Lock size={10} style={{ position: "absolute", top: 8, right: 8, color: active ? "#0B0B0F" : "#6B6558" }} />}
                    </button>
                  );
                })}
              </div>
            </StepWrap>
          )}

          {step === 1 && (
            <StepWrap title="¿Cuál es el tema?" sub={`Nicho: ${nicho?.label}`}>
              <textarea
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="ej. la desaparición del vuelo MH370…"
                style={styles.textarea}
                rows={4}
              />
            </StepWrap>
          )}

          {step === 2 && (
            <StepWrap title="Estilo de narración" sub="Cómo se va a contar la historia">
              <div style={styles.listCol}>
                {TONOS.map((t) => (
                  <button key={t.id} onClick={() => setTono(t)} style={{ ...styles.rowOpt, ...(tono.id === t.id ? styles.rowOptActive : {}) }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: tono.id === t.id ? "#0B0B0F" : "#E8E4DC" }}>{t.label}</div>
                      <div style={{ fontSize: 11.5, color: tono.id === t.id ? "#3A3630" : "#8A8478" }}>{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </StepWrap>
          )}

          {step === 3 && (
            <StepWrap title="Duración del video" sub="Más largo = más escenas">
              <div style={styles.rowChips}>
                {DURACIONES.map((d) => (
                  <button key={d.id} onClick={() => setDuracion(d)} style={{ ...styles.chip, ...(duracion.id === d.id ? styles.chipActive : {}) }}>{d.label}</button>
                ))}
              </div>
            </StepWrap>
          )}

          {step === 4 && (
            <StepWrap title="Elige una voz" sub="Quién narra tu historia">
              <div style={styles.listCol}>
                {VOCES.map((v) => {
                  const active = voz.id === v.id;
                  return (
                    <button key={v.id} onClick={() => setVoz(v)} style={{ ...styles.rowOpt, ...(active ? styles.rowOptActive : {}) }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ ...styles.avatar, ...(active ? styles.avatarActive : {}) }}><User size={13} /></div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: active ? "#0B0B0F" : "#E8E4DC" }}>{v.nombre}</div>
                          <div style={{ fontSize: 11.5, color: active ? "#3A3630" : "#8A8478" }}>{v.genero} · {v.rasgo}</div>
                        </div>
                      </div>
                      {v.tier === "premium" && <Lock size={11} color={active ? "#0B0B0F" : "#6B6558"} />}
                    </button>
                  );
                })}
              </div>
            </StepWrap>
          )}

          {step === 5 && (
            <StepWrap title="Estilo visual" sub="Cómo se verán las escenas">
              <div style={styles.grid2}>
                {ESTILOS.map((e) => {
                  const active = estilo.id === e.id;
                  return (
                    <button key={e.id} onClick={() => setEstilo(e)} style={{ ...styles.estiloTile, ...(active ? { outline: "2px solid #C9A24B" } : {}) }}>
                      <div style={{ height: 54, borderRadius: 6, background: e.grad, marginBottom: 6 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#E8E4DC" }}>{e.label}</span>
                      {e.tier === "premium" && <Lock size={10} style={{ position: "absolute", top: 8, right: 8, color: "#8A8478" }} />}
                    </button>
                  );
                })}
              </div>
            </StepWrap>
          )}

          {step === 6 && (
            <StepWrap title="Listo para generar" sub="Revisa tu selección">
              <div style={styles.summaryCard}>
                <SummaryRow label="Nicho" value={nicho?.label} />
                <SummaryRow label="Tema" value={tema} />
                <SummaryRow label="Narración" value={tono.label} />
                <SummaryRow label="Duración" value={duracion.label} />
                <SummaryRow label="Voz" value={voz.nombre} />
                <SummaryRow label="Estilo" value={estilo.label} />
              </div>
              <button onClick={generarTodo} style={styles.ctaBig}>
                <Wand2 size={16} /> Generar video
              </button>
            </StepWrap>
          )}

          {step === 7 && (
            <div style={styles.resultScreen}>
              {loading && (
                <div style={styles.emptyState}>
                  <Loader2 size={26} style={{ animation: "spin 0.9s linear infinite", color: "#C9A24B" }} />
                  <p style={styles.emptyText}>Escribiendo tu guion sobre "{tema}"…</p>
                </div>
              )}
              {error && (
                <div style={styles.emptyState}>
                  <p style={{ ...styles.emptyText, color: "#D97757" }}>{error}</p>
                  <button onClick={generarTodo} style={styles.ctaSmall}><RotateCcw size={13} /> Reintentar</button>
                </div>
              )}

              {guion && (
                <>
                  <div style={styles.tabs}>
                    <TabBtn active={resultTab === "guion"} onClick={() => setResultTab("guion")} icon={FileText} label="Guion" />
                    <TabBtn active={resultTab === "audio"} onClick={() => setResultTab("audio")} icon={Volume2} label="Audio" />
                    <TabBtn active={resultTab === "visual"} onClick={() => setResultTab("visual")} icon={Clapperboard} label="Visual" />
                  </div>

                  <div style={styles.tabContent}>
                    {resultTab === "guion" && (
                      <div style={styles.scriptSheet}>
                        <div style={styles.scriptHeaderRow}>
                          <h2 style={styles.scriptTitle}>{guion.titulo}</h2>
                          <button onClick={copiarGuion} style={styles.copyBtn}>{copied ? <Check size={13} /> : <Copy size={13} />}</button>
                        </div>
                        <ScriptBlock tag="GANCHO" text={guion.gancho} />
                        {guion.escenas.map((e) => (
                          <ScriptBlock key={e.numero} tag={`ESCENA ${e.numero} · ${e.titulo}`} text={e.narracion} visual={e.sugerencia_visual} />
                        ))}
                        <ScriptBlock tag="CIERRE" text={guion.cierre} />
                      </div>
                    )}

                    {resultTab === "audio" && (
                      <div style={styles.centerPad}>
                        <div style={{ ...styles.avatarBig }}><Mic size={22} color="#C9A24B" /></div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#E8E4DC", marginTop: 10 }}>{voz.nombre}</div>
                        <div style={{ fontSize: 12, color: "#8A8478", marginBottom: 18 }}>{voz.genero} · {voz.rasgo}</div>
                        {!audioListo && !generandoAudio && (
                          <button onClick={generarAudio} style={styles.ctaSmall}><Mic size={13} /> Generar narración</button>
                        )}
                        {generandoAudio && <span style={styles.loadingChip}><Loader2 size={13} style={{ animation: "spin 0.9s linear infinite" }} /> Narrando…</span>}
                        {audioError && (
                          <>
                            <p style={{ ...styles.emptyText, color: "#D97757", marginBottom: 10 }}>{audioError}</p>
                            <button onClick={generarAudio} style={styles.ctaSmall}><RotateCcw size={13} /> Reintentar</button>
                          </>
                        )}
                        {audioListo && audioUrl && (
                          <>
                            <audio
                              ref={audioRef}
                              src={audioUrl}
                              onEnded={() => setReproduciendo(false)}
                              style={{ display: "none" }}
                            />
                            <button onClick={toggleReproducir} style={styles.ctaSmallOutline}>
                              {reproduciendo ? <Pause size={13} /> : <Play size={13} />} {reproduciendo ? "Pausar" : "Reproducir"}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {resultTab === "visual" && (
                      <div>
                        {!storyboardListo && !generandoStoryboard && (
                          <div style={styles.centerPad}>
                            <button onClick={generarStoryboard} style={styles.ctaSmall}><Clapperboard size={13} /> Generar storyboard</button>
                          </div>
                        )}
                        {generandoStoryboard && (
                          <div style={styles.centerPad}>
                            <Loader2 size={22} style={{ animation: "spin 0.9s linear infinite", color: "#C9A24B" }} />
                            <p style={{ ...styles.emptyText, marginTop: 10 }}>Pintando escenas en estilo {estilo.label.toLowerCase()}…</p>
                          </div>
                        )}
                        {storyboardListo && (
                          <div style={styles.storyList}>
                            {guion.escenas.map((e) => {
                              const playing = escenaAnimando === e.numero;
                              return (
                                <div key={e.numero} style={styles.storyCard}
                                  onClick={() => setEscenaAnimando(playing ? null : e.numero)}>
                                  <div style={{
                                    ...styles.storyVisual, background: estilo.grad,
                                    transform: playing ? "scale(1.08)" : "scale(1)", transition: "transform 5s ease-out",
                                  }}>
                                    <div style={styles.playDot}>{playing ? <Pause size={12} color="#fff" /> : <Play size={12} color="#fff" />}</div>
                                    {playing && <span style={styles.liveBadge}>● animando</span>}
                                  </div>
                                  <div style={{ padding: "8px 10px" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#C9A24B" }}>{e.titulo}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={reiniciar} style={styles.restartBtn}><RotateCcw size={13} /> Crear otro video</button>
                </>
              )}
            </div>
          )}
        </div>

        {step < 6 && (
          <div style={styles.navBar}>
            <button onClick={back} disabled={step === 0} style={{ ...styles.navBtn, opacity: step === 0 ? 0.3 : 1 }}><ChevronLeft size={16} /> Atrás</button>
            <button
              onClick={next}
              disabled={(step === 0 && !nicho) || (step === 1 && tema.trim().length < 3)}
              style={{ ...styles.navBtnPrimary, opacity: ((step === 0 && !nicho) || (step === 1 && tema.trim().length < 3)) ? 0.4 : 1 }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } * { box-sizing: border-box; } textarea::placeholder { color: #6B6558; }`}</style>
    </div>
  );
}

function StepWrap({ title, sub, children }) {
  return (
    <div style={styles.stepWrap}>
      <div style={styles.stepTitle}>{title}</div>
      <div style={styles.stepSub}>{sub}</div>
      {children}
    </div>
  );
}
function SummaryRow({ label, value }) {
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summar
