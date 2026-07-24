"use client";

import { useState } from "react";

/** File → compressed data URL held in a hidden input, so it submits with the settings form. */
function toDataUrl(file: File, maxDim = 600, quality = 0.85): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
				const c = document.createElement("canvas");
				c.width = Math.round(img.width * scale);
				c.height = Math.round(img.height * scale);
				const ctx = c.getContext("2d");
				if (!ctx) return reject(new Error("no canvas"));
				ctx.drawImage(img, 0, 0, c.width, c.height);
				// PNG keeps QR codes crisp; logos too.
				resolve(c.toDataURL("image/png"));
			};
			img.onerror = reject;
			img.src = reader.result as string;
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export default function ImageInput({
	name,
	label,
	defaultValue,
}: {
	name: string;
	label: string;
	defaultValue: string;
}) {
	const [val, setVal] = useState(defaultValue);

	async function onFile(file: File | undefined) {
		if (!file) return;
		try {
			setVal(await toDataUrl(file));
		} catch {
			/* ignore */
		}
	}

	return (
		<label className="block text-[15px] font-semibold text-ink">
			{label}
			<input type="hidden" name={name} value={val} />
			<div className="mt-1.5 flex items-center gap-3">
				{val ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={val} alt={label} className="h-20 w-20 rounded-lg border border-line bg-white object-contain p-1" />
				) : (
					<span className="grid h-20 w-20 place-items-center rounded-lg border border-dashed border-line text-[12px] text-muted">none yet</span>
				)}
				<input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="text-[13px] text-ink-soft file:mr-2 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-row file:px-3 file:py-2 file:text-[13px] file:font-semibold file:text-ink hover:file:bg-shell" />
				{val && (
					<button type="button" onClick={() => setVal("")} className="text-[13px] font-semibold text-brand hover:underline">
						remove
					</button>
				)}
			</div>
		</label>
	);
}
