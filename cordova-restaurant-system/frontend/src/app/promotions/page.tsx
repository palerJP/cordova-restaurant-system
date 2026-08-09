'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Tag, Calendar, Store, ArrowRight, X, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import type { Promotion } from '@/lib/types';

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  useEffect(() => {
    api
      .get('/api/promotions?limit=30', { auth: false })
      .then((res) => setPromotions(res.data))
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <div className="flex items-center gap-2 text-cordova-gold mb-2 font-mono text-xs font-bold uppercase tracking-wider">
          <Tag size={16} /> Exclusive Dining Deals
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
          Active Promotions & Special Offers
        </h1>
        <p className="text-stone-500 text-sm mt-1 max-w-2xl">
          Discover current discounts and perks offered by accredited restaurants in Cordova, Cebu. Offers automatically update in real-time.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-12 text-center text-stone-500 max-w-lg mx-auto">
          <p className="text-4xl mb-3">🎁</p>
          <p className="font-serif font-bold text-xl text-stone-800 dark:text-stone-200 mb-1">
            No active promotions right now
          </p>
          <p className="text-xs text-stone-500">
            Check back soon or explore accredited restaurants across Cordova!
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-xs font-bold text-cordova-green hover:underline"
          >
            ← Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((p) => {
            const endDateObj = new Date(p.end_date);
            const formattedEndDate = endDateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPromo(p)}
                className="group cursor-pointer bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 hover:shadow-xl transition-all duration-300 hover:border-cordova-gold relative"
              >
                {p.image_url ? (
                  <div className="relative h-40 sm:h-auto sm:w-44 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800">
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-28 sm:h-auto sm:w-36 rounded-xl shrink-0 bg-amber-500/10 dark:bg-amber-500/20 flex flex-col items-center justify-center text-cordova-gold p-4 text-center">
                    <Tag size={32} />
                    <span className="text-xs font-bold mt-1">Special Deal</span>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Store size={14} className="text-cordova-green shrink-0" />
                      <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {p.restaurant_name}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white group-hover:text-cordova-green transition-colors leading-tight">
                      {p.title}
                    </h3>

                    {p.discount_label && (
                      <span className="inline-block bg-cordova-gold/15 text-cordova-gold text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">
                        {p.discount_label}
                      </span>
                    )}

                    {p.description && (
                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-stone-400" />
                      <span>Valid until <strong>{formattedEndDate}</strong></span>
                    </div>
                    <span className="font-semibold text-cordova-green group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View Deal <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROMOTION DETAIL MODAL */}
      <Modal open={!!selectedPromo} onClose={() => setSelectedPromo(null)} title="">
        {selectedPromo && (
          <div className="space-y-5">
            {selectedPromo.image_url && (
              <div className="relative h-48 w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                <Image
                  src={selectedPromo.image_url}
                  alt={selectedPromo.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cordova-green uppercase tracking-wider">
                <Store size={15} /> {selectedPromo.restaurant_name}
              </div>

              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                {selectedPromo.title}
              </h2>

              {selectedPromo.discount_label && (
                <div className="inline-flex items-center gap-1.5 bg-cordova-gold text-white text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                  <Sparkles size={14} /> {selectedPromo.discount_label}
                </div>
              )}

              {selectedPromo.description && (
                <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-xl border border-stone-200 dark:border-stone-700/60 text-xs text-stone-700 dark:text-stone-200 leading-relaxed">
                  <p className="font-semibold mb-1 text-stone-900 dark:text-white">Promotion Terms & Details:</p>
                  <p>{selectedPromo.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                <Calendar size={15} className="text-stone-400" />
                <span>Valid: <strong>{selectedPromo.start_date}</strong> to <strong>{selectedPromo.end_date}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex gap-3">
              <button
                onClick={() => {
                  const slug = selectedPromo.restaurant_slug;
                  setSelectedPromo(null);
                  router.push(`/restaurants/${slug}`);
                }}
                className="flex-1 bg-cordova-green hover:bg-cordova-greenHover text-white text-xs font-bold py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                Visit {selectedPromo.restaurant_name} Page <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
