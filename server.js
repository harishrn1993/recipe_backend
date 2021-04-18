const mongoose = require('mongoose');
const env = require('dotenv');
const app = require('./app');

env.config({ path: `./config.env`, encoding: 'utf-8' });

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const connectionString = process.env.DB_CONNECTION.replace(
    '<<PASSWORD>>',
    process.env.DB_PASSWORD
);
mongoose
    .connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("we're connected!"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening in ${PORT}`);
});
