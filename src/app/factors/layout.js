import Header from "@/components/Header";
import Tabs from "@/components/Tabs";


export default function FactorsLayout({ children }) {
  return (
    <>
        <Header/>
        <Tabs/>
        <main className="w-full font-sans px-10">{children}</main>
    </>
  );
}
