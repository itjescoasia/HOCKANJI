const axios = require('axios');
axios.post('http://localhost:3000/api/generate-vocab', { word: '食べる' })
  .then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.error(err.message));
