var express = require("express");
var router = express.Router();
var authController = require("../controllers/auth.controller");

/**
 * @route POST /login
 * @desc Iniciar sesión
 * @access Public
 */
router.post(
    "/login",
    authController.loginUser
);

/**
 * @route POST /recovery-password/:token
 * @desc Recuperar la contraseña usando token de recuperacion creado y enviado a su gmail
 * @access Public
 */
router.post("/recovery-password/:token", authController.recoverPassword);

/**
 * @route POST /forgot-passord
 * @desc Generate token and send it to the email to recover it
 * @access Public
 */
router.post("/forgot-password", authController.generatePasswordRecoveryToken);

module.exports = router;