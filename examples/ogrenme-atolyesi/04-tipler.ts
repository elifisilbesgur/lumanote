// Öğrenme örneği: bu dosya LumaNote uygulamasına otomatik eklenmez.
export type KisaNot = { id: string; title: string; deletedAt?: string | null };
export type Oturum = { id: string; phase: "focus" | "break"; seconds: number };
export function ornekOdul(oturum: Oturum): number {
  if (!Number.isFinite(oturum.seconds) || oturum.seconds < 0) {
    throw new Error("Geçersiz süre");
  }
  return oturum.phase === "break" ? 0 : Math.floor(oturum.seconds / 20);
}
const not: KisaNot = {id:"n1", title:"İlk not"};
// not.title = 42; // Bu satırı açarsan tür kontrolü hatası beklenir.
console.log(not, ornekOdul({id:"s1", phase:"focus", seconds:60}));
