import { Router } from "express"
import { body, param } from "express-validator"
import { AuthController } from "../controllers/AuthController"
import { handleInputErrors } from "../middleware/validation"
import { authenticate } from "../middleware/auth"

const router = Router()

router.post("/create-account",
    body("email")
        .isEmail().withMessage("Email must be valid"),
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("confirmPassword")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match")
            }
            return true
        }),
    body("name")
        .notEmpty().withMessage("Name is required"),
    handleInputErrors,
    AuthController.createAccount
)

router.post("/confirm-account",
    body("token")
        .notEmpty().withMessage("Token is required"),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post("/login",
    body("email")
        .isEmail().withMessage("Email must be valid"),
    body("password")
        .notEmpty().withMessage("Password is required"),
    handleInputErrors,
    AuthController.login
)

router.post("/request-code",
    body("email")
        .isEmail().withMessage("Email must be valid"),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post("/forgot-password",
    body("email")
        .isEmail().withMessage("Email must be valid"),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post("/validate-token",
    body("token")
        .notEmpty().withMessage("Token is required"),
    handleInputErrors,
    AuthController.validateToken
)

router.post("/update-password/:token",
    param("token")
        .notEmpty().withMessage("Token is required")
        .isNumeric().withMessage("Invalid token"),
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("confirmPassword")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match")
            }
            return true
        }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get("/user",
    authenticate,
    AuthController.user
)

// Profile
router.put("/profile",
    authenticate,
    body("name")
        .notEmpty().withMessage("Name is required"),
    body("email")
        .isEmail().withMessage("Email must be valid"),
    handleInputErrors,
    AuthController.updateProfile
)

router.post("/update-password",
    authenticate,
    body("currentPassword")
        .notEmpty().withMessage("Current password is required"),
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("confirmPassword")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match")
            }
            return true
        }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

export default router