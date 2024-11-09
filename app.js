require('dotenv').config();
// const {createClient}=require("@supabase/supabase-js")
const express = require('express');
const app = express();
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const passport = require('passport');

const flash = require('connect-flash');

const mainRouter = require('./routes/mainRouter');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  expressSession({
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // ms
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

require('./passportconfig');
app.use(passport.session());

app.use(flash());

app.use(mainRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`App running on port ${PORT}`));
