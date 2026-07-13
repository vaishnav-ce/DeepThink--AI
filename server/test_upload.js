const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
fs.writeFileSync('/tmp/real.png', 'fake image content');
const form = new FormData();
form.append('file', fs.createReadStream('/tmp/real.png'), { filename: 'real.png', contentType: 'image/png' });

axios.post('http://127.0.0.1:5001/analyze', form, { headers: form.getHeaders() })
  .then(res => console.log(res.data))
  .catch(err => console.error(err.response ? err.response.data : err.message));
