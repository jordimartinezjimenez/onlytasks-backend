import { Router } from "express"
import { body, param } from "express-validator"
import { ProjectController } from "../controllers/ProjectController"
import { handleInputErrors } from "../middleware/validation"

const router = Router()

router.get("/", ProjectController.getAllProjects)

router.get("/:id",
    param("id").isMongoId().withMessage("Invalid ID"),
    handleInputErrors,
    ProjectController.getProjectById
)

router.post("/",
    body("projectName")
        .notEmpty().withMessage("Project Name is required"),
    body("clientName")
        .notEmpty().withMessage("Client Name is required"),
    body("description")
        .notEmpty().withMessage("Description of the project is required"),
    handleInputErrors,
    ProjectController.createProject
)

router.put("/:id",
    param("id").isMongoId().withMessage("Invalid ID"),
    body("projectName")
        .notEmpty().withMessage("Project Name is required"),
    body("clientName")
        .notEmpty().withMessage("Client Name is required"),
    body("description")
        .notEmpty().withMessage("Description of the project is required"),
    handleInputErrors,
    ProjectController.updateProject
)

router.delete("/:id",
    param("id").isMongoId().withMessage("Invalid ID"),
    handleInputErrors,
    ProjectController.deleteProject
)

export default router