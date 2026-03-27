import db from "../Drizzle/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TIUser, UserTable } from "../Drizzle/schema";
import { sendVerificationEmail, sendWelcomeEmail } from "../email/email.service";
import { and, eq } from "drizzle-orm";

// Create regular user "student"
export const createUserService = async (user: Omit<TIUser, "userId">) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const email = user.email.toLowerCase();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const newUser: TIUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: email,
        phoneNumber: user.phoneNumber,
        password: hashedPassword,
        role: "student", // force role here
        verificationCode: verificationCode,
        verified: false,
    };

    const [createdUser] = await db.insert(UserTable).values(newUser).returning();
    console.log("Inserting user:", JSON.stringify(newUser));
    if (!createdUser) {
        throw new Error("Failed to create user");
    }

    const token = jwt.sign(
        { userId: createdUser.userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );

    sendVerificationEmail(email, user.firstName, verificationCode).catch(console.error);
    sendWelcomeEmail(email, user.firstName).catch(console.error);

    return { user: createdUser, token };
};

// Create an admin user
export const createAdminService = async (adminData: Omit<TIUser, "userId" | "role" | "verified" | "verificationCode">) => {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const email = adminData.email.toLowerCase();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newAdmin: TIUser = {
        ...adminData,
        email: email,
        password: hashedPassword,
        role: "admin",
        verified: false,
        verificationCode: verificationCode,
    };

    const [admin] = await db.insert(UserTable).values(newAdmin).returning();
    if (!admin) {
        throw new Error("Failed to create admin");
    }

    const token = jwt.sign(
        { userId: admin.userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );

    sendVerificationEmail(email, admin.firstName, verificationCode).catch(console.error);
    sendWelcomeEmail(email, admin.firstName).catch(console.error);

    return { admin, token };
};

// Create a landlord user
export const createLandlordService = async (landlordData: Omit<TIUser, "userId" | "role" | "verified" | "verificationCode">) => {
    const hashedPassword = await bcrypt.hash(landlordData.password, 10);
    const email = landlordData.email.toLowerCase();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newLandlord: TIUser = {
        ...landlordData,
        email: email,
        password: hashedPassword,
        role: "landlord",
        verificationCode: verificationCode,
        verified: false,
    };

    const [landlord] = await db.insert(UserTable).values(newLandlord).returning();
    if (!landlord) {
        throw new Error("Failed to create landlord");
    }

    const token = jwt.sign(
        { userId: landlord.userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );

    sendVerificationEmail(email, landlord.firstName, verificationCode).catch(console.error);
    sendWelcomeEmail(email, landlord.firstName).catch(console.error);

    return { landlord, token };
};

// Login user
export const userLoginService = async (email: string, password: string) => {
    const user = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.email, email.toLowerCase()))
        .then((rows) => rows[0]);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        { userId: user.userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );

    return { user, token };
};

// Verify email code
export const verifyCodeService = async (email: string, code: string) => {
    const [user] = await db
        .select()
        .from(UserTable)
        .where(and(eq(UserTable.email, email.toLowerCase()), eq(UserTable.verificationCode, code)));

    if (!user) {
        throw new Error("Invalid verification code");
    }

    await db
        .update(UserTable)
        .set({ verified: true })
        .where(eq(UserTable.userId, user.userId));

    const [updatedUser] = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.userId, user.userId));

    const token = jwt.sign(
        { userId: updatedUser.userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
    );

    return { user: updatedUser, token };
};