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
                                text: "Hello 14pt",
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
        transformDocument: mammoth.transforms.run(function(run) {
            if (run.fontSize) {
                return {...run, styleId: `FontSize${run.fontSize}`, styleName: `FontSize${run.fontSize}`};
            }
            return run;
        }),
        styleMap: [
            "r[style-name='FontSize14'] => span.font-size-14"
        ]
    };

    mammoth.convertToHtml({buffer: buffer}, options).then(result => {
        console.log("HTML:", result.value);
    }).catch(console.error);
}
main();
