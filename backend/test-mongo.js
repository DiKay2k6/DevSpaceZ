const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/devspace');
    const db = mongoose.connection.db;
    const docs = await db.collection('documents').find({}).sort({createdAt: -1}).limit(1).toArray();
    if (docs.length > 0) {
        console.log("Title:", docs[0].title);
        console.log("Content length:", docs[0].content ? docs[0].content.length : 'undefined');
        console.log("Content snippet:", docs[0].content ? docs[0].content.substring(0, 200) : 'none');
    } else {
        console.log("No documents found");
    }
    mongoose.disconnect();
}
test();
