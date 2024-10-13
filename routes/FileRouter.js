const fileRouter = require('express').Router();
const upload = require('../multerConfig');
const queries = require('../queries');
const fileController = require('../controllers/fileController');

// `/file/edit/${id}`
fileRouter.post('/edit/:id', fileController.postEditFile);

fileRouter.post('/download', fileController.postDownloadFile);
fileRouter.post('/delete/:id', fileController.postDeleteFile);

fileRouter.get('/:id', fileController.getViewFile);

module.exports = fileRouter;
