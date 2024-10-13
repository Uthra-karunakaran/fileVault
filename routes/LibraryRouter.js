const libraryRouter = require('express').Router();
const upload = require('../multerConfig');
const queries = require('../queries');
const libraryController = require('../controllers/libraryController');

// prefixed with /library

libraryRouter.post(
  '/upload-file/:id',
  upload.single('avatar'),
  libraryController.postUploadFile
);
libraryRouter.post('/create-folder/:id', libraryController.postCreateFolder);

libraryRouter.get('/', libraryController.getLibrary);

module.exports = libraryRouter;
