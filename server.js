const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');

mongoose.connect(process.env.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

app.listen(process.argv[2] || process.env.PORT || 3005);
console.log('server started');
