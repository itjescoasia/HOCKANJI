const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const res = await axios.get('https://www.gavo.t.u-tokyo.ac.jp/ojad/search/index/word:%E9%A3%9F%E3%81%B9%E3%82%8B');
  const $ = cheerio.load(res.data);
  
  const tables = $('#word_table');
  console.log('Tables found:', tables.length);
  
  $('#word_table tr').each((i, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) console.log('ROW', i, text);
  });
}
test();
