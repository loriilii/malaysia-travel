// /api/bot-rate.js
// Vercel Serverless Function：伺服器端代為抓取「台灣銀行」牌告匯率 CSV，
// 因為銀行網站不開放瀏覽器端跨網域 (CORS) 直接抓取，所以改由後端 (Node) 代抓，
// 前端只需呼叫同網域的 /api/bot-rate 即可，不會有 CORS 問題。
//
// 資料來源：https://rate.bot.com.tw/xrt/flcsv/0/day (台灣銀行官方公開 CSV 下載連結)

export default async function handler(req, res) {
  try {
    const response = await fetch('https://rate.bot.com.tw/xrt/flcsv/0/day', {
      headers: {
        // 台灣銀行網站對非瀏覽器的請求（例如沒有 User-Agent 的伺服器端請求）常會擋下或回傳錯誤頁，
        // 這裡偽裝成一般瀏覽器，避免被擋。
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/csv,text/plain,*/*'
      }
    });

    if (!response.ok) {
      res.status(502).json({ error: `Bank of Taiwan 回應異常 (HTTP ${response.status})` });
      return;
    }

    const text = await response.text();
    // 去除檔案開頭的 BOM，並依行拆分
    const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
    const myrLine = lines.find((line) => line.startsWith('MYR,'));

    if (!myrLine) {
      // 找不到 MYR 這一行時，回傳一小段原始回應內容方便除錯 (例如台銀改回錯誤頁、格式變動等)
      res.status(404).json({
        error: '在台灣銀行資料中找不到馬來幣 (MYR)',
        debugPreview: text.slice(0, 300),
        debugLineCount: lines.length
      });
      return;
    }

    const cols = myrLine.split(',');
    // CSV 欄位順序: MYR,本行買入,現金,即期,...(遠期),本行賣出,現金,即期,...(遠期)
    // index:        0    1     2   3              10    11    12
    const cashBuy = parseFloat(cols[2]);   // 現金匯率-本行買入：你拿 MYR 現鈔換回台幣，銀行付你的價格
    const cashSell = parseFloat(cols[11]); // 現金匯率-本行賣出：你拿台幣跟銀行買 MYR 現鈔，你要付的價格

    if (!cashBuy || !cashSell) {
      res.status(502).json({ error: '台灣銀行目前未提供 MYR 現金匯率報價' });
      return;
    }

    // 邊緣快取 30 分鐘，減少對台灣銀行網站的重複請求
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      currency: 'MYR',
      cashBuy,   // 本行買入 (您賣出 MYR 現鈔換台幣時的匯率)
      cashSell,  // 本行賣出 (您買入 MYR 現鈔要付的匯率)
      source: '臺灣銀行 (Bank of Taiwan)',
      fetchedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: '伺服器抓取台灣銀行匯率時發生錯誤', detail: String(err) });
  }
}
