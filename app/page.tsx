export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        Step 1 · scaffold
      </p>
      <h1 className="text-5xl font-black leading-none tracking-tight">
        TKN KB Tracker
      </h1>
      <p className="text-lg text-muted">9 beers. 9 hot dogs. 9 innings.</p>
      <div className="flex gap-3">
        <span className="rounded-full bg-surface px-4 py-2 text-2xl ring-1 ring-line">🍺</span>
        <span className="rounded-full bg-surface px-4 py-2 text-2xl ring-1 ring-line">🌭</span>
        <span className="rounded-full bg-surface px-4 py-2 text-2xl ring-1 ring-line">💧</span>
      </div>
    </main>
  );
}
