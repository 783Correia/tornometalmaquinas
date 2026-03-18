"use client";

import { useState } from "react";
import { Truck, Loader2 } from "lucide-react";

type ShippingOption = {
  id: number;
  name: string;
  company: string;
  logo: string;
  price: number;
  delivery_time: number;
};

type Product = {
  weight: number;
  width: number;
  height: number;
  length: number;
  quantity: number;
  price: number;
};

type Props = {
  products: Product[];
  onSelect?: (option: ShippingOption) => void;
};

export function ShippingCalculator({ products, onSelect }: Props) {
  const [cep, setCep] = useState("");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  function formatCep(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? d.replace(/(\d{5})(\d)/, "$1-$2") : d;
  }

  async function calculate() {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) { setError("CEP inválido"); return; }

    setLoading(true);
    setError("");
    setOptions([]);
    setSelected(null);

    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_cep: clean, products }),
      });
      const data = await res.json();

      if (data.error) { setError(data.error); }
      else if (data.options?.length === 0) {
        setError("Nenhuma opção de frete disponível para este CEP. Verifique o CEP ou entre em contato conosco.");
      }
      else { setOptions(data.options); }
    } catch {
      setError("Erro ao calcular frete.");
    }
    setLoading(false);
  }

  function handleSelect(opt: ShippingOption) {
    setSelected(opt.id);
    onSelect?.(opt);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Truck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && calculate()}
            placeholder="Digite seu CEP"
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition"
          />
        </div>
        <button
          onClick={calculate}
          disabled={loading}
          className="bg-primary text-white px-3 sm:px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2 shrink-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Calculando..." : "Calcular"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-sm transition ${
                selected === opt.id
                  ? "border-primary bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {opt.logo && (
                  <img src={opt.logo} alt={opt.company} className="w-8 h-8 object-contain shrink-0" />
                )}
                <div className="text-left min-w-0">
                  <p className="font-medium text-gray-900 truncate">{opt.company} - {opt.name}</p>
                  <p className="text-gray-500 text-xs">
                    {opt.delivery_time} {opt.delivery_time === 1 ? "dia útil" : "dias úteis"}
                  </p>
                </div>
              </div>
              <span className="font-bold text-primary shrink-0 ml-2">
                R$ {opt.price.toFixed(2).replace(".", ",")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
