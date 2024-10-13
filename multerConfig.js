const multer = require('multer');
const path = require('path');

// Set up storage with DiskStorage, keeping the original file name
const storage = multer.memoryStorage();
// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Export the configured Multer instance
module.exports = upload;
