const translate = require('google-translate-api-x');

async function main() {
    const htmlWithPlaceholders = '<p>The __IT_TERM_0__ connects to the __IT_TERM_1__ using an __IT_TERM_2__.</p>';
    
    try {
        const res = await translate(htmlWithPlaceholders, {to: 'vi'});
        console.log("Translated:", res.text);
    } catch (e) {
        console.error(e);
    }
}
main();
