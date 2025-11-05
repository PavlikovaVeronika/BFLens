import Header from "@/components/header";
import Tabs from "@/components/tabs";


export default function FactorsLayout({ children }) {
  return (
    <>
        <Header/>
        <Tabs/>
        <main className="flex w-full min-h-screen font-sans bg-zinc-50 px-10">{children}</main>
    </>
  );
}
