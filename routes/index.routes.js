const express = require("express");
const userRouter = require("./user.routes");
const authRouter = require("./auth.routes");

const router = express.Router();

router.get("/", (req, res, next) => {
    res.render("index", { title: "Express" });
});

router.use("/auth", authRouter);
router.use("/users", userRouter);

module.exports = router;