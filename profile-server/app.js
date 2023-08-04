/** ***************************************************************
* Copyright 2020 Advanced Distributed Learning (ADL)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**************************************************************** */
const express = require('express');
const serverSession = require('express-session');
const { xss } = require("express-xss-sanitizer");
const path = require('path');
const favicon = require('serve-favicon');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const redisHelper = require("./server/utils/redis");

let RedisStore = require("connect-redis")(serverSession);
let redisClient = redisHelper.createClient();

require('dotenv').config();

const app = express();


// view engine setup
app.set('views', path.join(process.cwd(), 'server', 'views'));
app.set('view engine', 'hjs');

// Required for the rate limiter
app.set('trust proxy', 1);

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const cookieSecret = (process.env.COOKIE_SECRET || "some-long-string-123");

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(xss());
app.use(cookieParser(cookieSecret));
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(express.static(path.join(__dirname, 'client', 'public')));
app.use(compression());

app.use(serverSession({
    name: 'profileSession', // stop colliding with other  projects
    secret: cookieSecret,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    store: new RedisStore({
        client: redisClient
    }),
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const csurf = require("csurf");
const helmet = require("helmet");

const REQUIRE_TOKEN_FOR_APP_API = true;
const REQUIRE_TOKEN_FOR_EVERYTHING = false;

const csrfProtection = (requireForGet = false) => (req, res, next) => {

    const alwaysIgnoredHeaders = ["OPTIONS", "HEAD"];
    const mostlyIgnoredHeaders = ["OPTIONS", "HEAD", "GET"];

    let csurfArgs = {
        cookie: true,
        ignoreMethods: requireForGet ? alwaysIgnoredHeaders : mostlyIgnoredHeaders
    };

    csurf(csurfArgs)(req, res, function(err) {
        if (err)
            res.status(400).send("Unauthorized Request.");
        else
            next();
    });
};

// rewrite '/profile/:uuid' to route to either the UI or the API
app.use(async (req, res, next) => {
    if (req.url.startsWith('/profile')) {
        if (req.header('content-type') === "application/json") {
            req.url = `/api${req.url}`;
        }
    }
    next();
});

app.use(csrfProtection(REQUIRE_TOKEN_FOR_EVERYTHING));
app.get("/csrf", csrfProtection(REQUIRE_TOKEN_FOR_EVERYTHING), (req, res, next) => {
    res.json({
        token: req.csrfToken()
    });
});

app.use('/app', csrfProtection(REQUIRE_TOKEN_FOR_APP_API), helmet(), require('./server/routes/appApi.js'));
app.use('/api', require('./server/routes/publicApi.js'));
app.get('*', csrfProtection(REQUIRE_TOKEN_FOR_EVERYTHING), helmet(), (req, res, next) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
        // res.status(err.status || 500).send({
        //     success: false,
        //     message: err.message,
        // });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
    });
});


module.exports = app;
