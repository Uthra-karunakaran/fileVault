const { genPassword } = require('../passwordUtils');
const auth = require('../authMiddleWare');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const queries = require('../queries');
const passport = require('passport');
const { formatDistanceToNow } = require('date-fns');

// File validation middleware
const validateFile = [
  body('file').custom((value, { req }) => {
    const file = req.file; // File object from multer
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Check file size (1MB = 1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      throw new Error('File size should be less than 1MB');
    }

    // Check file MIME type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new Error(
        'Invalid file type. Only PNG, JPEG, and GIF are allowed.'
      );
    }

    // If no error, return true
    return true;
  }),
];

exports.postEditFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { editName } = req.body;

  const data = await queries.renameFolder(parseInt(id), editName);
  console.log(data);
  res.redirect('/library');
});
exports.getViewFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await queries.getFolderInfo(parseInt(id));
  console.log('look here uthra');
  console.log(data);
  data.childFolders.forEach((folder) => {
    let cleanCreatedAt = folder.createdAt.toString().replace(/\s*\(.*\)$/, '');
    let cleanUpdatedAt = folder.updatedAt.toString().replace(/\s*\(.*\)$/, '');
    folder.formattedCreatedAt = formatDistanceToNow(new Date(cleanCreatedAt), {
      addSuffix: true,
    });
    folder.formattedUpdatedAt = formatDistanceToNow(new Date(cleanUpdatedAt), {
      addSuffix: true,
    });
  });
  data.files.forEach((file) => {
    let cleanCreatedAt = file.createdAt.toString().replace(/\s*\(.*\)$/, '');
    let cleanUpdatedAt = file.updatedAt.toString().replace(/\s*\(.*\)$/, '');
    file.formattedCreatedAt = formatDistanceToNow(new Date(cleanCreatedAt), {
      addSuffix: true,
    });
    file.formattedUpdatedAt = formatDistanceToNow(new Date(cleanUpdatedAt), {
      addSuffix: true,
    });
  });
  res.render('layout.ejs', {
    title: 'Library',
    body: 'folder-layout',
    // messages,
    // formData,
    headerNav: 'header',
    nav: 'nav-auth',
    username: req.user.username,
    folderInfo: data,
  });
});
exports.postCreateFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { folderName } = req.body;

  await queries.postCreateChildFolder(parseInt(id), folderName);
  res.redirect(`/folder/${id}`);
});
exports.postUploadFolder = [
  validateFile,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const { id } = req.params;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('file obj');
    console.log(req.file);
    //     file obj
    // {
    //   fieldname: 'avatar',
    //   originalname: 'dog-lover.png',
    //   encoding: '7bit',
    //   mimetype: 'image/png',
    //   buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 02 00 00 00 02 00 08 06 00 00 00 f4 78 d4 fa 00 00 00 04 73 42 49 54 08 08 08 08 7c 08 64 88 00 ... 53578 more bytes>,
    //   size: 53628
    // }

    // validation for file upload
    // file size 1mb
    // file mimetype

    const filesaved = await queries.postUploadChildFile(
      parseInt(id),
      req.file,
      req.user.demo
    );
    res.redirect(`/folder/${id}`);
  }),
];

exports.postDeleteFolder = asyncHandler(async (req, res) => {
  console.log('got the req');
  const { id } = req.body; // Access id and resPath from body
  await queries.DeleteFolder(parseInt(id));

  res.json({ message: 'success' });
});
