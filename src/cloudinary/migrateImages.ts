import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import db from "../Drizzle/db";
import { HostelTable } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary config
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

  // Path to your local default image
  const defaultImagePath = path.join(__dirname, "../../assets/images/default_hostel.jpg");
  if (!fs.existsSync(defaultImagePath)) {
    console.error("Default image not found at:", defaultImagePath);
    process.exit(1);
  }

  for (const hostel of hostels) {
    let localPath: string;

    // If placeholder or empty, use local default image
    if (!hostel.image_URL || hostel.image_URL.includes("00000000000000000000000000000000")) {
      console.log(`Placeholder detected for hostel ${hostel.hostelId}, using default image`);
      localPath = defaultImagePath;
    } else {
      const fileName = path.basename(hostel.image_URL);
      localPath = path.join(__dirname, "../../assets/images", fileName);

      if (!fs.existsSync(localPath)) {
        console.log(`File not found: ${localPath}, using default image`);
        localPath = defaultImagePath;
      }
    }

    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder: "hostels",
        use_filename: true,
        unique_filename: false,
      });

      console.log(`Uploaded hostel ${hostel.hostelId}: ${result.secure_url}`);

      // Update DB
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