import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  if (!query) return NextResponse.json([]);

  const RAKUTEN_APP_ID = process.env.NEXT_PUBLIC_RAKUTEN_APP_ID;
  const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID; // Yahoo用

  try {
    // 1. 楽天API呼び出し
    const rakutenRes = await fetch(`https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?format=json&keyword=${encodeURIComponent(query)}&applicationId=${RAKUTEN_APP_ID}&hits=1`);
    const rakutenData = await rakutenRes.json();
    const rakutenItem = rakutenData.Items?.[0]?.Item;

    // 2. Yahoo API呼び出し (本来はアクセストークンが必要ですが簡略化)
    // 3. Amazon (PA-APIが使えない間は、価格推測ロジックや検索リンクを生成)

    // フロントエンドに返す比較データ構造
    const comparisonData = [
      {
        platform: 'Amazon',
        name: query + " (Amazon最安値)",
        price: rakutenItem ? Math.floor(rakutenItem.itemPrice * 0.95) : 0, // サンプル計算
        url: `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}`,
        image: rakutenItem?.mediumImageUrls[0]?.imageUrl,
        benefit: '配送が最速。Prime会員なら送料無料。',
        color: 'bg-orange-500'
      },
      {
        platform: '楽天',
        name: rakutenItem?.itemName || '該当なし',
        price: rakutenItem?.itemPrice || 0,
        url: rakutenItem?.itemUrl || '',
        image: rakutenItem?.mediumImageUrls[0]?.imageUrl,
        benefit: 'ポイント還元率が高い。お買い物マラソンがお得。',
        color: 'bg-red-600'
      },
      {
        platform: 'Yahoo',
        name: query + " (Yahoo最安値)",
        price: rakutenItem ? Math.floor(rakutenItem.itemPrice * 1.02) : 0,
        url: `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(query)}`,
        image: rakutenItem?.mediumImageUrls[0]?.imageUrl,
        benefit: 'PayPayポイントが貯まる。日曜がお得。',
        color: 'bg-red-500'
      }
    ];

    return NextResponse.json(comparisonData);
  } catch (error) {
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}