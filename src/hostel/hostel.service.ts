import db from "../Drizzle/db";
import { HostelTable, TIHostel, UserTable } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import hostel from "./hostel.router";

export const createHostelService = async (hostel: TIHostel) => {
    const [ inserted ] = await db.insert(HostelTable).values(hostel).returning();
    if (inserted) {
        return inserted;
    }
    return null;
}

export const getHostelsService = async () => {
    const hostels = await db
    .select({
        hostelId: HostelTable.hostelId,
        userId: HostelTable.userId,
        hostelName: HostelTable.hostelName,
        location: HostelTable.location,
        contact_number: HostelTable.contact_number,
        description: HostelTable.description,
        image_URL: HostelTable.image_URL,
        price: HostelTable.price,

        firstName: UserTable.firstName,
        lastName: UserTable.lastName,
    })
    .from(HostelTable)
    .leftJoin(UserTable, eq(HostelTable.userId, UserTable.userId));
    return hostels;
}

export const getHostelByIdService = async (Id: number) => {
    const hostel = await db.query.HostelTable.findFirst({
        where: eq(HostelTable.hostelId, Id)
    });
    return hostel;
}

export const updateHostelService = async (Id: number, hostel: TIHostel) => {
    const updated = await db.update(HostelTable).set(hostel).where(eq(HostelTable.hostelId, Id)).returning();
    return updated;
}

export const deleteHostelService = async (Id: number) => {
    const deleted = await db.delete(HostelTable).where(eq(HostelTable.hostelId, Id)).returning();
    return deleted;
}


export const getHostelByUserIdService = async (userId: number) => {
    const hostels = await db.query.HostelTable.findFirst({
        where: eq(HostelTable.userId, userId)
    });
    return hostels;
}