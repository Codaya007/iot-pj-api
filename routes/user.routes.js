var express = require("express");
var router = express.Router();
var userController = require("../controllers/user.controller");
const isLoggedIn = require("../policies/isLoggedIn");

/**
 *  @route GET /
 *  @dec Obtener todas las users
 *  @access Logged
 */

router.get("/", isLoggedIn, userController.getAllUsers);

/**
 * @route GET /:id
 * @desc Obtener user por id
 * @access Public
 */
router.get("/:_id", userController.getUserByExternalId);

/**
 * @route POST/
 * @desc Crear user
 * @access Public
 */

router.post(
    "/",
    userController.createUser
);

/**
 * @route PUT /:id
 * @desc Actualizar user por id
 * @access Public
 */

router.put(
    "/:_id",
    isLoggedIn,
    userController.updateUser
);

/**
 * @route DELETE /:id
 * @desc Bloquear usuario por id
 * @access Logged
 */
router.delete("/:_id", isLoggedIn, userController.deleteUser);

module.exports = router;