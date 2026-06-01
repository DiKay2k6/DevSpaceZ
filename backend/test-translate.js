const translate = require('google-translate-api-x');

async function main() {
    const htmlWithNoTranslate = '<p>The <span translate="no">Frontend</span> connects to the <span translate="no">Server</span> using an <span translate="no">API</span>.</p>';
    
    try {
        const res = await translate(htmlWithNoTranslate, {to: 'vi'});
        console.log("Translated:", res.text);
    } catch (e) {
        console.error(e);
    }
}
main();
