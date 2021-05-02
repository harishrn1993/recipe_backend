const express = require('express');
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();

//Add global security middlewares
app.use(helmet()); //Sets http headers security

if (process.env.NODE_ENV === "developement") {
    app.use(morgan("dev")); //developement logging
}

const limiter = rateLimiter({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again from an hour!"
})
// app.use('/api', limiter); //adding limiter only to api routes

app.use(express.json({ limit: '500kb' })); //limit request's body size to 50kb

app.use(mongoSanitize()); //Sanitizes mongo nosql query injections

app.use(xss()) //sanitization against xss attack

//TODO need to add parameter pollution here

//test middleware
app.use((req, res, next) => {
    console.log(req.body);
    next();
})

//TODO add routes here
// console.log(require('./controllers/authController').signup.toString())
app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

//route that handles non existing routes  
app.all('*', (req, res, next) => {
    res.status(404).send("404! There is no endpoint");
    next();
})

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send('Something broke!')
})

module.exports = app;