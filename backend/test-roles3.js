const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/devspace')
  .then(async () => {
    const roles = await mongoose.connection.db.collection('roles').find({ organizationId: new mongoose.Types.ObjectId('6a117fcbb7daea75bcde0df7') }).toArray();
    console.log(roles.map(r => r.name));
    process.exit(0);
  });
