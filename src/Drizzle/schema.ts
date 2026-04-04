import { relations } from "drizzle-orm";
import { decimal } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable, varchar, text, date, boolean, serial, timestamp } from "drizzle-orm/pg-core";

export const RoleEnum = pgEnum("role", ["student", "admin", "landlord"]);
export const MaintenanceEnum = pgEnum("status", ["pending", "on progress", "resolved"]);

export const UserTable = pgTable("user", {
    userId: serial("user_id").primaryKey(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 250 }).notNull(),
  phoneNumber: text("phone_number"),
  role: RoleEnum("role").notNull().default("student"),

  createdAt: date("created_at").defaultNow(),
  updatedAt: date("updated_at").defaultNow(),

  image_URL: varchar("image_url", { length: 255 }).default("https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"),
  verificationCode: varchar("verification_code", { length: 10 }),
  verified: boolean("verified").default(false),

  year_of_study: text("year_of_study"),
  course: text("course"),

  address: varchar("address", {length: 100}),
})

export const HostelTable = pgTable("hostel", {
    hostelId: serial("hostel_id").primaryKey(),
    userId: integer("user_id").notNull().references(() => UserTable.userId).notNull(),
    // landlordId: integer("landlord_id").notNull().references(() => UserTable.userId, { onDelete: "cascade" }),
    hostelName: varchar("hostel_name", { length: 50 }).notNull(),
    location: varchar("location", { length: 100 }).notNull(),
    contact_number: varchar("contact_number", { length: 20 }).notNull(),
    description: text("description").notNull(),
    image_URL: varchar("image_url", { length: 255 }).default("https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"),
    price: integer("price").notNull(),
    rooms_available: integer("rooms_available").notNull().default(0),
})

export const RoomTable = pgTable("room", {
    roomId: serial("room_id").primaryKey(),
    hostelId: integer("hostel_id").notNull().references(() => HostelTable.hostelId, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => UserTable.userId, { onDelete: "set null" }),
    roomNumber: varchar("room_number", { length: 10 }).notNull(),
    roomType: varchar("room_type", { length: 50 }).notNull(),
    price: varchar("price").notNull(),
    capacity: varchar("capacity").notNull(),
    description: text("description").notNull(),
    status: boolean("status").notNull().default(false),
})

export const BookingTable = pgTable("booking", {
    bookingId: serial("booking_id").primaryKey(),
    hostelId: integer("hostel_id").notNull().references(() => HostelTable.hostelId, { onDelete: "cascade" }),
    roomId: integer("room_id").notNull().references(() => RoomTable.roomId, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => UserTable.userId, { onDelete: "cascade" }),
    checkInDate: date("check_in_date").notNull(),
    duration: text("duration").notNull().default("4 months"),
    totalAmount: decimal("total_amount").notNull(),
    bookingStatus: boolean("booking_status").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

export const PaymentTable = pgTable("payment", {
    paymentId: serial("payment_id").primaryKey(),
    bookingId: integer("booking_id").notNull().references(() => BookingTable.bookingId, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => UserTable.userId, { onDelete: "cascade" }),
    amount: decimal("amount").notNull(),
    method: varchar("method", { length: 50 }).notNull(),
    transactionId: varchar("transaction_id", { length: 255 }).notNull(),
    paymentStatus: varchar("payment_status").notNull().default("Pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

export const MaintenanceTable = pgTable("maintenance", {
    maintenanceId: serial("maintenance_id").primaryKey(),
    hostelId: integer("hostel_id").notNull().references(() => HostelTable.hostelId, { onDelete: "cascade" }),
    roomId: integer("room_id").notNull().references(() => RoomTable.roomId, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => UserTable.userId, { onDelete: "cascade" }),
    issueTitle: text("issue_title").notNull(),
    description: text("description").notNull(),
    status: MaintenanceEnum("status").notNull().default("pending"),
    date_reported: date("date_reported").defaultNow(),
    date_resolved: date("date_resolved").defaultNow(),
})

export const ReviewTable = pgTable("review", {
    reviewId: serial("review_id").primaryKey(),
    hostelId: integer("hostel_id").notNull().references(() => HostelTable.hostelId, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => UserTable.userId, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    createdAt: date("created_at").defaultNow(),
    updatedAt: date("updated_at").defaultNow(),
})

// User Table relations
export const UserRelations = relations(UserTable, ({ many, one }) => ({
    hostelsAsLandlord: many(HostelTable, {
        relationName: "hostelsAsLandlord",
    }),
    hostelsAsStudent: one(HostelTable),
    reviews: many(ReviewTable),
    bookings: many(BookingTable),
    payments: many(PaymentTable),
}))

// Hostel Table relations
export const HostelRelations = relations(HostelTable, ({ many, one }) => ({
    rooms: many(RoomTable),
    user: one(UserTable, { fields: [HostelTable.userId], references: [UserTable.userId] }),
    // landlord: one(UserTable, { fields: [HostelTable.landlordId], references: [UserTable.userId] }),
    bookings: many(BookingTable),
    maintenance: many(MaintenanceTable),
    reviews: many(ReviewTable),
}))

// Room Table relations
export const RoomRelations = relations(RoomTable, ({ many, one }) => ({
    hostel: one(HostelTable, { fields: [RoomTable.hostelId], references: [HostelTable.hostelId] }),
    user: one(UserTable, { fields: [RoomTable.userId], references: [UserTable.userId] }),
    bookings: many(BookingTable),
    maintenance: many(MaintenanceTable),
}))

// Booking Table relations
export const BookingRelations = relations(BookingTable, ({ many, one }) => ({
    hostel: one(HostelTable, { fields: [BookingTable.hostelId], references: [HostelTable.hostelId] }),
    room: one(RoomTable, { fields: [BookingTable.roomId], references: [RoomTable.roomId] }),
    user: one(UserTable, { fields: [BookingTable.userId], references: [UserTable.userId] }),
    payment: many(PaymentTable),
}))

// Maintenance Table relations
export const MaintenanceRelations = relations(MaintenanceTable, ({ one }) => ({
    hostel: one(HostelTable, { fields: [MaintenanceTable.hostelId], references: [HostelTable.hostelId] }),
    room: one(RoomTable, { fields: [MaintenanceTable.roomId], references: [RoomTable.roomId] }),
    user: one(UserTable, { fields: [MaintenanceTable.userId], references: [UserTable.userId] }),
}));

// Payment Table relations
export const PaymentRelations = relations(PaymentTable, ({ one }) => ({
    booking: one(BookingTable, { fields: [PaymentTable.bookingId], references: [BookingTable.bookingId] }),
    user: one(UserTable, { fields: [PaymentTable.userId], references: [UserTable.userId] }),
}))

// Review Table relations
export const ReviewRelations = relations(ReviewTable, ({ one }) => ({
    hostel: one(HostelTable, { fields: [ReviewTable.hostelId], references: [HostelTable.hostelId] }),
    user: one(UserTable, { fields: [ReviewTable.userId], references: [UserTable.userId] }),
}))

// Types
export type TIUser = typeof UserTable.$inferInsert;
export type TSUser = typeof UserTable.$inferSelect;
export type TIHostel = typeof HostelTable.$inferInsert;
export type TSHostel = typeof HostelTable.$inferSelect;
export type TIRoom = typeof RoomTable.$inferInsert;
export type TSRoom = typeof RoomTable.$inferSelect;
export type TIBooking = typeof BookingTable.$inferInsert;
export type TSBooking = typeof BookingTable.$inferSelect;
export type TIPayment = typeof PaymentTable.$inferInsert;
export type TSPayment = typeof PaymentTable.$inferSelect;
export type TIMaintenance = typeof MaintenanceTable.$inferInsert;
export type TSMaintenance = typeof MaintenanceTable.$inferSelect;
export type TIReview = typeof ReviewTable.$inferInsert;
export type TSReview = typeof ReviewTable.$inferSelect;