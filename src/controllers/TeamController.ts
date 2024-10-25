import type { Request, Response } from "express"
import User from "../models/User"
import Project from "../models/Project"

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body

        // Find user
        const user = await User.findOne({ email }).select("_id name email")

        if (!user) {
            const error = new Error("User not found")
            res.status(404).json({ error: error.message })
            return
        }

        res.json(user)
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project.id).populate({
            path: "team",
            select: "_id name email"
        })
        res.json(project.team)
    }

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body

        const user = await User.findById(id).select("_id")

        if (!user) {
            const error = new Error("User not found")
            res.status(404).json({ error: error.message })
            return
        }

        if (req.project.team.includes(user.id)) {
            const error = new Error("User already in team")
            res.status(409).json({ error: error.message })
            return
        }

        req.project.team.push(user.id)
        await req.project.save()
        res.send("User added successfully")
    }

    static removeMemberById = async (req: Request, res: Response) => {
        const { id } = req.body

        if (!req.project.team.includes(id)) {
            const error = new Error("User not found in team")
            res.status(409).json({ error: error.message })
            return
        }

        req.project.team = req.project.team.filter(member => member.toString() !== id)
        await req.project.save()
        res.send("User removed successfully")
    }
}