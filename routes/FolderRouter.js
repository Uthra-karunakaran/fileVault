const folderRouter = require('express').Router();
const upload = require('../multerConfig');
const queries = require('../queries');
const folderController = require('../controllers/folderController');

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

// pre path /folder

// to edit the folder name uses params
// `/folder/edit/${id}`
folderRouter.post('/edit/:id', folderController.postEditFolder);

// to delete the entire folder uses params

folderRouter.post('/delete/:id', folderController.postDeleteFolder);

// to create  folder in parent folder
folderRouter.post('/create-folder/:id', folderController.postCreateFolder);

// to upload file to folder
folderRouter.post(
  '/upload-file/:id',
  upload.single('avatar'),
  folderController.postUploadFolder
);

// to view a folder
folderRouter.get('/:id', folderController.getViewFolder);

module.exports = folderRouter;
