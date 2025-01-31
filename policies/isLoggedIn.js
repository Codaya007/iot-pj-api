const { tokenValidation } = require("../utils");

module.exports = async (req, res, next) => {
    try {
        const bearerToken = req.header("Authorization");

        const user = await tokenValidation(bearerToken);

        if (user.deletedAt) {
            return next({
                status: 403,
                message:
                    "Su usuario fue dado de baja, contáctese con el administrador.",
            });
        }

        if (!user.enabled) {
            return next({
                status: 403,
                message: "Usuario bloqueado, contáctese con el administrador.",
            });
        }

        req.user = user;

        return next();
    } catch (error) {
        next({
            status: 401,
            message: error.message,
        });
    }
};