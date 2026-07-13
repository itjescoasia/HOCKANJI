const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const res = await axios.get('https://www.gavo.t.u-tokyo.ac.jp/ojad/search/index/word:%E9%A3%9F%E3%81%B9%E3%82%8B');
  const $ = cheerio.load(res.data);
  
  $('#word_table tr').eq(2).find('td').each((i, el) => {
    // print the raw HTML of the cell to see if kanji is present
    console.log('TD', i, $(el).html().replace(/\\s+/g, ' '));
  });
}
test();
