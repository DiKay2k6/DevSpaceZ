const fs = require('fs');
const { convert_docx_embed } = require('docx-html-converter');

async function main() {
    const buffer = fs.readFileSync('test.docx');
    try {
        const html = await convert_docx_embed(new Uint8Array(buffer));
        console.log(html);
    } catch (e) {
        console.error(e);
    }
}
main();
