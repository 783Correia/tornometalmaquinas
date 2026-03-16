"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Upload, X, Save } from "lucide-react";

type Props = {
  product?: {
    id: number; name: string; slug: string; description: string; short_description: string;
    sku: string; price: number; regular_price: number; sale_price: number | null;
    weight: number; length: number; width: number; height: number;
    stock_quantity: number; manage_stock: boolean; status: string; featured: boolean;
    category_id: number; brand_id: number; product_images?: { id: number; src: string; alt: string; position: number }[];
  };
};

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<{ id?: number; src: string; alt: string; position: number }[]>(
    product?.product_images || []
  );

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    short_description: product?.short_description || "",
    sku: product?.sku || "",
    price: product?.price || 0,
    regular_price: product?.regular_price || 0,
    sale_price: product?.sale_price || null as number | null,
    weight: product?.weight || 0,
    length: product?.length || 0,
    width: product?.width || 0,
    height: product?.height || 0,
    stock_quantity: product?.stock_quantity || 0,
    status: product?.status || "publish",
    category_id: product?.category_id || 0,
    brand_id: product?.brand_id || 0,
  });

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => setCategories(data || []));
    supabase.from("brands").select("id, name").order("name").then(({ data }) => setBrands(data || []));
  }, []);

  function update(field: string, value: string | number | null) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !product) updated.slug = slugify(value as string);
      return updated;
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file);
      if (!error) {
        const src = `https://lozduuvplbfiduaigjth.supabase.co/storage/v1/object/public/product-images/${fileName}`;
        setImages((prev) => [...prev, { src, alt: "", position: prev.length }]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const productData = {
      ...form,
      price: Number(form.price),
      regular_price: Number(form.regular_price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      weight: Number(form.weight),
      length: Number(form.length),
      width: Number(form.width),
      height: Number(form.height),
      stock_quantity: Number(form.stock_quantity),
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
    };

    if (product) {
      // Update
      await supabase.from("products").update(productData).eq("id", product.id);
      // Sync images
      await supabase.from("product_images").delete().eq("product_id", product.id);
      if (images.length > 0) {
        await supabase.from("product_images").insert(
          images.map((img, i) => ({ product_id: product.id, src: img.src, alt: img.alt, position: i }))
        );
      }
    } else {
      // Insert
      const { data: newProduct } = await supabase.from("products").insert(productData).select("id").single();
      if (newProduct && images.length > 0) {
        await supabase.from("product_images").insert(
          images.map((img, i) => ({ product_id: newProduct.id, src: img.src, alt: img.alt, position: i }))
        );
      }
    }

    setSaving(false);
    router.push("/admin/produtos");
  }

  const inputClass = "w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Basic info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Informações Básicas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input type="text" value={form.sku} onChange={(e) => update("sku", e.target.value)} className={`${inputClass} max-w-sm`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={6} className={inputClass} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select value={form.category_id} onChange={(e) => update("category_id", Number(e.target.value))} className={inputClass}>
              <option value={0}>Selecione</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select value={form.brand_id} onChange={(e) => update("brand_id", Number(e.target.value))} className={inputClass}>
              <option value={0}>Selecione</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={`${inputClass} max-w-xs`}>
            <option value="publish">Publicado</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Preços</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Regular (R$)</label>
            <input type="number" step="0.01" value={form.regular_price} onChange={(e) => update("regular_price", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promocional (R$)</label>
            <input type="number" step="0.01" value={form.sale_price || ""} onChange={(e) => update("sale_price", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Dimensões e Estoque</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input type="number" step="0.001" value={form.weight} onChange={(e) => update("weight", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comp. (cm)</label>
            <input type="number" step="0.01" value={form.length} onChange={(e) => update("length", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Larg. (cm)</label>
            <input type="number" step="0.01" value={form.width} onChange={(e) => update("width", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt. (cm)</label>
            <input type="number" step="0.01" value={form.height} onChange={(e) => update("height", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
            <input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Imagens</h2>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 group">
              <Image src={img.src} alt="" fill className="object-cover" sizes="96px" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                <X size={14} />
              </button>
            </div>
          ))}
          <label className={`w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition ${uploading ? "opacity-50" : ""}`}>
            <Upload size={20} className="text-gray-400 mb-1" />
            <span className="text-[10px] text-gray-400">{uploading ? "Enviando..." : "Upload"}</span>
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50">
          <Save size={18} /> {saving ? "Salvando..." : product ? "Salvar Alterações" : "Criar Produto"}
        </button>
        <button type="button" onClick={() => router.push("/admin/produtos")}
          className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}
