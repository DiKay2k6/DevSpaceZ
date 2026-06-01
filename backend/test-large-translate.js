const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

async function main() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('devspace');
    const user = await db.collection('users').findOne({});
    
    // Create a 6000 character HTML string
    const largeHtml = '<p>The Frontend connects to the Backend.</p>'.repeat(150);
    console.log("Testing with length:", largeHtml.length); // 44 * 150 = 6600
    
    const token = jwt.sign({ id: user._id.toString() }, 'devspace_super_secret_key_2026', { expiresIn: '1h' });
    try {
        const res = await fetch('http://localhost:5001/api/v1/documents/translate', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                html: largeHtml,
                to: 'vi'
            })
        });
        const text = await res.text();
        console.log(res.status, text.substring(0, 500));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
main();
