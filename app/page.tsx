"use client";

import React, { useState, useMemo } from 'react';
import { Search, TrendingDown, ShieldCheck, Zap, Heart, Bell } from 'lucide-react';

// 型の定義
interface Item {
  platform: string;
  name: string;
  price: number;
  url: string;
  image: string;
  benefit: string;
  color: string;
}

export default function PriceChecker() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // 最安値計算
  const minPrice = useMemo(() => {
    const validPrices = results.map(r => r.price).filter(p => p > 0);
    return validPrices.length ? Math.min(...validPrices) : null;
  }, [results]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-black mb-4">プライスチェッカー</h1>
          <p className="text-blue-100 mb-8 italic">「どこで買うのが正解か」を瞬時に判断</p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              className="w-full p-4 pl-6 pr-16 rounded-full text-slate-900 shadow-xl focus:ring-4 focus:ring-blue-400 outline-none"
              placeholder="商品名を入力（例：iPhone 15）"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors">
              <Search className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-10 px-4">
        {loading ? (
          <div className="text-center py-20 text-blue-600 font-bold animate-bounce">
            各サイトの価格を調査しています...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {results.map((item, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-3xl p-6 border-2 transition-all hover:shadow-2xl ${item.price === minPrice && item.price > 0 ? 'border-yellow-400 scale-105 shadow-xl' : 'border-transparent shadow-md'}`}
              >
                {item.price === minPrice && item.price > 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                    最安値・今が買い時！
                  </div>
                )}
                
                <div className={`${item.color} text-white text-[10px] font-bold px-2 py-1 rounded inline-block mb-3`}>{item.platform}</div>
                {item.image && (
                  <img src={item.image} className="w-full h-40 object-contain mb-4" alt={item.name} />
                )}
                <h3 className="font-bold text-xs h-8 line-clamp-2 mb-2">{item.name}</h3>
                <div className="text-2xl font-black mb-4">
                  {item.price > 0 ? `¥${item.price.toLocaleString()}` : '価格情報なし'}
                </div>

                <div className="flex items-start gap-2 text-[10px] bg-slate-50 p-2 rounded-lg mb-4 text-slate-600">
                  <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                  <span>{item.benefit}</span>
                </div>

                <div className="flex gap-2">
                  <a href={item.url} target="_blank" className="flex-1 bg-slate-900 text-white text-center py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" /> ショップへ
                  </a>
                  <button className="p-3 border rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}