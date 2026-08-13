/**
 * Bulk import/export for the State → City → Area delivery list.
 *
 * Import accepts EITHER a `.csv` OR the owner's real Excel `.xlsx`/`.xls` export
 * as-is — no reformatting required. Column names are matched by alias
 * (case-insensitive), so the client's actual transport-agent sheet — headers
 * `S.No, Address, Location, Country, State, City, Postcode, Google Map Link,
 * Status` — is recognised directly: `Address` is the area name (their sheet
 * puts the full pickup-point name/phone number there) EXCEPT for rows inside
 * Chennai city, where `Address` is the transport agent's own office
 * address/phone and `Location` holds the actual named delivery area (e.g.
 * "Sriperumbudur", "Vadapalani") — so for those rows `Location` is used as
 * the area name instead. `City` is the city (falling back to `Location` for
 * the handful of rows where City is blank), and `Google Map Link` is the map
 * link. `S.No`/`Country`/`Postcode`/`Status` are simply ignored — we don't
 * need them.
 *
 * One row = one area (or, for a city with no areas yet, one row with the area
 * column blank). Export/template columns: State, DeliveryFee, City, Area,
 * MapsLink.
 *
 * Import is ADDITIVE — it never deletes a state/city/area that isn't mentioned
 * in the file. That way the owner can re-upload the same sheet after adding a
 * few new rows without wiping out areas someone already typed in by hand. An
 * area with the same name (case-insensitive) inside the same city gets its
 * map link updated instead of duplicated.
 */

import * as XLSX from "xlsx";
import { areaKey, cleanMapUrl, type ServiceArea, type Settings } from "@/lib/site";

export type DeliveryCsvRow = {
	state: string;
	fee: number | null;
	city: string;
	area: string;
	mapsLink: string;
};

/** Splits one CSV line on commas, respecting double-quoted fields (Excel's format). */
function splitCsvLine(line: string): string[] {
	const out: string[] = [];
	let cur = "";
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (inQuotes) {
			if (c === '"') {
				if (line[i + 1] === '"') {
					cur += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				cur += c;
			}
		} else if (c === '"') {
			inQuotes = true;
		} else if (c === ",") {
			out.push(cur);
			cur = "";
		} else {
			cur += c;
		}
	}
	out.push(cur);
	return out.map((s) => s.trim());
}

function csvCell(v: string): string {
	return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export const DELIVERY_CSV_HEADER = "State,DeliveryFee,City,Area,MapsLink";

/* ---- shared header-alias matching (used by both the CSV and Excel paths) ---- */

const normalizeHeader = (h: string) => String(h).trim().toLowerCase().replace(/\s+/g, " ");

function findCol(headers: string[], aliases: string[]): number {
	const norm = headers.map(normalizeHeader);
	for (const alias of aliases) {
		const i = norm.indexOf(alias);
		if (i >= 0) return i;
	}
	return -1;
}

const cell = (row: unknown[], i: number) => (i >= 0 ? String(row[i] ?? "").trim() : "");

/** Turns a header row + data rows (arrays of cell values) into DeliveryCsvRow[]. */
function mapRows(headerRow: unknown[], dataRows: unknown[][]): DeliveryCsvRow[] {
	const headers = headerRow.map((h) => String(h ?? ""));
	const iState = findCol(headers, ["state"]);
	const iFee = findCol(headers, ["deliveryfee", "delivery fee", "fee", "transport fee"]);
	const iCity = findCol(headers, ["city"]);
	const iLocation = findCol(headers, ["location"]); // fallback when City is blank
	const iArea = findCol(headers, ["address", "area", "pickup point", "location name"]);
	const iMap = findCol(headers, ["google map link", "googlemaplink", "maps link", "mapslink", "map link", "gmap link"]);
	if (iState < 0) return []; // no recognisable State column — nothing usable to import

	const rows: DeliveryCsvRow[] = [];
	for (const r of dataRows) {
		const state = cell(r, iState);
		if (!state) continue;
		const feeRaw = cell(r, iFee);
		const fee = feeRaw !== "" && Number.isFinite(Number(feeRaw)) ? Math.max(0, Math.floor(Number(feeRaw))) : null;
		const city = cell(r, iCity) || cell(r, iLocation);
		const isChennai = city.trim().toLowerCase() === "chennai";
		const area = isChennai ? cell(r, iLocation) || cell(r, iArea) : cell(r, iArea);
		rows.push({ state, fee, city, area, mapsLink: cell(r, iMap) });
	}
	return rows;
}

/** Parses uploaded CSV text into rows. Silently skips a row with no State. */
export function parseDeliveryCsv(text: string): DeliveryCsvRow[] {
	const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
	if (lines.length < 2) return [];
	return mapRows(splitCsvLine(lines[0]), lines.slice(1).map(splitCsvLine));
}

/** Parses an uploaded Excel workbook (.xlsx/.xls) — reads the first sheet. */
export function parseDeliveryWorkbook(data: ArrayBuffer | Uint8Array): DeliveryCsvRow[] {
	let sheetRows: unknown[][];
	try {
		const wb = XLSX.read(data, { type: "array" });
		const sheet = wb.Sheets[wb.SheetNames[0]];
		if (!sheet) return [];
		sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false }) as unknown[][];
	} catch {
		return []; // not a readable spreadsheet
	}
	if (sheetRows.length < 2) return [];
	return mapRows(sheetRows[0], sheetRows.slice(1));
}

/** Builds a CSV of the CURRENT delivery list — doubles as the "template" download. */
export function buildDeliveryCsv(s: Settings): string {
	const lines = [DELIVERY_CSV_HEADER];
	for (const state of s.serviceStates) {
		const fee = s.transportFees[state] ?? 0;
		const cities = s.serviceCities[state] ?? [];
		if (!cities.length) {
			lines.push([csvCell(state), String(fee), "", "", ""].join(","));
			continue;
		}
		for (const city of cities) {
			const areas = s.serviceAreas[areaKey(state, city)] ?? [];
			if (!areas.length) {
				lines.push([csvCell(state), String(fee), csvCell(city), "", ""].join(","));
			} else {
				for (const a of areas) {
					lines.push([csvCell(state), String(fee), csvCell(city), csvCell(a.name), csvCell(a.mapUrl)].join(","));
				}
			}
		}
	}
	return lines.join("\r\n") + "\r\n";
}

/** Merges parsed rows (from CSV or Excel) on top of the current settings. Returns the new delivery fields. */
export function mergeDeliveryImport(
	cur: Settings,
	rows: DeliveryCsvRow[],
): Pick<Settings, "serviceStates" | "transportFees" | "serviceCities" | "serviceAreas"> {
	const serviceStatesSet = new Set(cur.serviceStates);
	const transportFees: Record<string, number> = { ...cur.transportFees };
	const serviceCities: Record<string, string[]> = Object.fromEntries(
		Object.entries(cur.serviceCities).map(([k, v]) => [k, [...v]]),
	);
	const serviceAreas: Record<string, ServiceArea[]> = Object.fromEntries(
		Object.entries(cur.serviceAreas).map(([k, v]) => [k, v.map((a) => ({ ...a }))]),
	);

	for (const row of rows) {
		const state = row.state.trim();
		if (!state) continue;
		serviceStatesSet.add(state);
		if (row.fee !== null) transportFees[state] = row.fee;

		const city = row.city.trim();
		if (!city) continue;
		const cities = serviceCities[state] ?? (serviceCities[state] = []);
		if (!cities.some((c) => c.toLowerCase() === city.toLowerCase())) cities.push(city);

		const area = row.area.trim();
		if (!area) continue;
		const key = areaKey(state, city);
		const areas = serviceAreas[key] ?? (serviceAreas[key] = []);
		const mapUrl = cleanMapUrl(row.mapsLink || "");
		const existing = areas.find((a) => a.name.toLowerCase() === area.toLowerCase());
		if (existing) {
			if (mapUrl) existing.mapUrl = mapUrl;
		} else {
			areas.push({ name: area, mapUrl });
		}
	}

	return {
		serviceStates: [...serviceStatesSet],
		transportFees,
		serviceCities,
		serviceAreas,
	};
}
