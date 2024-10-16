import { Router } from "express"
import { body } from "express-validator"
import { AuthController } from "../controllers/AuthController"
import { handleInputErrors } from "../middleware/validation"

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

export default router