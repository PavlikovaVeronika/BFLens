"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    const links = [
        { name: "factors", href: "/factors" },
        { name: "explain", href: "/explain" },
        { name: "info", href: "/info" },
    ];

    return (
        <header className="flex w-full items-center justify-between bg-[#016bab] px-10 py-4 shadow-md">
            <h1 className="font-semibold text-zinc-50 text-3xl">LOGO</h1>

            <nav>
                <ul className="flex flex-row space-x-8 text-zinc-50 font-medium">
                    {links.map((link) => {
                        const active = pathname.includes(link.href);
                        return (
                            <li key={link.href} className="cursor-pointer">
                                <Link href={link.href} className={`${active
                                    ? "underline underline-offset-4"
                                    : "hover:text-zinc-200"
                                    }`}>
                                    {link.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}