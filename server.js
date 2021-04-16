const mongoose = require("mongoose");
const app = require("./app");
const env = require("dotenv");

env.config({ path: `./config.env`, encoding: "utf-8" });

const connectionString = process.env.DB_CONNECTION.replace("<<PASSWORD>>", process.env.DB_PASSWORD)
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("we're connected!"))
    ;

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening in ${PORT}`)
});