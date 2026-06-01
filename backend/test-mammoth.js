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
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun("Hello Center")]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun("Hello Right")]
                    })
                ]
            }
        ]
    });

    const buffer = await Packer.toBuffer(doc);
    
    const options = {
        transformDocument: mammoth.transforms.paragraph(function(paragraph) {
            if (paragraph.alignment === "center") {
                return {...paragraph, styleId: "AlignCenter", styleName: "AlignCenter"};
            } else if (paragraph.alignment === "right") {
                return {...paragraph, styleId: "AlignRight", styleName: "AlignRight"};
            } else if (paragraph.alignment === "both") {
                return {...paragraph, styleId: "AlignJustify", styleName: "AlignJustify"};
            }
            return paragraph;
        }),
        styleMap: [
            "p[style-name='AlignCenter'] => p.align-center",
            "p[style-name='AlignRight'] => p.align-right",
            "p[style-name='AlignJustify'] => p.align-justify"
        ]
    };

    mammoth.convertToHtml({buffer: buffer}, options).then(result => {
        let html = result.value;
        html = html.replace(/class="align-center"/g, 'style="text-align: center"');
        html = html.replace(/class="align-right"/g, 'style="text-align: right"');
        html = html.replace(/class="align-justify"/g, 'style="text-align: justify"');
        console.log("HTML:", html);
    }).catch(console.error);
}
main();
