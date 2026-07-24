import type { Metadata } from "next";
import Link from "next/link";
import { isAuthed, destroySession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { SITE } from "@/lib/site";
import { BrandMark } from "@/components/icons";

export const metadata: Metadata = {
	title: "Admin",
	robots: { index: false, follow: false },
};

async function logout() {
	"use server";
	await destroySession();
	redirect("/admin/login");
}

const NAV = [
	{ href: "/admin", label: "Dashboard" },
	{ href: "/admin/orders", label: "Orders" },
	{ href: "/admin/products", label: "Products" },
	{ href: "/admin/settings", label: "Settings" },
	{ href: "/admin/help", label: "Help" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const authed = await isAuthed();
	return (
		<div className="min-h-screen bg-[#0b1020] text-white">
			<header className="border-b border-white/10 bg-[#0e1428]">
				<div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3">
					<Link href="/admin" className="flex items-center gap-2 font-bold">
						<span className="grid h-7 w-7 place-items-center rounded bg-brand text-white">
							<BrandMark className="h-5 w-5" />
						</span>
						{SITE.name} · Admin
					</Link>
					{authed && (
						<nav className="flex items-center gap-1 text-[13.5px]">
							{NAV.map((n) => (
								<Link
									key={n.href}
									href={n.href}
									className="rounded px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white"
								>
									{n.label}
								</Link>
							))}
							<form action={logout}>
								<button className="ml-1 rounded border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/10">
									Log out
								</button>
							</form>
						</nav>
					)}
				</div>
			</header>
			<main className="mx-auto max-w-[1100px] px-4 py-8">{children}</main>
		</div>
	);
}
