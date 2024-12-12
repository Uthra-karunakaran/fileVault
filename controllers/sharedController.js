const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const queries = require('../queries');
const { formatDistanceToNow } = require('date-fns');

const baseUrl_prod = 'https://filevault2-production.up.railway.app/share/view';
const baseUrl_local = 'http://localhost:3000/share/view';
exports.getSharedLink = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const { folderid } = req.query;
  const { fileid } = req.query;

  if (!id) {
    return res.status(400).send('Invalid shared link');
  }
  const getData = await queries.getSharedFolder(id);
  //   console.log(!getData)
  if (!getData) {
    return res.status(400).send('Link expired or invalid.');
  }
  //   console.log("logging shared data start")
  //    console.log(getData);
  //    console.log("logging shared data end")
  let data;
  if (getData.folderId != null) {
    data = await queries.getFolderInfo(parseInt(getData.folderId));
    //    console.log("logging folder data start")
    //    console.log(data);
    //    console.log("logging folder data end")

    data['req_id'] = id;
  } else if (getData.fileId) {
    data = await queries.getFileInfo(parseInt(getData.fileId));
    //    data = await queries.getFolderInfo(parseInt(getData.folderId));
    //    console.log("logging folder data start")
    //    console.log(data);
    //    console.log("logging folder data end")
    let cleanCreatedAt = data.createdAt.toString().replace(/\s*\(.*\)$/, '');
    let cleanUpdatedAt = data.updatedAt.toString().replace(/\s*\(.*\)$/, '');
    data.formattedCreatedAt = formatDistanceToNow(new Date(cleanCreatedAt), {
      addSuffix: true,
    });
    data.formattedUpdatedAt = formatDistanceToNow(new Date(cleanUpdatedAt), {
      addSuffix: true,
    });
    //    data = await queries.getViewFile(parseInt(getData.fileId));
    data['req_id'] = id;
    data['has_parent_folder'] = false;

    res.render('layout.ejs', {
      title: 'Library',
      body: 'share-folder-file',
      // messages,
      // formData,
      headerNav: 'header',
      nav: 'nav-register',
      fileInfo: data,
    });
    return;
  }

  async function find_folder_match(parent_data, folderid) {
    if (!parent_data.childFolders || parent_data.childFolders.length === 0) {
      // Base case: Stop recursion if no childFolders exist
      return false;
    }
    for (const folder of parent_data.childFolders) {
      if (parseInt(folder.id) === parseInt(folderid)) {
        // console.log('Got the folder id:', folder.id);
        return true; // Stop further recursion when the folder is found
      } else {
        const ch_data = await queries.getFolderInfo(parseInt(folder.id));
        await find_folder_match(ch_data); // Recursive call
      }
    }
  }

  // if there exists a folder id
  if (folderid) {
    // console.log('retrive folder');
    // retrive the folder and check for the child folder id and file id if any of them matches the request then display id check untill the end of the child folders and files , else no output
    let match = true;
    if (data.id != parseInt(folderid)) {
      match = await find_folder_match(data, folderid);
    }
    // the folderid is the shared folder id itself
    // check if the file exists

    if (!match) {
      //   console.log("folder not matched")
      return res.status(400).send('Folder not found for the shared link');
    } else {
      if (fileid) {
        // console.log('retrive file data',parseInt(fileid));
        let file_match = false;
        if (data.id == parseInt(folderid)) {
          data.files.forEach((file) => {
            if (parseInt(file.id) == parseInt(fileid)) {
              file_match = true;
              return;
            }
          });
        }
        if (!file_match && data.id == parseInt(folderid)) {
          // console.log("file not matched");
          return res.status(400).send('File not found for the shared link');
        }
        // file check inside the folder data
        file_match = false;
        let folder_check = await queries.getFolderInfo(parseInt(folderid));
        folder_check.files.forEach((file) => {
          if (parseInt(file.id) == parseInt(fileid)) {
            file_match = true;
            return;
          }
        });
        if (!file_match) {
          // console.log("file not matched");
          return res.status(400).send('File not found for the shared link');
        }

        const file_data = await queries.getFileInfo(parseInt(fileid));

        let cleanCreatedAt = file_data.createdAt
          .toString()
          .replace(/\s*\(.*\)$/, '');
        let cleanUpdatedAt = file_data.updatedAt
          .toString()
          .replace(/\s*\(.*\)$/, '');
        file_data.formattedCreatedAt = formatDistanceToNow(
          new Date(cleanCreatedAt),
          {
            addSuffix: true,
          }
        );
        file_data.formattedUpdatedAt = formatDistanceToNow(
          new Date(cleanUpdatedAt),
          {
            addSuffix: true,
          }
        );
        file_data['req_id'] = id;
        file_data['has_parent_folder'] = true;

        res.render('layout.ejs', {
          title: 'Library',
          body: 'share-folder-file',
          // messages,
          // formData,
          headerNav: 'header',
          nav: 'nav-register',
          fileInfo: file_data,
        });
      }
      const folder_data = await queries.getFolderInfo(parseInt(folderid));
      folder_data.childFolders.forEach((folder) => {
        let cleanCreatedAt = folder.createdAt
          .toString()
          .replace(/\s*\(.*\)$/, '');
        let cleanUpdatedAt = folder.updatedAt
          .toString()
          .replace(/\s*\(.*\)$/, '');
        folder.formattedCreatedAt = formatDistanceToNow(
          new Date(cleanCreatedAt),
          {
            addSuffix: true,
          }
        );
        folder.formattedUpdatedAt = formatDistanceToNow(
          new Date(cleanUpdatedAt),
          {
            addSuffix: true,
          }
        );
      });
      folder_data.files.forEach((file) => {
        let cleanCreatedAt = file.createdAt
          .toString()
          .replace(/\s*\(.*\)$/, '');
        let cleanUpdatedAt = file.updatedAt
          .toString()
          .replace(/\s*\(.*\)$/, '');
        file.formattedCreatedAt = formatDistanceToNow(
          new Date(cleanCreatedAt),
          {
            addSuffix: true,
          }
        );
        file.formattedUpdatedAt = formatDistanceToNow(
          new Date(cleanUpdatedAt),
          {
            addSuffix: true,
          }
        );
      });
      folder_data['req_id'] = id;
      folder_data['has_parent_folder'] =
        data.id == parseInt(folderid) ? false : true;
      //   console.log("hey im folder data", folder_data)
      res.render('layout.ejs', {
        title: 'Library',
        body: 'share-folder-view',
        headerNav: 'header',
        nav: 'nav-register',
        folderInfo: folder_data,
      });
    }
  }

  // retrive the main data
  else {
    // console.log('retrive main data');

    data.childFolders.forEach((folder) => {
      let cleanCreatedAt = folder.createdAt
        .toString()
        .replace(/\s*\(.*\)$/, '');
      let cleanUpdatedAt = folder.updatedAt
        .toString()
        .replace(/\s*\(.*\)$/, '');
      folder.formattedCreatedAt = formatDistanceToNow(
        new Date(cleanCreatedAt),
        {
          addSuffix: true,
        }
      );
      folder.formattedUpdatedAt = formatDistanceToNow(
        new Date(cleanUpdatedAt),
        {
          addSuffix: true,
        }
      );
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
    data['has_parent_folder'] = false;
    // console.log("hey im data",data);
    res.render('layout.ejs', {
      title: 'Library',
      body: 'share-folder-view',
      headerNav: 'header',
      nav: 'nav-register',
      folderInfo: data,
    });
  }
});

exports.postSharedLinkFolder = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const { shareDuration } = req.body;
  //   console.log(shareDuration);
  if (!id) {
    return res.status(400).send('Invalid shared link');
  }
  const data = await queries.createSharedLink(
    'folder',
    parseInt(id),
    shareDuration
  );
  //   console.log(data.id);
  // res.redirect('/library');
  //   res.redirect(`/folder/${id}`);
  // Determine base URL based on environment
  const baseUrl =
    process.env.NODE_ENV === 'production' ? baseUrl_prod : baseUrl_local;

  // Construct the shared link
  // Construct the shared link
  let shareddata = {};
  shareddata['sharedLink'] = `${baseUrl}?id=${data.id}`;
  shareddata['redirURL'] = `/folder/${id}`;

  // console.log(shareddata)
  // Send back HTML to render the alert pop-up
  res.render('layout.ejs', {
    title: 'Library',
    body: 'sharedView.ejs',
    // messages,
    // formData,
    headerNav: 'header',
    nav: 'nav-auth',
    username: req.user.username,
    sharedData: shareddata,
  });
});

exports.postSharedLinkFile = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const { shareDuration } = req.body;
  // console.log(shareDuration);
  if (!id) {
    return res.status(400).send('Invalid shared link');
  }
  const data = await queries.createSharedLink(
    'file',
    parseInt(id),
    shareDuration
  );
  // console.log(data.id);
  // res.redirect('/library');
  //   res.redirect(`/folder/${id}`);
  // Determine base URL based on environment
  const baseUrl =
    process.env.NODE_ENV === 'production' ? baseUrl_prod : baseUrl_local;

  // Construct the shared link
  let shareddata = {};
  shareddata['sharedLink'] = `${baseUrl}?id=${data.id}`;
  shareddata['redirURL'] = `/file/${id}`;

  //   console.log(shareddata)
  // Send back HTML to render the alert pop-up
  res.render('layout.ejs', {
    title: 'Library',
    body: 'sharedView.ejs',
    // messages,
    // formData,
    headerNav: 'header',
    nav: 'nav-auth',
    username: req.user.username,
    sharedData: shareddata,
  });
});
