const { genPassword } = require('../passwordUtils');
const auth = require('../authMiddleWare');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const queries = require('../queries');
const passport = require('passport');

const validateUserInputs = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[\W_]/)
    .withMessage('Password should at least contain one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      console.log(value, req.body.password);
      throw new Error('confirm Password must match password');
    }
    return true;
  }),
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .custom(async (value, { req }) => {
      const res = await prisma.user.findUnique({
        where: {
          username: `${value}`,
        },
      });

      if (res) {
        throw new Error('Username already exists');
      }
      return true;
    }),
];

exports.getHome = asyncHandler(async (req, res) => {
  res.render('layout.ejs', {
    title: 'Home',
    body: 'home',
    headerNav: 'header',
    nav: 'nav-register',
  });
});
exports.getSignUp = asyncHandler(async (req, res) => {
  res.render('layout.ejs', {
    title: 'Sign Up',
    body: 'signup',
    formData: {},
    headerNav: 'header',
    nav: 'nav-register',
  });
});

exports.postSignUp = [
  validateUserInputs,
  asyncHandler(async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.render('layout.ejs', {
        title: 'Sign Up',
        body: 'signup',
        errors: err.array(),
        formData: req.body,
        headerNav: 'header',
        nav: 'nav-register',
      });
      // return res.render("signup",{
      //     errors:err.array(),
      //     formData:req.body,
      // })
    }

    console.log(req.body);
    const hashedPassword = await genPassword(req.body.password);

    await queries.createUser(req.body.username, hashedPassword);
    res.redirect('/login');
    // res.redirect("/login");
  }),
];

exports.getLogin = asyncHandler(async (req, res) => {
  // Retrieve formData from flash messages
  const formData = req.flash('formData')[0] || {};
  const messages = req.flash(); // Fetch all flash messages

  res.render('layout.ejs', {
    title: 'Login',
    body: 'login',
    messages,
    formData,
    headerNav: 'header',
    nav: 'nav-register',
  });
});

exports.postLogin = asyncHandler(async (req, res, next) => {
  // Capture form data
  req.flash('formData', req.body);
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    // if (!user) { return res.redirect('/login'); }
    if (!user) {
      req.flash('error', info.message || 'Login failed'); // Set the error message
      return res.redirect('/login');
    }

    // Logic to create a library for the user if it doesn't exist
    // Example:
    // await createLibraryForUser(user.id);

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/library');
    });
  })(req, res, next);
});

exports.getLogout = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      return err;
    }
    // res.redirect('/login');
    res.redirect('/login');
  });
});
// req.flash() are meant to be accessed only once so don't
// console.log(req.flash()) , it will coz a problem
exports.getProtected = asyncHandler(async (req, res) => {
  console.log(req.user);
  res.render('layout.ejs', {
    title: 'Home',
    body: 'home',
    headerNav: 'header',
    nav: 'nav-auth',
    username: req.user.username,
  });
});

exports.getStarted=asyncHandler(async(req,res)=>{
  if(req.user){
    console.log("user loged in here is the info")
    console.log(req.user);
    res.redirect("/library")
    return
  }else{
   console.log("user not loged in"); 
   res.redirect("/login")
  }
  
})