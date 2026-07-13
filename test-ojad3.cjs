const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const res = await axios.get('https://www.gavo.t.u-tokyo.ac.jp/ojad/search/index/word:%E9%A3%9F%E3%81%B9%E3%82%8B');
  const $ = cheerio.load(res.data);
  
  $('#word_table tr').each((i, el) => {
    const midashi = $(el).find('.midashi_word').text();
    if (midashi) {
       console.log('midashi', midashi);
       const tds = $(el).find('td');
       console.log('td count', tds.length);
       tds.each((j, td) => {
         let text = '';
         $(td).find('.char').each((_, charEl) => {
             text += $(charEl).text();
         });
         console.log(j, text);
       })
    }
  });
}
test();
