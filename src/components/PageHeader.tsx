export default function PageHeader({
	title,
	subtitle,
}: {
	title: string;
	subtitle?: string;
}) {
	return (
		<section className="relative overflow-hidden border-b border-line bg-gradient-to-r from-brand-deep to-brand-dark py-9 text-white">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 flex items-start justify-around px-8 pt-1 text-lg opacity-70"
			>
				{["🎆", "🪔", "🎇", "🪔", "🎆"].map((d, i) => (
					<span key={i} className="diya-glow" style={{ animationDelay: `${(i % 3) * 0.3}s` }}>
						{d}
					</span>
				))}
			</div>
			<div className="relative z-10 mx-auto max-w-[1170px] px-4">
				<h1 className="gold-text text-2xl font-extrabold sm:text-3xl">{title}</h1>
				<div className="mt-2 h-[3px] w-16 rounded bg-gradient-to-r from-yellow to-[#f6a41c]" />
				{subtitle && (
					<p className="mt-2 max-w-2xl text-[15px] leading-6 text-white/85">{subtitle}</p>
				)}
			</div>
		</section>
	);
}
