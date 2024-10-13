const userRouter = require('express').Router();
const userController = require('../controllers/userController');

const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .send(
        `<h4>Hey your are not authenticated </h4> <a href="/login">login</a>`
      );
  }
};

userRouter.get('/', userController.getHome);

userRouter.get('/sign-up', userController.getSignUp);

userRouter.post('/sign-up', userController.postSignUp);

userRouter.get('/login', userController.getLogin);

userRouter.post('/login', userController.postLogin);

userRouter.get('/logout', userController.getLogout);
userRouter.get('/get-started',userController.getStarted)

userRouter.get('/homeProtected', isAuth, userController.getProtected);
module.exports = userRouter;
