const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

async function main() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('devspace');
    const user = await db.collection('users').findOne({});
    if (!user) {
        console.error("No user found");
        return;
    }
    
    const doc = await db.collection('documents').findOne({});
    if (!doc) {
        console.error("No document found");
        return;
    }
    
    console.log("Found document length:", doc.content ? doc.content.length : 0);
    
    const token = jwt.sign({ id: user._id.toString() }, 'devspace_super_secret_key_2026', { expiresIn: '1h' });
    try {
        const res = await fetch('http://localhost:5001/api/v1/documents/translate', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                html: doc.content || '<p></p>',
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
