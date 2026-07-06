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

const scrapeWeb = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    
    const articles = [];
    $('article, .post, .entry, h2, h3').slice(0, 10).each((i, el) => {
      const title = $(el).find('a').first().text().trim() || $(el).text().trim();
      const link = $(el).find('a').first().attr('href') || url;
      if (title && title.length > 10) {
        articles.push({ title, link, summary: '', publishedAt: new Date() });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Web scraping hatası:', error.message);
    return [];
  }
};

const scrapeSource = async (url) => {
  if (url.includes('rss') || url.includes('feed') || url.includes('xml')) {
    return await scrapeRSS(url);
  }
  return await scrapeWeb(url);
};

module.exports = { scrapeSource, scrapeRSS, scrapeWeb };