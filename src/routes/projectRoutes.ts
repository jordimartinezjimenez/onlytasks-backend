import { Router } from "express"
import { body, param } from "express-validator"
import { ProjectController } from "../controllers/ProjectController"
import { handleInputErrors } from "../middleware/validation"
import { TaskController } from "../controllers/TaskController"
import { projectExists } from "../middleware/project"
import { taskBelongsToProject, taskExists } from "../middleware/task"
import { authenticate } from "../middleware/auth"

const router = Router()

router.use(authenticate)

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

// Routes for Tasks
router.param("projectId", projectExists)

router.post("/:projectId/tasks",
    // projectExists,
    body("name")
        .notEmpty().withMessage("Task Name is required"),
    body("description")
        .notEmpty().withMessage("Description of the task is required"),
    handleInputErrors,
    TaskController.createTask
)

router.get("/:projectId/tasks",
    TaskController.getProjectTasks
)

router.param("taskId", taskExists)
router.param("taskId", taskBelongsToProject)

router.get("/:projectId/tasks/:taskId",
    param("projectId").isMongoId().withMessage("Invalid ID"),
    handleInputErrors,
    TaskController.getTaskById
)

router.put("/:projectId/tasks/:taskId",
    param("projectId").isMongoId().withMessage("Invalid ID"),
    body("name")
        .notEmpty().withMessage("Task Name is required"),
    body("description")
        .notEmpty().withMessage("Description of the task is required"),
    handleInputErrors,
    TaskController.updateTask
)

router.delete("/:projectId/tasks/:taskId",
    param("projectId").isMongoId().withMessage("Invalid ID"),
    handleInputErrors,
    TaskController.deleteTask
)

router.post("/:projectId/tasks/:taskId/status",
    param("projectId").isMongoId().withMessage("Invalid ID"),
    body("status")
        .notEmpty().withMessage("Status is required"),
    handleInputErrors,
    TaskController.updateStatus
)

export default router