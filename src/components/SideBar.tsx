import Link from "next/link";
import { SITE, telLink, waLink } from "@/lib/site";
import { WhatsAppIcon, PhoneIcon, MailIcon, ListIcon } from "@/components/icons";

/**
 * Vertical sticky contact rail on the left edge — the reference site has one
 * (its ShareThis share bar). Ours is a quick-action bar (Call · WhatsApp ·
 * Enquiry · Price List) with proper brand glyphs, not emoji.
 *
 * Desktop: fixed vertical rail, left edge.
 * Mobile: fixed bottom bar.
 */

type Item = {
	key: string;
	label: string;
	Icon: (p: { className?: string }) => React.ReactElement;
	href: string;
	bg: string;
	external: boolean;
};

const ITEMS: Item[] = [
	{ key: "call", label: "Call", Icon: PhoneIcon, href: telLink(), bg: "bg-brand", external: false },
	{
		key: "wa",
		label: "WhatsApp",
		Icon: WhatsAppIcon,
		href: waLink(`Hi ${SITE.name}, I'd like to enquire about your crackers.`),
		bg: "bg-[#25D366]",
		external: true,
	},
	{ key: "enquiry", label: "Enquiry", Icon: MailIcon, href: "/contact", bg: "bg-brand-dark", external: false },
	{ key: "list", label: "Price List", Icon: ListIcon, href: "/products", bg: "bg-[#1c1c1c]", external: false },
];

export default function SideBar() {
	return (
		<>
			{/* ---- desktop: left vertical rail ---- */}
			<div className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-px shadow-lg lg:flex">
				{ITEMS.map((it) =>
					it.external ? (
						<a
							key={it.key}
							href={it.href}
							target="_blank"
							rel="noopener"
							className={`group flex items-center ${it.bg} text-white`}
						>
							<RailInner Icon={it.Icon} label={it.label} />
						</a>
					) : (
						<Link key={it.key} href={it.href} className={`group flex items-center ${it.bg} text-white`}>
							<RailInner Icon={it.Icon} label={it.label} />
						</Link>
					),
				)}
			</div>

			{/* ---- mobile: bottom action bar ---- */}
			<div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-black/10 shadow-[0_-2px_10px_rgba(0,0,0,0.15)] lg:hidden">
				{ITEMS.map((it) => {
					const inner = (
						<>
							<it.Icon className="h-5 w-5" />
							<span className="text-[12px] font-medium">{it.label}</span>
						</>
					);
					const cls = `flex flex-col items-center justify-center gap-0.5 ${it.bg} py-2 text-white`;
					return it.external ? (
						<a key={it.key} href={it.href} target="_blank" rel="noopener" className={cls}>
							{inner}
						</a>
					) : (
						<Link key={it.key} href={it.href} className={cls}>
							{inner}
						</Link>
					);
				})}
			</div>
		</>
	);
}

function RailInner({
	Icon,
	label,
}: {
	Icon: (p: { className?: string }) => React.ReactElement;
	label: string;
}) {
	return (
		<>
			<span className="grid h-11 w-11 place-items-center">
				<Icon className="h-5 w-5" />
			</span>
			{/* Label slides open on hover, like the reference's share rail. */}
			<span className="max-w-0 overflow-hidden whitespace-nowrap text-[14px] font-semibold transition-all duration-200 group-hover:max-w-[120px] group-hover:pr-3">
				{label}
			</span>
		</>
	);
}
