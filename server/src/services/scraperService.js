const axios = require('axios');
const cheerio = require('cheerio');
const RSSParser = require('rss-parser');

const parser = new RSSParser();

const scrapeRSS = async (url) => {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      summary: item.contentSnippet || item.content || '',
      publishedAt: item.pubDate
    }));
  } catch (error) {
    console.error('RSS parse hatası:', error.message);
    return [];
  }
};

// Kullanıcının verdiği düz URL'nin arkasında gizli bir RSS feed'i var mı, otomatik bul
const findRSSFeed = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000
    });
    const $ = cheerio.load(data);

    // 1. Yöntem: standart <link rel="alternate"> etiketi
    const directLink = $('link[type="application/rss+xml"], link[type="application/atom+xml"]').first().attr('href');
    if (directLink) return new URL(directLink, url).href;

    // 2. Yöntem: sayfada "rss" geçen bir link (genelde footer'da) bul, o sayfaya gidip
    // kategoriye uygun feed linkini ara
    const rssDirectoryHref = $('a[href*="rss" i]').first().attr('href');
    if (!rssDirectoryHref) return null;

    const rssDirectoryUrl = new URL(rssDirectoryHref, url).href;
    const { data: directoryData } = await axios.get(rssDirectoryUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000
    });
    const $$ = cheerio.load(directoryData);

    // URL'deki son parça (örn. "voleybol") ile eşleşen bir feed linki ara
    const urlSlug = new URL(url).pathname.split('/').filter(Boolean).pop();
    let matchedFeed = null;

    $$('a[href*="rss" i], a[href*="feed" i]').each((i, el) => {
      const href = $$(el).attr('href');
      if (href && urlSlug && href.toLowerCase().includes(urlSlug.toLowerCase())) {
        matchedFeed = new URL(href, rssDirectoryUrl).href;
      }
    });

    return matchedFeed;
  } catch (error) {
    return null;
  }
};

const scrapeSource = async (url) => {
  if (url.includes('rss') || url.includes('feed') || url.includes('xml')) {
    return await scrapeRSS(url);
  }

  // Düz URL verildiyse, sayfanın gizli RSS feed'ini otomatik bulmayı dene
  const discoveredFeed = await findRSSFeed(url);
  if (discoveredFeed) {
    console.log(`RSS feed otomatik bulundu: ${discoveredFeed}`);
    return await scrapeRSS(discoveredFeed);
  }

  // Güvenilir bir kaynak bulunamadı — sessizce kalitesiz veri döndürmek yerine boş dön
  console.log(`Bu kaynak için RSS bulunamadı, desteklenmiyor: ${url}`);
  return [];
};

module.exports = { scrapeSource, scrapeRSS };