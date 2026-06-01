const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/devspace', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const roles = await mongoose.connection.db.collection('roles').find({}).toArray();
    console.log(JSON.stringify(roles, null, 2));
    process.exit(0);
  });
