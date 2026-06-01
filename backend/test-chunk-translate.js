const translate = require('google-translate-api-x');

function chunkHtml(html, maxChunkSize = 4000) {
    const chunks = [];
    let currentChunk = "";
    
    const blocks = html.split(/(<\/(?:p|h1|h2|h3|h4|h5|h6|li|tr|div)>)/g);
    
    for (let i = 0; i < blocks.length; i += 2) {
        const text = blocks[i];
        const tag = blocks[i + 1] || "";
        const block = text + tag;
        
        if (currentChunk.length + block.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = block;
        } else {
            currentChunk += block;
        }
    }
    
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
}

async function main() {
    const largeHtml = '<p>The Frontend connects to the Backend.</p>'.repeat(150); // ~6600 chars
    const chunks = chunkHtml(largeHtml, 4000);
    
    console.log(`Generated ${chunks.length} chunks.`);
    
    let translatedHtml = "";
    try {
        for (const chunk of chunks) {
            console.log("Translating chunk length:", chunk.length);
            const translateRes = await translate(chunk, { to: 'vi' });
            translatedHtml += translateRes.text;
        }
        console.log("Success! Final length:", translatedHtml.length);
    } catch (e) {
        console.error("FAILED:", e.message);
    }
}
main();
