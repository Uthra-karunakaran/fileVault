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
// const  fs =require('fs');
// const  path = require('path');
// const supabaseUrl = 'https://obgelvjksmzziicefptu.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY_SERVICE
// const supabase = createClient(supabaseUrl, supabaseKey)

// Function to upload file
// async function uploadFile() {
//   const { data, error } = await supabase
// .storage
// .listBuckets()
// const filePath = path.join(__dirname, 'uploads/git-img.jpg'); // Path to your file

// Read the file into a buffer
// const avatarFile = fs.readFileSync(filePath); // This will read the entire file into memory

// Upload the file
// const { data, error } = await supabase
//   .storage
//   .from('avatar') // Your bucket name
//   .upload('public/avatar1.png', avatarFile, {
//     cacheControl: '3600',
//     upsert: false
//   });

// const { data, error } = await supabase
// .storage
// .from('avatar')
// .download( 'public/avatar1.png')

// if (error) {
//   console.log('Error downloading file:', error);

// } else {
//   console.log('File download successfully:', data);
// File uploaded successfully: {
//   path: 'public/avatar1.png',
//   id: 'aa6e8ccf-f9e8-4578-84fe-5857f0ba31e5',
//   fullPath: 'avatar/public/avatar1.png'
// }
//   }
// }

// // Call the upload function
// uploadFile().then(() => {
//   console.log("Process finished");
// }).catch((err) => {
//   console.error('Error in processing:', err);
// });

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
