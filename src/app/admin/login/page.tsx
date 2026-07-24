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
		<div className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-white p-7 shadow-sm sm:p-8">
			<h1 className="mb-1 text-[26px] font-extrabold text-ink">Welcome back 👋</h1>
			<p className="mb-6 text-[15px] text-muted">
				Enter your password to manage your shop.
			</p>
			<form action={login} className="space-y-4">
				<div>
					<label className="mb-1 block text-[15px] font-semibold text-ink">Password</label>
					<input
						type="password"
						name="password"
						autoFocus
						className="w-full rounded-lg border border-line bg-white px-4 py-3.5 text-[17px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
						placeholder="Type your password"
					/>
				</div>
				{e && (
					<p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[14px] font-medium text-red-700">
						That password didn&apos;t match. Please try again.
					</p>
				)}
				<button className="w-full rounded-lg bg-brand px-4 py-3.5 text-[17px] font-bold text-white shadow-sm transition hover:brightness-110">
					Log in
				</button>
			</form>
		</div>
	);
}
