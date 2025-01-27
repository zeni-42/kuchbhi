"use server"
import ResponseHelper from "@/lib/ResponseHelper"
import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    const prisma = new PrismaClient() 
    const { rollNo } = await request.json()
    if (!rollNo) {
        return ResponseHelper.error(null, "Rollno is required", 400)
    }

    try {
        const cookie = await cookies()
        const token = cookie.get("token")

        const user = await prisma.user.findUnique({
            where: { rollNo }
        })
        if (!user) {
            return ResponseHelper.error(null, "User not found", 404)
        }

        if (user.token !== token?.value) {
            return ResponseHelper.error(null, "Unauthorized to logout", 403)
        }

        cookie.delete("token")
        return ResponseHelper.success({}, "User logout successfully", 200)
    } catch (error) {
        console.log("Somthing went wrong in the logout route");
        return ResponseHelper.error(error, "Internal server error", 500)
    }
}