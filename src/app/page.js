import Link from "next/link";

export default function Welcome() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#016bab]">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32">
        <div className="flex flex-col w-full items-center text-center">
          
          <h1 className="lg:text-8xl md:text-6xl text-4xl font-semibold text-zinc-50 mb-10">
            Welcome to <span className="text-[#42b8fd]">BFLens</span>.
          </h1>

          <p className="text-zinc-200 text-lg md:text-xl mb-16 max-w-xl">
            Explore your data and let factors reveal themselves.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            
            <Link
              href="/home"
              className="flex h-12 items-center justify-center gap-2 rounded-full px-5 text-zinc-50 transition-colors hover:bg-white hover:text-[#016bab] border border-zinc-5"
            >
              Enter Application
            </Link>

            <a
              href="https://github.com/PavlikovaVeronika/BFLens"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full px-5 transition-colors hover:bg-white hover:text-[#016bab] border border-[#42b8fd] text-[#42b8fd]"
            >
              View on GitHub
            </a>

          </div>

        </div>
      </main>
    </div>
  );
}