import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({})
            res.json(projects)
        } catch (error) {
            console.error(error)
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id)

            if (!project) {
                const error = new Error("Project not found")
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

        try {
            await project.save()
            // await Project.create(req.body)
            res.send("Project created")
        } catch (error) {
            console.error(error)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            const project = await Project.findByIdAndUpdate(id, req.body)

            if (!project) {
                const error = new Error("Project not found")
                res.status(404).json({ error: error.message })
                return
            }

            await project.save()
            res.send("Project updated")
        } catch (error) {
            console.error(error)
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        const { id } = req.params
        try {
            // const project = await Project.findByIdAndDelete(id)
            const project = await Project.findById(id)

            if (!project) {
                const error = new Error("Project not found")
                res.status(404).json({ error: error.message })
                return
            }

            await project.deleteOne()
            res.send("Project deleted")
        } catch (error) {
            console.error(error)
        }
    }
}