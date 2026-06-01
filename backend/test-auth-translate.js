const jwt = require('jsonwebtoken');

async function main() {
    const token = jwt.sign({ id: '6a07665f06afeb6a627bfcec' }, 'devspace_super_secret_key_2026', { expiresIn: '1h' });
    const hugeHtml = '<p>hello</p>'.repeat(100); // 1200 chars

    try {
        const res = await fetch('http://localhost:5001/api/v1/documents/translate', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                html: hugeHtml,
                to: 'vi'
            })
        });
        const text = await res.text();
        console.log(res.status, text);
    } catch (e) {
        console.error(e);
    }
}
main();
