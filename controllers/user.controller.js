const { User } = require("../models");
const { hashPassword } = require("../utils");

module.exports = {
    getAllUsers: async (req, res) => {
        const { skip = 0, limit = 10, ...where } = req.query;

        const allAccounts = await User.find(where).skip(skip).limit(limit);
        where.deletedAt = null;
        const numberAccounts = await User.countDocuments(where);

        res.json({ totalCount: numberAccounts, results: allAccounts });
    },

    getUserByExternalId: async (req, res, next) => {
        const { _id } = req.params;
        const userA = await User.findOne({ _id });
        if (!userA) {
            return res.status(400).json({ status: 400, message: "El usuario no fue encontrado" });
        }
        return res.json(userA);
    },

    updateUser: async (req, res, next) => {
        const { _id } = req.params;
        let user = await User.findOne({ _id });

        if (!user) {
            return res.status(400).json({ status: 400, message: "El usuario no fue encontrado" });
        }

        if (req.body.password) {
            req.body.password = await hashPassword(req.body.password);
        }


        user = await User.findOneAndUpdate({ _id }, req.body, {
            new: true,
        });

        return res.json(user);
    },

    createUser: async (req, res) => {
        const userExist = await User.findOne({ email: req.body.email });
        const password = "Mayonesa12345.";

        const hashedPassword = await hashPassword(password);
        req.body.password = hashedPassword;

        if (userExist) {
            return res.json({ status: 400, message: "El usuario ya existe" });
        }

        const user = await User.create({
            ...req.body,
        });

        return res.json(user);
    },

    deleteUser: async (req, res) => {
        const { _id } = req.params;

        let user = await User.deleteOne({ _id });

        if (!user) {
            return res.status(400).json({ status: 400, message: "El usuario no existe" });
        }

        return res.json(user);
    },
};