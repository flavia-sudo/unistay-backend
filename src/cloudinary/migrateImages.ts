import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import db from "../Drizzle/db";
import { HostelTable } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_API_KEY) {
  console.error("Cloudinary API_KEY missing!");
  process.exit(1);
}

async function migrateImages() {
  const hostels = await db.select().from(HostelTable);

  for (const hostel of hostels) {
    let fileName = hostel.image_URL;
    if (!fileName) continue;

    if (fileName.includes("00000000000000000000000000000000")) {
      console.log(`Skipping hostel ${hostel.hostelId}, placeholder image`);
      continue;
    }

    // ✅ Skip already-migrated Cloudinary URLs
    if (fileName.startsWith("https://res.cloudinary.com")) {
      console.log(`Hostel ${hostel.hostelId} already on Cloudinary, skipping`);
      continue;
    }

    fileName = path.basename(fileName);
    const absolutePath = path.join(__dirname, "../../assets/images", fileName);

    if (!fs.existsSync(absolutePath)) {
      console.log(`File not found: ${absolutePath}`);
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(absolutePath, {
        folder: "hostels",
        use_filename: true,
        unique_filename: false,
      });

      console.log(`Uploaded hostel ${hostel.hostelId}: ${result.secure_url}`);

      await db
        .update(HostelTable)
        .set({ image_URL: result.secure_url })
        .where(eq(HostelTable.hostelId, hostel.hostelId));
    } catch (error) {
      console.error(`Error uploading hostel ${hostel.hostelId}: ${error}`);
    }
  }

  console.log("All images migrated!");
}

migrateImages();