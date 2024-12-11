// cronJobs/deleteExpiredLinks.js
const cron = require('node-cron');
const { deleteExpiredLinks } = require('./services/cronServices');

// Schedule the job to run every day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running cron job to delete expired links...');
  await deleteExpiredLinks();
}, {
  timezone: "Asia/Kolkata" // Set timezone if needed
});
