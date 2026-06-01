const html = `
<p>Here is some code:</p>
<pre><code>
{
    "_id": ObjectId,
    "name": "Esports Dashboard MERN"
}
</code></pre>
<p>End of code.</p>
`;

const placeholders = [];
let processedHtml = html.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
    placeholders.push(match);
    return `__CODE_BLOCK_${placeholders.length - 1}__`;
});

console.log(processedHtml);
console.log(placeholders);
