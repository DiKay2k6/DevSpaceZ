const mammoth = require('mammoth');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');

async function main() {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Hello Red 14pt",
                                color: "FF0000",
                                size: 28, // 14pt
                            })
                        ]
                    })
                ]
            }
        ]
    });

    const buffer = await Packer.toBuffer(doc);
    
    const options = {
        transformDocument: function(element) {
            if (element.type === "run") {
                console.log("RUN:", element);
            }
            if (element.children) {
                element.children.forEach(options.transformDocument);
            }
            return element;
        }
    };

    mammoth.convertToHtml({buffer: buffer}, options).then(result => {
        console.log("HTML:", result.value);
    }).catch(console.error);
}
main();
