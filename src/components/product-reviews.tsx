"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Review } from "@/lib/supabase";

function StarRating({ rating, onRate, interactive = false, size = 18 }: {
  rating: number;
  onRate?: (n: number) => void;
  interactive?: boolean;
  size?: number;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={`transition-colors ${
              n <= (hover || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadReviews();
    checkAuth();
  }, [productId]);

  async function loadReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  }

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("customers")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile) setUserName(profile.full_name);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || rating === 0) return;
    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      customer_id: userId,
      customer_name: userName,
      rating,
      comment: comment.trim(),
    });

    setSubmitting(false);
    if (error) {
      setSubmitError("Erro ao enviar avaliação. Tente novamente.");
      return;
    }
    setSubmitted(true);
    setShowForm(false);
    setRating(0);
    setComment("");
    loadReviews();
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Avaliações</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-gray-500">
                {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>
          )}
        </div>
        {userId && !showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-dark transition"
          >
            Avaliar
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sua nota</label>
            <StarRating rating={rating} onRate={setRating} interactive size={24} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comentário (opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition resize-none"
              placeholder="Conte sua experiência com o produto..."
            />
          </div>
          {submitError && (
            <p className="text-sm text-red-500">{submitError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Enviar Avaliação"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setRating(0); setComment(""); setSubmitError(""); }}
              className="text-sm text-gray-500 px-4 py-2.5 hover:text-gray-700 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700 font-medium">
          Avaliação enviada com sucesso!
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">{review.customer_name}</span>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : !showForm && (
        <p className="text-sm text-gray-400 text-center py-4">
          Nenhuma avaliação ainda. {userId ? "Seja o primeiro a avaliar!" : "Faça login para avaliar."}
        </p>
      )}
    </div>
  );
}
