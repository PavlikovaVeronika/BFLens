export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#016bab]">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32">
        <div className="flex flex-col w-full max-w-full items-center justify-center text-center">
          <h1 className="lg:text-8xl md:text-6xl text-4xl font-semibold text-black text-zinc-50 mb-16">
            Let data show its <span className="text-[#42b8fd]">factors</span>.
          </h1>

          <a
            className="flex h-12 items-center justify-center gap-2 rounded-full px-5 text-zinc-50 transition-colors hover:bg-white hover:text-[#016bab] border border-zinc-50"
            href="/factors/general"
          >
            Explore factors in data
          </a>
        </div>

      </main>
    </div>
  );
}
