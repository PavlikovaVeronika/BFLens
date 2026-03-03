import "../globals.css";
import { FileProvider } from "@/app/context/filecontext";

export default function RootLayout({ children }) {
  return (
    <>
      <FileProvider>
        <main>
          {children}
        </main>
      </FileProvider>
    </>
  );
}
