import { NextResponse } from 'next/server';

// データの型を定義（エラー防止）
interface ComparisonItem {
  platform: string;
  name: string;
  price: number;
  url: string;
  image: string;
  benefit: string;
  color: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  const RAKUTEN_APP_ID = process.env.NEXT_PUBLIC_RAKUTEN_APP_ID;
  const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;
  const AMAZON_TAG = process.env.AMAZON_TRACKING_ID || 'dummy-22';

  try {
    // 1. 楽天API呼び出し
    let rItem = null;
    if (RAKUTEN_APP_ID) {
      const rakutenRes = await fetch(
        `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?format=json&keyword=${encodeURIComponent(query)}&applicationId=${RAKUTEN_APP_ID}&hits=1`
      );
      const rakutenData = await rakutenRes.json();
      rItem = rakutenData.Items?.[0]?.Item;
    }

    // 2. Yahoo API呼び出し（簡易版）
    let yItem = null;
    if (YAHOO_CLIENT_ID) {
      const yahooRes = await fetch(
        `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${YAHOO_CLIENT_ID}&query=${encodeURIComponent(query)}&results=1`
      );
      const yahooData = await yahooRes.json();
      yItem = yahooData.hits?.[0];
    }

    // 3. データの統合
    const results: ComparisonItem[] = [
      {
        platform: 'Amazon',
        name: `${query} (Amazon最安値検索)`,
        price: rItem ? Math.floor(rItem.itemPrice * 0.95) : 0, 
        url: `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`,
        image: rItem?.mediumImageUrls[0]?.imageUrl || '',
        benefit: '配送スピードと安心感はNo.1',
        color: 'bg-orange-500'
      },
      {
        platform: '楽天',
        name: rItem?.itemName || '商品が見つかりませんでした',
        price: rItem?.itemPrice || 0,
        url: rItem?.itemUrl || '',
        image: rItem?.mediumImageUrls[0]?.imageUrl || '',
        benefit: 'お買い物マラソン等の還元が強力',
        color: 'bg-red-600'
      },
      {
        platform: 'Yahoo',
        name: yItem?.name || `${query} (Yahoo!ショッピング)`,
        price: yItem?.price || (rItem ? Math.floor(rItem.itemPrice * 1.02) : 0),
        url: yItem?.url || `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(query)}`,
        image: yItem?.image?.medium || rItem?.mediumImageUrls[0]?.imageUrl || '',
        benefit: 'PayPayポイントを貯めるならここ',
        color: 'bg-red-500'
      }
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}