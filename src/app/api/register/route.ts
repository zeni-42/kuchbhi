"use server"
import bcrypt from "bcryptjs"
import ResponseHelper from "@/lib/ResponseHelper"
import { PrismaClient, userRole } from "@prisma/client"

export async function POST(request: Request){
    const prisma = new PrismaClient()
    const {fullName, rollNo, password, isStudent} = await request.json()
    if (!fullName || !rollNo || !password) return ResponseHelper.error(null ,"All fields are required", 400)

    try {
        const existingUser = await prisma.user.findFirst({
            where: { rollNo }
        })
        if (existingUser) {
            return ResponseHelper.error(null, "User already exist", 410)
        }

        let userRoleValue: userRole;
        if (isStudent) {
            userRoleValue = "Student";
        } else {
            userRoleValue = "Alumuni";
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
        data: {
            fullName,
            rollNo,
            password: hashedPassword,
            userType: userRoleValue
        }
        })

        const createdUser = await prisma.user.findFirst({
            where: { rollNo },
            select:{
                id: true,
                fullName: true,
                rollNo: true,
                userType: true,
                avatar: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if(!createdUser) return ResponseHelper.error(null, "User not registered!", 403)

        return ResponseHelper.success(createdUser, "User registerd", 200)
    } catch(error: unknown ) {
        console.log("Somthing went wrong in register route")
        return ResponseHelper.error(error ,"Internal server error", 500)
    } finally {
        await prisma.$disconnect()
    }
}