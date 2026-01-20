import Header from "@/components/Header";

export default function InfoLayout({ children }) {
  return (
    <>
        <Header/>
        <main className="w-full font-sans px-10">{children}</main>
    </>
  );
}