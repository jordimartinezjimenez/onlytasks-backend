import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"

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

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send email
            AuthEmail.sendConfirmationEmail({ email: user.email, name: user.name, token: token.token })

            await Promise.allSettled([user.save(), token.save()])
            res.send("Account created successfully")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error("Invalid token")
                res.status(404).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send("Account confirmed successfully")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error("User not found")
                res.status(404).json({ error: error.message })
                return
            }

            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()

                AuthEmail.sendConfirmationEmail({ email: user.email, name: user.name, token: token.token })

                await Promise.allSettled([token.save(), user.save()])

                const error = new Error("Account not confirmed, check your email")
                res.status(401).json({ error: error.message })
                return
            }

            const validPassword = await checkPassword(password, user.password)
            if (!validPassword) {
                const error = new Error("Incorrect password")
                res.status(401).json({ error: error.message })
                return
            }

            res.send("Logged in successfully")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            // Check if user exists
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                const error = new Error("User not found")
                res.status(404).json({ error: error.message })
                return
            }

            if (user.confirmed) {
                const error = new Error("Account already confirmed")
                res.status(403).json({ error: error.message })
                return
            }

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send email
            AuthEmail.sendConfirmationEmail({ email: user.email, name: user.name, token: token.token })

            await Promise.allSettled([user.save(), token.save()])
            res.send("A new token has been sent to your email")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }
}