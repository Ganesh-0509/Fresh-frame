import { redirect } from "next/navigation";
import { verifyPassword, createSession, isAuthed } from "@/lib/admin-auth";

async function login(formData: FormData) {
	"use server";
	const password = String(formData.get("password") || "");
	if (await verifyPassword(password)) {
		await createSession();
		redirect("/admin");
	}
	redirect("/admin/login?e=1");
}

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ e?: string }>;
}) {
	if (await isAuthed()) redirect("/admin");
	const { e } = await searchParams;

	return (
		<div className="mx-auto max-w-sm">
			<h1 className="mb-1 text-2xl font-bold">Admin login</h1>
			<p className="mb-6 text-[14px] text-white/60">
				Enter the admin password to manage orders and settings.
			</p>
			<form action={login} className="space-y-4">
				<div>
					<label className="mb-1 block text-[13px] text-white/70">Password</label>
					<input
						type="password"
						name="password"
						autoFocus
						className="w-full rounded border border-white/20 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-brand"
						placeholder="••••••••"
					/>
				</div>
				{e && <p className="text-[13px] text-red-400">Wrong password. Try again.</p>}
				<button className="w-full rounded bg-brand px-4 py-2.5 font-semibold text-white hover:brightness-110">
					Log in
				</button>
			</form>
		</div>
	);
}
