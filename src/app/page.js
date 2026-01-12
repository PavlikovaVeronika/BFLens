import fs from "fs";
import path from "path";
import FileSelector from "@/components/FileSelector";

export default function Home() {
  const dataDir = path.join(process.cwd(), "public/data");

  const files = fs
    .readdirSync(dataDir)
    .filter((file) => !file.startsWith("."));

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#016bab]">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32">
        <div className="flex flex-col w-full items-center text-center">
          <h1 className="lg:text-8xl md:text-6xl text-4xl font-semibold text-zinc-50 mb-16">
            Let data show its <span className="text-[#42b8fd]">factors</span>.
          </h1>

          <FileSelector files={files} />
        </div>
      </main>
    </div>
  );
}