import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

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

            const token = generateJWT({ id: user.id })

            res.send(token)
            // res.send("Logged in successfully")
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

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            // Check if user exists
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                const error = new Error("User not found")
                res.status(404).json({ error: error.message })
                return
            }

            // Generate token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Send email
            AuthEmail.sendPasswordResetToken({ email: user.email, name: user.name, token: token.token })

            res.send("Check your email for instructions")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error("Invalid token")
                res.status(404).json({ error: error.message })
                return
            }

            res.send("Valid token, set your new password")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error("Invalid token")
                res.status(404).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(req.body.password)
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send("Password was successfully changed")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
        return
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExists = await User.findOne({ email })
        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error("User already exists")
            res.status(409).json({ error: error.message })
            return
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send("Profile updated successfully")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { currentPassword, password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(currentPassword, user.password)
        if (!isPasswordCorrect) {
            const error = new Error("Incorrect current password")
            res.status(401).json({ error: error.message })
            return
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send("Password was successfully changed")
        } catch (error) {
            res.status(500).json({ error: "There was an error" })
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error("Incorrect password")
            res.status(401).json({ error: error.message })
            return
        }

        res.send("Password is correct")
    }
}