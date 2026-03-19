import cloudinary from "./cloudinary";
import fs from "fs";
import path from "path";
import  db from "../Drizzle/db";
import { HostelTable } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

async function migrateImages() {
  const hostels = await db.select().from(HostelTable);

  for (const hostel of hostels) {
    let fileName = hostel.image_URL;
    if (!fileName) continue;
    fileName = path.basename(fileName);

    const absolutePath = path.join(__dirname, "../../assets/images", fileName);

    if (!fs.existsSync(absolutePath)) {
      console.log(`File not found: ${absolutePath}`);
      continue;
    }

    try {
    const result = await cloudinary.uploader.upload(absolutePath, {
      folder: "hostels", // Cloudinary folder
    });

    console.log(`Uploaded hostel ${hostel.hostelId}: ${result.secure_url}`);

    // update database with Cloudinary URL
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