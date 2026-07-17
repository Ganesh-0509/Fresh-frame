/**
 * Decorative CSS fireworks + sparkles for the hero. No gif, no JS — pure CSS
 * animation. Positions are fixed (not random) so server and client render the
 * same markup — no hydration mismatch.
 */

const BURSTS = [
	{ left: "12%", top: "26%", delay: "0s" },
	{ left: "82%", top: "20%", delay: "1.1s" },
	{ left: "48%", top: "14%", delay: "2.0s" },
	{ left: "68%", top: "62%", delay: "0.6s" },
	{ left: "24%", top: "68%", delay: "1.6s" },
];

const SPARKLES = [
	{ left: "8%", top: "40%", size: 6, delay: "0s" },
	{ left: "18%", top: "18%", size: 4, delay: "0.5s" },
	{ left: "38%", top: "58%", size: 5, delay: "1s" },
	{ left: "58%", top: "28%", size: 4, delay: "0.3s" },
	{ left: "74%", top: "48%", size: 6, delay: "0.8s" },
	{ left: "90%", top: "34%", size: 5, delay: "1.4s" },
	{ left: "30%", top: "80%", size: 4, delay: "1.1s" },
	{ left: "62%", top: "78%", size: 5, delay: "0.2s" },
];

export default function Fireworks() {
	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
			{BURSTS.map((b, i) => (
				<span
					key={`b${i}`}
					className="firework"
					style={{ left: b.left, top: b.top, animationDelay: b.delay }}
				/>
			))}
			{SPARKLES.map((s, i) => (
				<span
					key={`s${i}`}
					className="sparkle"
					style={{
						left: s.left,
						top: s.top,
						width: s.size,
						height: s.size,
						animationDelay: s.delay,
					}}
				/>
			))}
		</div>
	);
}
