"use server"
import bcrypt from "bcryptjs"
import ResponseHelper from "@/lib/ResponseHelper"
import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"
import { generateToken } from "@/lib/GenerateToken"

export async function POST(request: Request ){
    const prisma = new PrismaClient()
    const { rollNo, password } = await request.json()

    if (!rollNo || !password) {
        return ResponseHelper.error(null, "All fields are required", 400)
    }

    try {    
        const user = await prisma.user.findUnique({
            where: { rollNo }
        })
        if(!user) {
            return ResponseHelper.error(null, "User does not exits", 404)
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) { 
            return ResponseHelper.error(null, "Invalid Password", 410)
        }
    
        const token = await generateToken(user.id, user.fullName, user.rollNo)
        if (token == null) { 
            return ResponseHelper.error(null, "Failed to generate token", 409)
        }
    
        await prisma.user.update({
            where: { rollNo },
            data: { token },
        })
    
    const loggedinUser = await prisma.user.findUnique({
        where : { rollNo },
        select: {
            id: true,
            fullName: true,
            rollNo: true,
            userType: true,
            avatar: true,
            createdAt: true,
            updatedAt: true
        }
    })
    if (!loggedinUser) return ResponseHelper.error(null, "Failed to login", 402)
    
    const cookieOptions = {
        secure: true,
        httpOnly: true,
        expire: 60*60*24*2
    }
    const cookie = await cookies()
    cookie.set("token", token, cookieOptions)
    return ResponseHelper.success(loggedinUser, "User loggedin successfully", 200)    

    } catch (error: unknown) {
        console.log("Somthing went wrong in login route")
        return ResponseHelper.error(error, "Internal server error", 500)
    } finally {
        await prisma.$disconnect()
    }
}