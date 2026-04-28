import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
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
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPass = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim();
  const adminPhone = process.env.ADMIN_PHONE?.trim();

  if (!adminEmail || !adminPass) {
    console.warn(
      "ADMIN_EMAIL or ADMIN_PASSWORD not set in .env – skipping admin creation"
    );
    return;
  }

  try {
    const existingAdmin = await prisma.user.findFirst({
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

    // Split name into firstName and lastName
    const nameParts = adminName ? adminName.split(' ') : ['Administrator', 'System'];
    const firstName = nameParts[0] || 'Administrator';
    const lastName = nameParts.slice(1).join(' ') || 'System';

    const adminUser = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        phone: adminPhone,
        email: adminEmail,
        password: hashed,
        roles: ["super_admin"]
      },
    });
    
    console.log(`Created admin user: ${adminEmail}`);
    console.log("Admin seeding completed successfully");
  } catch (err) {
    console.error("Error during admin seeding:", err);
  }
}

export {
  checkDbConnection,
  checkAdmin,
  prisma
};