import { Request, Response } from "express"
import User from "../models/User"
import { hashPassword } from "../utils/auth"

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            // Prevent duplicate users
            const userExists = await User.findOne({ email: req.body.email })
            if (userExists) {
                const error = new Error("User already exists")
                res.status(409).json({ error: error.message })
                return
            }

            // Create user
            const user = new User(req.body)

            // Hash password
            user.password = await hashPassword(user.password)

            await user.save()
            res.send("Account created successfully")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }
}