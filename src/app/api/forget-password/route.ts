"use server"
import bcrypt from "bcryptjs"
import ResponseHelper from "@/lib/ResponseHelper"
import { PrismaClient } from "@prisma/client"

export async function POST(request: Request) {
    const prisma = new PrismaClient()
    const { rollNo, password, newPassword } = await request.json()
    if (!password || !newPassword || !rollNo) {
        return ResponseHelper.error(null, "All fields are required", 400)
    }

    try {
        const user = await prisma.user.findUnique({
            where: { rollNo }
        })
        if (!user) {
            return ResponseHelper.error(null, "User does not exist", 404)
        }

        const validPassword = bcrypt.compare(password, user.password)
        if (!validPassword) {
            return ResponseHelper.error(null, "Invalid credentials", 401)
        }

        const newHasedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUser = await prisma.user.update({
            where: { rollNo },
            data: {
                password: newHasedPassword
            },
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

        return ResponseHelper.success(updatedUser, "Password updated", 200)
    } catch (error) {
        console.log("Somthing went wrong in the forget-password route");
        return ResponseHelper.error(error, "INternal server error", 500)
    } finally {
        await prisma.$disconnect()
    }
}