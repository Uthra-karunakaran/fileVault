const folderRouter = require('./FolderRouter');
const fileRouter = require('./FileRouter');
const libraryRouter = require('./LibraryRouter');
const userRouter = require('./UserRouter');

const mainRouter = require('express').Router();
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
    // res
    //   .status(401)
    //   .send(
    //     `<h4>Hey your are not authenticated now 34352345</h4> <a href="/login">login</a>`
    //   );
  }
};
mainRouter.use('/folder', isAuth, folderRouter);
mainRouter.use('/file', isAuth, fileRouter);
mainRouter.use('/library', isAuth, libraryRouter);
mainRouter.use(userRouter);

module.exports = mainRouter;
