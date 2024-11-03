import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        await transporter.sendMail({
            from: "OnlyTasks <jordimj63@gmail.com>",
            to: user.email,
            subject: "OnlyTasks - Confirm your account",
            text: "OnlyTasks - Confirm your account",
            html: `<div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #444; text-align: center;">Welcome to OnlyTasks, ${user.name}!</h2>
                            <p style="font-size: 16px; line-height: 1.5; color: #555;">You've created your <strong>OnlyTasks</strong> account - you're almost there! You just need to confirm your account to start using it.</p>
                            <p style="font-size: 16px; line-height: 1.5; color: #555;">To confirm your account, please visit the following link:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTEND_URL}/auth/confirm-account" style="display: inline-block; padding: 10px 20px; background-color: #10a09e; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">Confirm Account</a>
                            </div>
                            <p style="font-size: 16px; line-height: 1.5; color: #555;">You can also enter the following code to confirm your account:</p>
                        <div style="text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;"> ${user.token} </div>
                            <p style="font-size: 16px; line-height: 1.5; color: #555;"><strong>Note:</strong> This token expires in 10 minutes.</p>
                            <p style="text-align: center; color: #999; font-size: 14px; margin-top: 20px;">If you have not requested this account, you can ignore this message.</p>
                        </div>
                    </div>
                    `
        })
    }

    static sendPasswordResetToken = async (user: IEmail) => {
        await transporter.sendMail({
            from: "OnlyTasks <jordimj63@gmail.com>",
            to: user.email,
            subject: "OnlyTasks - Reset your password",
            text: "OnlyTasks - Reset your password",
            html: `<div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #444; text-align: center;">Hi, ${user.name}!</h2>
                            <p style="font-size: 16px; line-height: 1.5; color: #555;">You have requested to reset your <strong>OnlyTasks</strong> account password</p>
                            <p style="font-size: 16px; line-height: 1.5; color: #555;">To reset your password, please visit the following link:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTEND_URL}/auth/new-password" style="display: inline-block; padding: 10px 20px; background-color: #10a09e; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">Reset Password</a>
                            </div>
                            <p style="font-size: 16px; line-height: 1.5; color: #555;">And enter the following code to confirm your account and be able to change your password:</p>
                        <div style="text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;"> ${user.token} </div>
                            <p style="font-size: 16px; line-height: 1.5; color: #555;"><strong>Note:</strong> This token expires in 10 minutes.</p>
                            <p style="text-align: center; color: #999; font-size: 14px; margin-top: 20px;">If you have not requested this account, you can ignore this message.</p>
                        </div>
                    </div>
                    `
        })
    }
}
