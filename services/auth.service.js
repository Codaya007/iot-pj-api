const bcrypt = require("bcrypt");
const { User } = require("../models");
const { generateUrlFriendlyToken } = require("../utils");

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ status: 400, message: "La cuenta no fue encontrada" });
    }
    const compare = bcrypt.compareSync(password, user.password);
    if (!compare) {
        return res.json({ status: 401, message: "Credenciales incorrectas" });
    }
    return user;
};

const generatePasswordRecoveryToken = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ status: 401, message: "Email incorrecto" });
    }

    const token = generateUrlFriendlyToken();
    user.token = token;
    user.tokenExpiresAt = new Date(Date.now() + 3 * 60 * 60 * 100);
    await user.save();

    return token;
};

const validateTokenUser = async (token) => {
    const user = await User.findOne({ token });
    if (!user) {
        return res.json({ status: 400, message: "Token invalido" });
    }

    if (Date.now() > user.tokenExpiresAt) {
        return res.json({ status: 401, message: "Token a expirado" });
    }

    return user;
};
module.exports = {
    login,
    generatePasswordRecoveryToken,
    validateTokenUser,
};