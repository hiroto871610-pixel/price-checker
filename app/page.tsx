"use client";
import { useState, useMemo } from 'react';
import { Search, TrendingDown, ShieldCheck, Zap, Heart, Bell } from 'lucide-react';

export default function PriceChecker() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 最安値の判定
  const minPrice = useMemo(() => {
    const prices = results.map(r => r.price).filter(p => p > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [results]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ヒーローセクション */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">プライスチェッカー</h1>
          <p className="text-blue-100 text-lg mb-8 text-balance">Amazon・楽天・Yahoo!の価格をリアルタイム比較。一番賢い買い物をサポート。</p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <input
              type="text"
              className="w-full p-5 pl-8 pr-20 rounded-full text-slate-900 text-xl shadow-2xl focus:ring-4 focus:ring-blue-400 outline-none transition-all"
              placeholder="商品名や型番を入力..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors flex items-center shadow-md">
              <Search className="w-6 h-6" />
            </button>
          </form>
          
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {['家電', 'ファッション', 'コスメ', 'ゲーム'].map(tag => (
              <button key={tag} onClick={() => {setQuery(tag);}} className="bg-white/10 hover:bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur-sm border border-white/20 transition">
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto py-12 px-4">
        {loading && <div className="text-center text-2xl animate-pulse font-bold text-blue-600">最安値を調査中...</div>}

        {results.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingDown className="text-green-500" /> 比較結果
              </h2>
              <span className="text-sm text-slate-500">※価格はリアルタイムです</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {results.map((item, idx) => (
                <div key={idx} className={`relative bg-white rounded-3xl p-6 shadow-xl border-2 transition-transform hover:-translate-y-2 ${item.price === minPrice ? 'border-yellow-400' : 'border-transparent'}`}>
                  {item.price === minPrice && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider">最安値・買い時！</span>
                  )}
                  
                  <div className={`${item.color} text-white text-[10px] font-bold px-3 py-1 rounded-md inline-block mb-4`}>{item.platform}</div>
                  <img src={item.image} className="w-full h-48 object-contain mb-6 mix-blend-multiply" alt={item.name} />
                  <h3 className="font-bold text-sm mb-2 line-clamp-2 h-10">{item.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-black text-slate-900">¥{item.price.toLocaleString()}</span>
                    <span className="text-sm text-slate-400 ml-1">(税込)</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{item.benefit}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a href={item.url} target="_blank" className="flex-1 bg-slate-900 text-white text-center py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" /> ショップへ
                    </a>
                    <button className="p-3 border rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 価格推移・通知（プレースホルダー） */}
            <section className="bg-blue-50 rounded-3xl p-8 border border-blue-100 mt-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2 italic">
                    <Bell className="text-blue-600" /> 値下がり通知を受け取る
                  </h3>
                  <p className="text-slate-600">この商品の価格が下がった時にLINEやメールで速報を届けます。</p>
                </div>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-md hover:shadow-xl transition">
                  通知をオンにする
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* フッター（アフィリエイト用） */}
      <footer className="bg-white border-t py-12 px-4 mt-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="font-bold text-lg mb-2">もっとお得に買い物するなら</h4>
            <p className="text-slate-500 text-sm">楽天カード新規入会で、楽天ポイントが最大5,000ポイントもらえます。比較サイト経由の作成が一番お得！</p>
          </div>
          <div className="flex justify-end">
            <a href="#" className="bg-red-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-red-700 transition">
              楽天カードを申し込む（広告）
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}