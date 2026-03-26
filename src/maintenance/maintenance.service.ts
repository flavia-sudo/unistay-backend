import db from "../Drizzle/db";
import { MaintenanceTable, TIMaintenance, UserTable, RoomTable, HostelTable } from "../Drizzle/schema";
import { eq } from "drizzle-orm";

export const createMaintenanceService = async (maintenance: TIMaintenance) => {
    const [ inserted ] = await db.insert(MaintenanceTable).values(maintenance).returning();
    if (inserted) {
        return inserted;
    }
    return null;
}

export const getMaintenanceService = async () => {
  const maintenanceAll = await db
    .select({
      maintenanceId: MaintenanceTable.maintenanceId,
      issueTitle: MaintenanceTable.issueTitle,
      description: MaintenanceTable.description,
      status: MaintenanceTable.status,
      date_reported: MaintenanceTable.date_reported,
      date_resolved: MaintenanceTable.date_resolved,

      // Join fields
      firstName: UserTable.firstName,
      lastName: UserTable.lastName,
      hostelName: HostelTable.hostelName,
      roomNumber: RoomTable.roomNumber,
    })
    .from(MaintenanceTable)
    .leftJoin(UserTable, eq(MaintenanceTable.userId, UserTable.userId))
    .leftJoin(RoomTable, eq(MaintenanceTable.roomId, RoomTable.roomId))
    .leftJoin(HostelTable, eq(MaintenanceTable.hostelId, HostelTable.hostelId));

  return maintenanceAll;
};

export const getMaintenanceByIdService = async (Id: number) => {
    const maintenance = await db.query.MaintenanceTable.findFirst({
        where: eq(MaintenanceTable.maintenanceId, Id)
    });
    return maintenance;
}

export const updateMaintenanceService = async (Id: number, maintenance: TIMaintenance) => {
    const updated = await db.update(MaintenanceTable).set(maintenance).where(eq(MaintenanceTable.maintenanceId, Id)).returning();
    return updated;
}

export const deleteMaintenanceService = async (Id: number) => {
    const deleted = await db.delete(MaintenanceTable).where(eq(MaintenanceTable.maintenanceId, Id)).returning();
    return deleted;
}

export const getMaintenanceByRoomIdService = async (roomId: number) => {
    const maintenance = await db.query.MaintenanceTable.findFirst({
        where: eq(MaintenanceTable.roomId, roomId)
    });
    return maintenance;
}

export const getMaintenanceByUserIdService = async (userId: number) => {
    const maintenance = await db.query.MaintenanceTable.findMany({
        where: eq(MaintenanceTable.userId, userId),
        with: {
            hostel : {
                columns : {
                    hostelName : true,
                }
            },
            room : {
                columns : {
                    roomNumber : true,
                }
            }
        }
    });

    const data = maintenance.map((m) => ({
        ...m,
        hostelName: m.hostel?.hostelName ?? "Unknown",
        roomNumber: m.room?.roomNumber ?? "Unknown",
    }))
    return { data};
}