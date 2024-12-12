const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('express-async-handler');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://obgelvjksmzziicefptu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY_SERVICE;
const supabase = createClient(supabaseUrl, supabaseKey);
const { v4 } = require('uuid');

function bytesToKB(bytes) {
  return (bytes / 1024).toFixed(2);
  // (bytes / 1024).toFixed(2);
}

exports.createUser = asyncHandler(async (username, secpass) => {
  const user = await prisma.user.create({
    data: {
      username: username,
      password: secpass,
      library: {
        create: {},
      },
    },
  });
});

exports.createFolder = asyncHandler(async (libraryid, foldername) => {
  const folder = await prisma.library.update({
    where: {
      id: libraryid,
    },
    data: {
      folders: {
        create: {
          folderName: foldername,
        },
      },
    },
  });
});

exports.UploadFile = asyncHandler(async (libraryid, fileObj, ifDemo) => {
  //     file obj
  // {
  //   fieldname: 'avatar',
  //   originalname: 'git-img.jpg',
  //   encoding: '7bit',
  //   mimetype: 'image/jpeg',
  //   buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 60 00 60 00 00 ff e1 00 22 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 01 01 12 00 03 00 00 00 01 00 01 ... 202306 more bytes>,
  //   size: 202356
  // }

  // Generate a UUID for the file name
  const fileUUID = v4();
  const fileExtension = fileObj.originalname.split('.').pop(); // Get file extension
  const fileName = `${fileUUID}.${fileExtension}`; // UUID-based filename with extension
  let path = '';
  if (ifDemo) {
    path = `public/${fileName}`;
  } else {
    path = `private/${fileName}`;
  }
  const { data, error } = await supabase.storage
    .from('avatar') // Your bucket name
    .upload(path, fileObj.buffer, {
      cacheControl: '3600',
      upsert: false,
    });
  if (error) {
    console.error('Supabase Upload Error:', error);
    return;
    // return res.status(500).json({ error: 'Error uploading file to Supabase' });
  }
  const fileSize = bytesToKB(fileObj.size);
  const file = await prisma.library.update({
    where: { id: libraryid },
    data: {
      files: {
        create: {
          fileName: fileObj.originalname,
          filePath: data.path,
          size: parseFloat(fileSize),
          // size yet to come
        },
      },
    },
  });
  return file;
});

exports.renameFolder = asyncHandler(async (folderid, name) => {
  const update = await prisma.folder.update({
    where: {
      id: folderid,
    },
    data: {
      folderName: name,
    },
  });
  return update;
});
exports.renameFile = asyncHandler(async (fileid, name) => {
  const update = await prisma.file.update({
    where: {
      id: fileid,
    },
    data: {
      fileName: name,
    },
  });
  return update;
});

exports.getLibData = asyncHandler(async (libId) => {
  const data = await prisma.library.findUnique({
    where: { id: libId },
    include: {
      folders: true,
      files: true,
    },
  });

  return data;
});
// getLibData(4)

exports.getFolderInfo = asyncHandler(async (folderid) => {
  const data = await prisma.folder.findUnique({
    where: {
      id: folderid,
    },
    include: {
      parentFolder: true,
      childFolders: true,
      files: true,
      createdAt: false,
      updatedAt: false,
    },
  });

  // console.log(data);

  return data;
});
exports.getFileInfo = asyncHandler(async (fileid) => {
  const data = await prisma.file.findUnique({
    where: {
      id: fileid,
    },
  });
  // console.log(data);
  return data;
});
// getFolderInfo(7)
// getFileInfo(3)
exports.postCreateChildFolder = asyncHandler(async (parentid, foldername) => {
  const folder = await prisma.folder.update({
    where: {
      id: parentid,
    },
    data: {
      childFolders: {
        create: {
          folderName: foldername,
        },
      },
    },
  });
});

exports.postUploadChildFile = asyncHandler(
  async (parentid, fileObj, ifDemo) => {
    // Generate a UUID for the file name
    const fileUUID = v4();
    const fileExtension = fileObj.originalname.split('.').pop(); // Get file extension
    const fileName = `${fileUUID}.${fileExtension}`; // UUID-based filename with extension
    let path = '';
    if (ifDemo) {
      path = `public/${fileName}`;
    } else {
      path = `private/${fileName}`;
    }
    const { data, error } = await supabase.storage
      .from('avatar') // Your bucket name
      .upload(path, fileObj.buffer, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) {
      console.error('Supabase Upload Error:', error);
      return res
        .status(500)
        .json({ error: 'Error uploading file to Supabase' });
    }
    const fileSize = bytesToKB(fileObj.size);
    // console.log('look here');
    // console.log(fileObj);
    const file = await prisma.folder.update({
      where: { id: parentid },
      data: {
        files: {
          create: {
            fileName: fileObj.originalname,
            filePath: data.path,
            size: parseFloat(fileSize),
            // size yet to come
          },
        },
      },
    });
    return file;
  }
);

exports.DeleteFolder = asyncHandler(async (folderid) => {
  const report = await prisma.folder.delete({
    where: {
      id: folderid,
    },
  });
  // console.log("deleted ",id);
});

exports.DeleteFile = asyncHandler(async (fileid, path) => {
  const { data, error } = await supabase.storage.from('avatar').remove([path]);
  if (error) {
    console.log('Error deleting file:', error);
  } else {
    console.log('File deleting successfully:', data);
  }
  const report = await prisma.file.delete({
    where: {
      id: fileid,
    },
  });
  // console.log(report);
});

exports.DownloadFile = asyncHandler(async (path) => {
  const { data, error } = await supabase.storage.from('avatar').download(path);
  if (error) {
    console.log('Error downloading file:', error);
  } else {
    console.log('File download successfully:', data);
  }
  return data;
});
exports.DeleteSupabaseFile = asyncHandler(async (path) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .remove(['folder/avatar1.png']);
  if (error) {
    console.log('Error deleting file:', error);
  } else {
    console.log('File deleting successfully:', data);
  }
});

function parseDuration(input) {
  // console.log(input);
  const match = input.match(/(\d+)([dhm])/); // Supports days (d), hours (h), minutes (m)
  if (!match) throw new Error('Invalid duration format');

  const value = parseInt(match[1], 10); // Extract numeric value
  const unit = match[2]; // Extract unit (d, h, m)
  // console.log("inside parse DUration ",value , unit)
  switch (unit) {
    case 'd':
      // console.log("days in parseDuration",value * 24 * 60 * 60 * 1000)
      return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    case 'h':
      // console.log("hours in parseDuration",value * 60 * 60 * 1000)
      return value * 60 * 60 * 1000; // Convert hours to milliseconds
    case 'm':
      // console.log("mintes in parseDuration",value * 60 * 1000)
      return value * 60 * 1000; // Convert minutes to milliseconds
    default:
      throw new Error('Unsupported unit');
  }
}

exports.createSharedLink = asyncHandler(async (type, fId, duration) => {
  // const baseUrl = 'https://filevault2-production.up.railway.app/sharedFolder';
  // duration formats are 30m , 10h , 1d ,10d
  const expirationDate = new Date();
  const milliseconds = parseDuration(duration);
  console.log('new date', expirationDate);
  console.log(
    'milliseconds',
    milliseconds,
    'exp date',
    expirationDate.getTime() + milliseconds
  );
  expirationDate.setTime(expirationDate.getTime() + milliseconds);
  console.log(`Expiration after : ${expirationDate}`);
  let data = '';
  if (type == 'folder') {
    data = await prisma.sharedLink.create({
      data: {
        folderId: fId,
        expirationDate: expirationDate,
      },
    });
  } else if (type == 'file') {
    data = await prisma.sharedLink.create({
      data: {
        fileId: fId,
        expirationDate: expirationDate,
      },
    });
  }

  return data;
});
exports.getSharedFolder = asyncHandler(async (linkId) => {
  const sharedLink = await prisma.sharedLink.findUnique({
    where: { id: linkId },
    include: { folder: true },
  });

  // console.log(sharedLink);
  // console.log(sharedLink.folder.id);
  // console.log(new Date(),sharedLink.expirationDate,new Date() > sharedLink.expirationDate);
  if (!sharedLink || new Date() > sharedLink.expirationDate) {
    console.log('link expired');
    return;
    // throw new Error('Link expired or invalid.');
  }
  // console.log(sharedLink);
  // console.log("Raw data start")
  // console.log(sharedLink)
  // console.log("Raw data end")

  return sharedLink;
});
