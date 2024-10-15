import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        await transporter.sendMail({
            from: "OnlyTasks <onlytasks.com>",
            to: user.email,
            subject: "OnlyTasks - Verify your account",
            text: "OnlyTasks - Verify your account",
            html: `
                <p>Hi <strong>${user.name}</strong>, you have created your <strong>OnlyTasks</strong> account, it's almost ready, you just need to confirm your account.</p>
                <p>Visit the following link:</p>
                <a href="">Confirm account</a>
                <p>And enter the code: <strong>${user.token}</strong></p>
                <p>This token expires in 10 minutes</p>
            `
        })
    }
}