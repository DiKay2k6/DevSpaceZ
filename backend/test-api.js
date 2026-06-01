const translate = require('google-translate-api-x');
translate('hello', {to: 'vi'}).then(res => console.log(res.text)).catch(e => console.error(e));
