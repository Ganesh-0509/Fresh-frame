/**
 * Hand-drawn SVG symbols for the fireworks catalogue + brand mark.
 * Replaces the emoji placeholders. All inherit `currentColor` so brand colours
 * flow through. viewBox 0 0 48 48.
 */

type IconProps = { className?: string; title?: string };

const svg = (children: React.ReactNode, title?: string) => (props: IconProps) => (
	<svg
		viewBox="0 0 48 48"
		className={props.className}
		role={title || props.title ? "img" : "presentation"}
		aria-label={props.title ?? title}
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{children}
	</svg>
);

/* ---- Brand mark: a firework burst inside a ring ---- */
export function BrandMark({ className }: IconProps) {
	return (
		<svg viewBox="0 0 48 48" className={className} aria-label="Standard Fireworks" role="img">
			<defs>
				<radialGradient id="bm" cx="50%" cy="45%" r="60%">
					<stop offset="0%" stopColor="#fff3b0" />
					<stop offset="45%" stopColor="#ffd54a" />
					<stop offset="100%" stopColor="#f6a41c" />
				</radialGradient>
			</defs>
			<circle cx="24" cy="24" r="23" fill="#7d0209" />
			<g stroke="url(#bm)" strokeWidth="2.4" strokeLinecap="round">
				<line x1="24" y1="9" x2="24" y2="16" />
				<line x1="24" y1="32" x2="24" y2="39" />
				<line x1="9" y1="24" x2="16" y2="24" />
				<line x1="32" y1="24" x2="39" y2="24" />
				<line x1="13.5" y1="13.5" x2="18.5" y2="18.5" />
				<line x1="29.5" y1="29.5" x2="34.5" y2="34.5" />
				<line x1="34.5" y1="13.5" x2="29.5" y2="18.5" />
				<line x1="18.5" y1="29.5" x2="13.5" y2="34.5" />
			</g>
			<circle cx="24" cy="24" r="4.5" fill="url(#bm)" />
		</svg>
	);
}

/* ---- Brand / action glyphs (official-style, filled) ---- */

export function WhatsAppIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="WhatsApp" role="img">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
		</svg>
	);
}

export function PhoneIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Call" role="img">
			<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
		</svg>
	);
}

export function MailIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Email" role="img">
			<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Zm16 4.25-8 5-8-5V6l8 5 8-5v2.25Z" />
		</svg>
	);
}

export function ListIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Price list" role="img">
			<path d="M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h16v2H4v-2Z" />
		</svg>
	);
}

/* ---- Category icons ---- */
const Sparklers = svg(
	<>
		<line x1="10" y1="38" x2="27" y2="21" />
		<g stroke="#f6a41c">
			<line x1="30" y1="18" x2="34" y2="14" />
			<line x1="31" y1="24" x2="37" y2="24" />
			<line x1="28" y1="14" x2="30" y2="9" />
			<line x1="35" y1="20" x2="40" y2="17" />
			<line x1="35" y1="29" x2="40" y2="32" />
			<line x1="30" y1="30" x2="32" y2="36" />
		</g>
		<circle cx="30" cy="24" r="1.4" fill="currentColor" stroke="none" />
	</>,
	"Sparklers",
);

const FlowerPots = svg(
	<>
		<path d="M15 30 h18 l-2 12 h-14 z" />
		<path d="M24 30 v-6" stroke="#f6a41c" />
		<path d="M24 24 c-3-3 -1-7 0-9 c1 2 3 6 0 9 Z" fill="#ffd54a" stroke="#f6a41c" />
		<path d="M20 27 c-2-2 -1-4 0-5" stroke="#f6a41c" />
		<path d="M28 27 c2-2 1-4 0-5" stroke="#f6a41c" />
	</>,
	"Flower pot",
);

const Chakkar = svg(
	<>
		<path d="M24 24 m0 -13 a13 13 0 1 1 -0.1 0 M24 24 m0 -8 a8 8 0 1 0 0.1 0 M24 24 m0 -3.5 a3.5 3.5 0 1 1 -0.1 0" />
		<circle cx="24" cy="24" r="1.3" fill="currentColor" stroke="none" />
	</>,
	"Ground chakkar",
);

const Rocket = svg(
	<>
		<path d="M24 6 c5 4 7 11 7 17 h-14 c0-6 2-13 7-17 Z" />
		<path d="M17 23 l-4 5 4 -1 M31 23 l4 5 -4 -1" />
		<line x1="24" y1="32" x2="24" y2="40" stroke="#f6a41c" />
		<circle cx="24" cy="17" r="2.2" />
	</>,
	"Rocket",
);

const Sound = svg(
	<>
		<circle cx="24" cy="26" r="9" />
		<line x1="24" y1="17" x2="24" y2="9" stroke="#f6a41c" />
		<path d="M24 9 c2 -1 3 -3 2 -5" stroke="#f6a41c" />
		<g stroke="#f6a41c">
			<line x1="11" y1="14" x2="14" y2="17" />
			<line x1="37" y1="14" x2="34" y2="17" />
			<line x1="8" y1="26" x2="12" y2="26" />
			<line x1="40" y1="26" x2="36" y2="26" />
		</g>
	</>,
	"Sound cracker",
);

const Cake = svg(
	<>
		<path d="M13 40 h22 v-16 h-22 z" />
		<line x1="13" y1="30" x2="35" y2="30" />
		<line x1="24" y1="24" x2="24" y2="17" stroke="#f6a41c" />
		<g stroke="#ffd54a">
			<line x1="24" y1="15" x2="24" y2="9" />
			<line x1="20" y1="12" x2="18" y2="8" />
			<line x1="28" y1="12" x2="30" y2="8" />
		</g>
	</>,
	"Mega cake",
);

const Kids = svg(
	<>
		<circle cx="20" cy="22" r="10" />
		<circle cx="17" cy="20" r="1.1" fill="currentColor" stroke="none" />
		<circle cx="23" cy="20" r="1.1" fill="currentColor" stroke="none" />
		<path d="M16 25 c2 2.5 6 2.5 8 0" />
		<line x1="28" y1="30" x2="38" y2="40" />
		<g stroke="#f6a41c">
			<line x1="38" y1="36" x2="41" y2="34" />
			<line x1="39" y1="41" x2="42" y2="41" />
			<line x1="35" y1="41" x2="37" y2="44" />
		</g>
	</>,
	"Kids special",
);

const Gift = svg(
	<>
		<path d="M12 22 h24 v18 h-24 z" />
		<path d="M10 16 h28 v6 h-28 z" />
		<line x1="24" y1="16" x2="24" y2="40" stroke="#f6a41c" />
		<path d="M24 16 c-4 0 -7 -6 -2 -7 c3 1 2 5 2 7 Z" fill="#ffd54a" stroke="#f6a41c" />
		<path d="M24 16 c4 0 7 -6 2 -7 c-3 1 -2 5 -2 7 Z" fill="#ffd54a" stroke="#f6a41c" />
	</>,
	"Gift box",
);

/* Generic firework burst — fallback for categories without a bespoke icon. */
const Burst = svg(
	<>
		<circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
		<g stroke="#f6a41c">
			<line x1="24" y1="20" x2="24" y2="10" />
			<line x1="24" y1="28" x2="24" y2="38" />
			<line x1="20" y1="24" x2="10" y2="24" />
			<line x1="28" y1="24" x2="38" y2="24" />
			<line x1="21" y1="21" x2="14" y2="14" />
			<line x1="27" y1="27" x2="34" y2="34" />
			<line x1="27" y1="21" x2="34" y2="14" />
			<line x1="21" y1="27" x2="14" y2="34" />
		</g>
	</>,
	"Fireworks",
);

export const CATEGORY_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
	sparklers: Sparklers,
	flowerpots: FlowerPots,
	chakkars: Chakkar,
	rockets: Rocket,
	sound: Sound,
	cakes: Cake,
	kids: Kids,
	gift: Gift,
};

/** Match a category id/name by keyword to the closest bespoke icon. */
function pickIcon(id: string): (p: IconProps) => React.ReactElement {
	if (CATEGORY_ICONS[id]) return CATEGORY_ICONS[id];
	const s = id.toLowerCase();
	if (s.includes("sparkler") || s.includes("twinkl")) return Sparklers;
	if (s.includes("chakkar") || s.includes("wheel")) return Chakkar;
	if (s.includes("flower") || s.includes("pot") || s.includes("fountain")) return FlowerPots;
	if (s.includes("rocket")) return Rocket;
	if (s.includes("sky") || s.includes("shot") || s.includes("comet")) return Rocket;
	if (s.includes("bomb") || s.includes("sound")) return Sound;
	if (s.includes("cake")) return Cake;
	if (s.includes("gift")) return Gift;
	if (s.includes("kid")) return Kids;
	return Burst;
}

export function CategoryIcon({
	id,
	className,
}: {
	id: string;
	className?: string;
}) {
	const Cmp = pickIcon(id);
	return <Cmp className={className} />;
}
