"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Live countdown to a festival date, e.g. "12d 04h 33m 07s to Deepavali".
 * Renders nothing until mounted (and nothing once the date has passed) — the
 * placeholder-then-fill pattern avoids a hydration mismatch, since the server
 * has no concept of "now" for a ticking clock.
 */
export default function Countdown({ target, label }: { target: string; label: string }) {
	const targetMs = new Date(target).getTime();
	const [now, setNow] = useState<number | null>(null);

	useEffect(() => {
		if (!Number.isFinite(targetMs)) return;
		setNow(Date.now());
		const t = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(t);
	}, [targetMs]);

	if (now === null || !Number.isFinite(targetMs)) return null;
	const diff = targetMs - now;
	if (diff <= 0) return null;

	const days = Math.floor(diff / 86400000);
	const hours = Math.floor((diff % 86400000) / 3600000);
	const mins = Math.floor((diff % 3600000) / 60000);
	const secs = Math.floor((diff % 60000) / 1000);

	return (
		<>
			⏳ {days}d {pad(hours)}h {pad(mins)}m {pad(secs)}s to {label}
		</>
	);
}
