// services/cronServices.js
// const prisma = require('../prismaClient'); // Adjust path to your Prisma client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function deleteExpiredLinks() {
  try {
    const result = await prisma.sharedLink.deleteMany({
      where: {
        expirationDate: {
          lte: new Date(), // Deletes links where expirationDate is less than or equal to now
        },
      },
    });
    console.log(`Deleted ${result.count} expired links`);
  } catch (error) {
    console.error('Error deleting expired links:', error);
  }
}

module.exports = { deleteExpiredLinks };
