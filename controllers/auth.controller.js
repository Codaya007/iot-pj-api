const bcrypt = require("bcrypt");
const transporter = require("../config/emailConfig");
const { User } = require("../models");
const { generateToken, generateUrlFriendlyToken, hashPassword } = require("../utils");
const { FRONTEND_BASEURL } = process.env;

module.exports = {
    loginUser: async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ status: 400, message: "La cuenta no fue encontrada" });
        }
        if (user.state == "BLOQUEADA") {
            return res.json({ status: 401, message: "Cuenta bloqueada" });
        }
        if (user.state == "INACTIVA") {
            return res.json({ status: 401, message: "Cuenta inactivada" });
        }
        const compare = bcrypt.compareSync(password, user.password);
        if (!compare) {
            return res.json({ status: 401, message: "Credenciales incorrectas" });
        }
        const payload = { id: user.id };
        const token = await generateToken(payload);

        return res.json({ user, token });
    },

    generatePasswordRecoveryToken: async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ status: 400, message: "Email incorrecto" });
        }

        const token = generateUrlFriendlyToken();
        user.token = token;
        user.tokenExpiresAt = new Date(Date.now() + 3 * 60 * 60 * 100);
        await user.save();

        const mailOptions = {
            from: transporter.options.auth.user,
            to: email,
            subject: "Recuperación de contraseña",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="text-align: center; color: #333;">Recuperación de contraseña</h2>
            <p style="font-size: 16px; color: #333;">
                Hola,</p>
            <p style="font-size: 16px; color: #333;">
                Has solicitado la recuperación de tu contraseña. Para continuar con el proceso, por favor haz clic en el siguiente botón o copia y pega el enlace en tu navegador:
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${FRONTEND_BASEURL}/auth/recovery-password/${token}" style="padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; border-radius: 5px; text-decoration: none;">
                Recuperar Contraseña
                </a>
            </div>
            <p style="font-size: 16px; color: #333;">
                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual permanecerá segura.
            </p>
            <p style="font-size: 16px; color: #333;">
                Gracias,
                <br/>
                El equipo de soporte
            </p>
            <hr style="border-top: 1px solid #e0e0e0;"/>
            <p style="font-size: 12px; text-align: center; color: #999;">
                Si tienes problemas haciendo clic en el botón, copia y pega el siguiente enlace en tu navegador:
                <br/>
                <a href="${FRONTEND_BASEURL}/auth/recovery-password/${token}" style="color: #007bff;">${FRONTEND_BASEURL}/auth/recovery-password/${token}</a>
            </p>
            </div>`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            message: "El link de acceso se le envio a su email de registro",
        });
    },

    recoverPassword: async (req, res, next) => {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ token });

        if (!user) {
            return res.json({ status: 400, message: "Token invalido" });
        }

        if (Date.now() > user.tokenExpiresAt) {
            return res.json({ status: 401, message: "Token a expirado" });
        }

        user.password = await hashPassword(password);
        const newUser = await user.save();

        if (!newUser) {
            return next({
                status: 400,
                message: "No se ha podido recuperar la contraseña, intente más tarde",
            });
        }

        res.json({
            message: "Contraseña actualizada exitosamente",
        });
    },
};