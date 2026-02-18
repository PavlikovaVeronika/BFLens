"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFile } from "../app/context/filecontext";

export default function Header() {
    const pathname = usePathname();
    const { selectedFile, setSelectedFile } = useFile();

    const links = [
        { name: "factors", href: "/factors/general", icon: "ri-line-chart-line" },
        { name: "info", href: "/info", icon: "ri-information-line" },
    ];


    return (
        <header className="flex w-full items-center justify-between bg-[#016bab] px-10 py-4 shadow-md">
            <div className="flex items-center gap-3">
                <Link href="/">
                    <h1 className="font-bold text-zinc-50 text-3xl cursor-pointer hover:text-zinc-200 transition-colors">
                        BFLens
                    </h1>
                </Link>
                <span className="text-3xl text-zinc-50">|</span>
                <span className="text-zinc-50">{selectedFile}</span>
            </div>

            <nav>
                <ul className="flex flex-row space-x-8 text-zinc-50 font-medium">
                    {links.map((link) => {
                        const active = pathname.startsWith(link.href);

                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="flex items-center gap-2 hover:text-zinc-200"
                                >
                                    <i className={`${link.icon} text-lg`} />

                                    <span
                                        className={active
                                            ? "underline underline-offset-4"
                                            : ""}
                                    >
                                        {link.name}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}