const express = require('express');
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

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
app.use('/api', limiter); //adding limiter only to api routes

app.use(express.json({ limit: '50kb' })); //limit request's body size to 50kb

app.use(mongoSanitize()); //Sanitizes mongo nosql query injections

app.use(xss()) //sanitization against xss attack

//TODO need to add parameter pollution here

//TODO add routes here

//route that handles non existing routes  
app.use('*', (req, res, next) => {
    res.status(404).send("404! There is no endpoint");
    next();
})

module.exports = app;