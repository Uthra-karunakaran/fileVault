const queries = require('../queries');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { formatDistanceToNow } = require('date-fns');

exports.postEditFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { editName } = req.body;

  const data = await queries.renameFile(parseInt(id), editName);
  console.log(data);
  res.redirect('/library');
});

exports.getViewFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await queries.getFileInfo(parseInt(id));

  let cleanCreatedAt = data.createdAt.toString().replace(/\s*\(.*\)$/, '');
  let cleanUpdatedAt = data.updatedAt.toString().replace(/\s*\(.*\)$/, '');
  data.formattedCreatedAt = formatDistanceToNow(new Date(cleanCreatedAt), {
    addSuffix: true,
  });
  data.formattedUpdatedAt = formatDistanceToNow(new Date(cleanUpdatedAt), {
    addSuffix: true,
  });

  res.render('layout.ejs', {
    title: 'Library',
    body: 'file-view',
    // messages,
    // formData,
    headerNav: 'header',
    nav: 'nav-auth',
    username: req.user.username,
    fileInfo: data,
  });
  // const data=await queries.
});

exports.postDeleteFile = asyncHandler(async (req, res) => {
  const { id, path } = req.body; // Access id and resPath from body
  await queries.DeleteFile(parseInt(id), path);
  res.json({ Message: 'success' });
});

exports.postDownloadFile = asyncHandler(async (req, res) => {
  const { fileName, path } = req.body;
  const file = await queries.DownloadFile(path);
  const buffer = await file.arrayBuffer(); // Ensure the data is handled as a buffer
  // res.send(Buffer.from(buffer));  // Send the buffer as binary data
  // Send the file data directly as a response
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(Buffer.from(buffer)); // Send the buffer as binary data
});
