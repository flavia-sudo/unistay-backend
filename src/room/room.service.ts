import db from "../Drizzle/db";
import { RoomTable, TIRoom } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

// room.service.ts
export const createRoomService = async (room: TIRoom) => {
    const [inserted] = await db.insert(RoomTable).values({
        status: true,  
        ...room,
    }).returning();
    return inserted ?? null;
};

export const getRoomsService = async () => {
    const rooms = await db.query.RoomTable.findMany();
    return rooms;
}

export const getRoomByIdService = async (Id: number) => {
    const room = await db.query.RoomTable.findFirst({
        where: eq(RoomTable.roomId, Id)
    });
    return room;
}

export const updateRoomService = async (Id: number, room: TIRoom) => {
    const updated = await db.update(RoomTable).set(room).where(eq(RoomTable.roomId, Id)).returning();
    return updated;
}

export const deleteRoomService = async (Id: number) => {
    const deleted = await db.delete(RoomTable).where(eq(RoomTable.roomId, Id)).returning();
    return deleted;
}


export const getRoomByHostelIdService = async (hostelId: number) => {
    const rooms = await db.query.RoomTable.findMany({
        where: eq(RoomTable.hostelId, hostelId)
    });
    return rooms;
}