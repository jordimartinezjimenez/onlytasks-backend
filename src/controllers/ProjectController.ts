import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    // { manager: req.user.id }
                    { manager: { $in: req.user.id } },
                    { team: { $in: req.user.id } }
                ]
            })
            res.json(projects)
        } catch (error) {
            console.error(error)
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id).populate("tasks")

            if (!project) {
                const error = new Error("Project not found")
                res.status(404).json({ error: error.message })
                return
            }

            if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error("Invalid action")
                res.status(404).json({ error: error.message })
                return
            }

            res.json(project)
        } catch (error) {
            console.error(error)
        }
    }

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)

        project.manager = req.user.id

        try {
            await project.save()
            // await Project.create(req.body)
            res.send("Project created successfully")
        } catch (error) {
            console.error(error)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        // const { id } = req.params
        try {
            // const project = await Project.findById(id)

            // if (!project) {
            //     const error = new Error("Project not found")
            //     res.status(404).json({ error: error.message })
            //     return
            // }

            // if (project.manager.toString() !== req.user.id.toString()) {
            //     const error = new Error("Only the manager can update this project")
            //     res.status(404).json({ error: error.message })
            //     return
            // }

            req.project.projectName = req.body.projectName
            req.project.clientName = req.body.clientName
            req.project.description = req.body.description

            await req.project.save()
            res.send("Project updated")
        } catch (error) {
            console.error(error)
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        // const { id } = req.params
        try {
            // const project = await Project.findById(id)

            // if (!project) {
            //     const error = new Error("Project not found")
            //     res.status(404).json({ error: error.message })
            //     return
            // }

            // if (project.manager.toString() !== req.user.id.toString()) {
            //     const error = new Error("Only the manager can delete this project")
            //     res.status(404).json({ error: error.message })
            //     return
            // }

            await req.project.deleteOne()
            res.send("Project deleted")
        } catch (error) {
            console.error(error)
        }
    }
}