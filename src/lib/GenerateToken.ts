import jwt from "jsonwebtoken";

export const generateToken = async (id: number, fullName: string, rollNo: string) => {
    const secret = process.env.TOKEN_SECRET || "testingsecret"
    if (!secret) {
        console.log("Secret not found")
        process.exit(1)
    }

    const token = jwt.sign(
        {
            userId: id,
            fullName: fullName,
            rollNo: rollNo
        }, 
        secret,
        { expiresIn: process.env.TOKEN_EXPIRY }
    )
    if (!token) {
        console.log("Token not generated")
        return null
    }
    
    return token
}