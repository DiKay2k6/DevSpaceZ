const axios = require('axios');
async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/v1/tasks/6a11c89f52fb317214f768f9/requests', {
            type: 'Join',
            reason: 'Test reason'
        }, {
            headers: {
                Authorization: `Bearer YOUR_TOKEN_HERE` // Wait, I need a token!
            }
        });
        console.log(res.data);
    } catch(e) {
        console.log(e.response ? e.response.data : e.message);
    }
}
test();
