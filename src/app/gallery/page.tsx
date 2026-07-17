import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
	title: "Gallery",
	description: "Photos and videos of our crackers, our godown and our customers' celebrations.",
};

/**
 * ⚠️ Placeholders until the client sends their OWN photos.
 * Drop files into /public/gallery/ and list them here.
 * Never use another company's product photos — copyright, and they're the
 * wrong products anyway.
 */
const PHOTOS: { src: string; caption: string }[] = [];
const VIDEOS: string[] = []; // YouTube IDs

const PLACEHOLDER_CAPTIONS = [
	"Our godown",
	"Sparklers range",
	"Flower pots",
	"Mega cakes",
	"Gift boxes",
	"Packed & ready",
	"Loading for transport",
	"Deepavali night",
];

export default function GalleryPage() {
	return (
		<>
			<PageHeader
				title="Gallery"
				subtitle="Our stock, our godown, and the celebrations they end up in."
			/>

			<section className="py-12">
				<div className="mx-auto max-w-[1170px] px-4">
					<h2 className="mb-5 border-b-2 border-brand pb-2 text-lg font-semibold text-ink">
						📷 Photos
					</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{PHOTOS.length
							? PHOTOS.map((p) => (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										key={p.src}
										src={p.src}
										alt={p.caption}
										loading="lazy"
										className="aspect-square w-full border border-line object-cover"
									/>
								))
							: PLACEHOLDER_CAPTIONS.map((c) => (
									<div key={c} className="ph aspect-square">
										📷
										<br />
										{c}
									</div>
								))}
					</div>
					<p className="mt-3 text-[13px] text-muted">
						⚠️ Placeholders. Put the client&apos;s own photos in{" "}
						<code className="bg-row px-1">/public/gallery/</code> and list them in the{" "}
						<code className="bg-row px-1">PHOTOS</code> array in this file.
					</p>
				</div>
			</section>

			<section className="pb-12">
				<div className="mx-auto max-w-[1170px] px-4">
					<h2 className="mb-5 border-b-2 border-brand pb-2 text-lg font-semibold text-ink">
						🎬 Videos
					</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{VIDEOS.length
							? VIDEOS.map((id) => (
									<div key={id} className="aspect-[9/16] border border-line">
										<iframe
											src={`https://www.youtube.com/embed/${id}`}
											title="Video"
											allowFullScreen
											className="h-full w-full"
										/>
									</div>
								))
							: Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="ph aspect-[9/16]">
										🎬
										<br />
										Video placeholder
									</div>
								))}
					</div>
					<p className="mt-3 text-[13px] text-muted">
						Tip: short vertical clips of items actually bursting sell better than any
						photo. Ask the client to shoot a few on their phone this season.
					</p>
				</div>
			</section>

			<section className="bg-brand py-12 text-center text-white">
				<div className="mx-auto max-w-[1170px] px-4">
					<h2 className="text-2xl font-bold sm:text-3xl">Like what you see?</h2>
					<p className="mx-auto mt-3 max-w-xl text-[15px] text-white/85">
						Build your list from the price list and send it across on WhatsApp.
					</p>
					<Link href="/products" className="btn-yellow mt-6">
						VIEW THE PRICE LIST
					</Link>
				</div>
			</section>
		</>
	);
}
