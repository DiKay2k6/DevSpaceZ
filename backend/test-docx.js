const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const { convertToHtml } = require('docx-html-converter');

async function main() {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Hello World",
                                color: "FF0000",
                                size: 28, // 14pt
                                font: "Arial"
                            })
                        ]
                    })
                ]
            }
        ]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync('test.docx', buffer);

    try {
        const html = await convertToHtml(new Uint8Array(buffer));
        console.log(html);
    } catch (e) {
        console.error(e);
    }
}
main();
