const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const prisma = new PrismaClient();

// Check database connection
async function checkDbConnection() {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    console.log("Database connection established");
    return true;
  } catch (err) {
    console.error("Unable to connect to the database:", err.message);
    return false;
  }
}

async function checkAdmin() {
  const connected = await checkDbConnection();
  if (!connected) process.exit(1);

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPass = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPass) {
    console.warn(
      "ADMIN_EMAIL or ADMIN_PASSWORD not set in .env – skipping admin creation"
    );
    await prisma.$disconnect();
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingAdmin = await tx.user.findFirst({
        where: {
          email: adminEmail,
          roles: { has: "super_admin" }
        }
      });

      if (existingAdmin) {
        console.log(`Admin user already exists: ${existingAdmin.email}`);
        return;
      }

      const hashed = await bcrypt.hash(adminPass, 10);

      const adminUser = await tx.user.create({
        data: {
          firstName: "Administrator",
          lastName: "System",
          phone: "0000000000",
          email: adminEmail,
          passwordHash: hashed,
          roles: ["super_admin"],
          coins: 1000,
          isActive: true,
          isEmailVerified: true,
          profileImage: null
        },
      });
      
      console.log(`Created admin user: ${adminEmail}`);
    });

    console.log("Admin seeding completed successfully");
  } catch (err) {
    console.error("Error during admin seeding:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

export {
  checkDbConnection,
  checkAdmin,
  prisma
};