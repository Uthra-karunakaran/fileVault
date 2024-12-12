const sharedRouter = require('express').Router();
const upload = require('../multerConfig');
const queries = require('../queries');
const sharedController = require('../controllers/sharedController');

// pre path /share

// /create?id=folderid&duration=1d
sharedRouter.post('/file', sharedController.postSharedLinkFile);
sharedRouter.post('/folder', sharedController.postSharedLinkFolder);

// /view?id=uuid
sharedRouter.get('/view', sharedController.getSharedLink);

// /view?id=uuid &folderid=34 &fileid=95

// implement file only sharing

// form.action = `/share/file?id=${fid}`;
// form.action = `/share/folder?id=${fid}`;

module.exports = sharedRouter;
