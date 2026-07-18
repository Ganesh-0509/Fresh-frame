"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
	updateProduct,
	deleteProduct,
	createProduct,
	createCategory,
	renameCategory,
	deleteCategory,
} from "@/lib/catalog";
import type { LineId } from "@/lib/catalog-types";

function refresh() {
	revalidatePath("/admin/products");
	revalidatePath("/products");
	revalidatePath("/checkout");
}

export async function saveProductAction(formData: FormData) {
	await requireAdmin();
	const id = String(formData.get("id") || "");
	if (!id) return;
	const stockRaw = formData.get("stock");
	await updateProduct(id, {
		name: String(formData.get("name") || "").trim(),
		content: String(formData.get("content") || "").trim(),
		mrp: Math.max(0, Math.floor(Number(formData.get("mrp")) || 0)),
		price: Math.max(0, Math.floor(Number(formData.get("price")) || 0)),
		active: formData.get("active") === "on",
		stock: stockRaw === null || stockRaw === "" ? -1 : Math.floor(Number(stockRaw)),
	});
	refresh();
}

export async function deleteProductAction(formData: FormData) {
	await requireAdmin();
	const id = String(formData.get("id") || "");
	if (id) await deleteProduct(id);
	refresh();
}

export async function createProductAction(formData: FormData) {
	await requireAdmin();
	const categoryId = String(formData.get("categoryId") || "");
	const line = String(formData.get("line") || "standard") as LineId;
	const name = String(formData.get("name") || "").trim();
	if (!categoryId || !name) return;
	await createProduct({
		categoryId,
		line,
		name,
		content: String(formData.get("content") || "").trim(),
		mrp: Math.max(0, Math.floor(Number(formData.get("mrp")) || 0)),
		price: Math.max(0, Math.floor(Number(formData.get("price")) || 0)),
	});
	refresh();
}

export async function createCategoryAction(formData: FormData) {
	await requireAdmin();
	const line = String(formData.get("line") || "standard") as LineId;
	const name = String(formData.get("name") || "").trim();
	if (name) await createCategory(line, name);
	refresh();
}

export async function renameCategoryAction(formData: FormData) {
	await requireAdmin();
	const id = String(formData.get("id") || "");
	const name = String(formData.get("name") || "").trim();
	if (id && name) await renameCategory(id, name);
	refresh();
}

export async function deleteCategoryAction(formData: FormData) {
	await requireAdmin();
	const id = String(formData.get("id") || "");
	if (id) await deleteCategory(id); // no-op if it still has products
	refresh();
}
