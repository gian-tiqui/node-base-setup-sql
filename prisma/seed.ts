import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      employeeId: "ADM001",
      phoneNumber: "+1234567890",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash("User@123", 12);

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      firstName: "Regular",
      lastName: "User",
      email: "user@example.com",
      employeeId: "USR001",
      phoneNumber: "+1234567891",
      password: userPassword,
      role: "USER",
      isActive: true,
    },
  });

  console.log("✅ Created regular user:", user.email);

  console.log("🎉 Database seeding completed!");
  console.log("\n📝 Default credentials:");
  console.log("Admin - Employee ID: ADM001, Password: Admin@123");
  console.log("User - Employee ID: USR001, Password: User@123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
