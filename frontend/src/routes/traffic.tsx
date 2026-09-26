import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { signOutCreator } from "@/services/auth";
import { getTrafficDashboard, isTrafficOwner, type TrafficDashboard } from "@/services/siteTraffic";

export const Route = createFileRoute("/traffic")({
  head: () => ({ meta: [{ name: "robots", content: "noindex,nofollow" }] }),
  component: TrafficPage,
});

function TrafficPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [authorized, setAuthorized] = useState(false);
  const [data, setData] = useState<TrafficDashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        if (!await isTrafficOwner()) {
          if (active) navigate({ to: "/traffic-login", replace: true });
          return;
        }
        if (active) setAuthorized(true);
        const result = await getTrafficDashboard(days);
        if (active) { setData(result); setError(""); }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Veriler alınamadı.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [days, navigate]);

  if (!authorized) return <main className="min-h-screen bg-[#f7f5fb] p-8">Erişim kontrol ediliyor...</main>;
  const maximum = Math.max(1, ...((data?.daily ?? []).map((day) => day.views)));
  return (
    <main className="min-h-screen bg-[#f7f5fb] px-4 py-7 text-[#1a1523] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><Link to="/" className="text-xl font-black text-violet-700">AQRYO.</Link><h1 className="mt-2 text-3xl font-black">Trafik</h1><p className="mt-1 text-sm text-slate-500">Site ziyaretleri · veri toplama başladığı tarihten itibaren</p></div>
          <div className="flex gap-2"><select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"><option value={7}>Son 7 gün</option><option value={30}>Son 30 gün</option><option value={90}>Son 90 gün</option></select><button onClick={() => void signOutCreator().then(() => navigate({ to: "/traffic-login", replace: true }))} className="rounded-xl border bg-white px-4 text-sm font-bold">Çıkış</button></div>
        </header>
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
        {loading ? <p className="mt-10">Veriler yükleniyor...</p> : data && <>
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            {([["Sayfa görüntüleme", data.views], ["Tekil ziyaretçi", data.visitors], ["Oturum", data.sessions]] as const).map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-6"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-4xl font-black">{value.toLocaleString("tr-TR")}</p></div>)}
          </section>
          <section className="mt-5 rounded-2xl border bg-white p-6"><h2 className="text-lg font-black">Günlük trafik</h2><div className="mt-6 flex h-52 items-end gap-1 overflow-x-auto">{data.daily.map((day) => <div key={day.day} title={`${day.day}: ${day.views} görüntüleme, ${day.visitors} ziyaretçi`} className="group flex h-full min-w-2 flex-1 flex-col justify-end"><div className="min-h-1 rounded-t bg-violet-600" style={{ height: `${Math.max(2, 100 * day.views / maximum)}%` }} /><span className="mt-2 hidden text-center text-[9px] text-slate-500 group-first:block group-last:block sm:block">{day.day.slice(5)}</span></div>)}</div></section>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Breakdown title="En çok ziyaret edilen sayfalar" rows={data.pages.map((row) => [row.path, row.views])} />
            <Breakdown title="Trafik kaynakları" rows={data.sources.map((row) => [row.source, row.views])} />
            <Breakdown title="Cihazlar" rows={data.devices.map((row) => [row.device === "mobile" ? "Mobil" : "Masaüstü", row.views])} />
          </div>
          <p className="mt-6 text-xs text-slate-500">Tekil ziyaretçi tarayıcı kimliğine göre yaklaşık hesaplanır. Reklam engelleyici, çerez temizleme ve bot trafiği sayıları etkileyebilir.</p>
        </>}
      </div>
    </main>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  return <section className="rounded-2xl border bg-white p-6"><h2 className="font-black">{title}</h2><div className="mt-5 space-y-3">{rows.length ? rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b pb-2 text-sm"><span className="break-all text-slate-600">{label}</span><strong>{value.toLocaleString("tr-TR")}</strong></div>) : <p className="text-sm text-slate-500">Henüz veri yok.</p>}</div></section>;
}
