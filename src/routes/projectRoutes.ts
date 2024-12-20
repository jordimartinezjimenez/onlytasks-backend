import { Router } from "express"
import { body, param } from "express-validator"
import { ProjectController } from "../controllers/ProjectController"
import { handleInputErrors } from "../middleware/validation"
import { TaskController } from "../controllers/TaskController"
import { projectExists } from "../middleware/project"
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task"
import { authenticate } from "../middleware/auth"
import { TeamMemberController } from "../controllers/TeamController"
import { NoteController } from "../controllers/NoteController"

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

router.param("projectId", projectExists)

router.put("/:projectId",
    param("projectId").isMongoId().withMessage("Invalid ID"),
    body("projectName")
        .notEmpty().withMessage("Project Name is required"),
    body("clientName")
        .notEmpty().withMessage("Client Name is required"),
    body("description")
        .notEmpty().withMessage("Description of the project is required"),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
)

router.delete("/:projectId",
    param("projectId").isMongoId().withMessage("Invalid ID"),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject
)

// Routes for Tasks

router.post("/:projectId/tasks",
    // projectExists,
    hasAuthorization,
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
    hasAuthorization,
    param("projectId").isMongoId().withMessage("Invalid ID"),
    body("name")
        .notEmpty().withMessage("Task Name is required"),
    body("description")
        .notEmpty().withMessage("Description of the task is required"),
    handleInputErrors,
    TaskController.updateTask
)

router.delete("/:projectId/tasks/:taskId",
    hasAuthorization,
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

// Routes for teams
router.post("/:projectId/team/find",
    body("email")
        .isEmail().toLowerCase().withMessage("Email must be valid"),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get("/:projectId/team",
    TeamMemberController.getProjectTeam
)

router.post("/:projectId/team",
    body("id")
        .isMongoId().withMessage("Invalid ID"),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete("/:projectId/team/:userId",
    param("userId")
        .isMongoId().withMessage("Invalid ID"),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

// Routes for Notes
router.post("/:projectId/tasks/:taskId/notes",
    body("content")
        .notEmpty().withMessage("Content is required"),
    handleInputErrors,
    NoteController.createNote
)

router.get("/:projectId/tasks/:taskId/notes",
    NoteController.getTaskNotes
)

router.delete("/:projectId/tasks/:taskId/notes/:noteId",
    param("noteId").isMongoId().withMessage("Invalid ID"),
    handleInputErrors,
    NoteController.deleteNote
)

export default router