const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Passutils = require('./passwordUtils');

// to get an user verified for login
passport.use(
  new LocalStrategy(async (username, password, done) => {
    console.log('LocalStrategy called');
    try {
      // Fetch user by username using Prisma
      const user = await prisma.user.findUnique({
        where: { username: username },
      });

      if (!user) {
        return done(null, false, {
          message: 'Incorrect username or user does not exist',
        });
      }
      console.log(password, user.password);
      const isMatch = await Passutils.ValidPassword(password, user.password);
      console.log(isMatch);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Fetch user by ID using Prisma
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
