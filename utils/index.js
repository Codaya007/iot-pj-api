const { Types } = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const ApiCustomError = require("../errors/ApiCustomError");
const { JWT_SECRET } = process.env;

/**
 * Valida si un string es un objectId válido
 * @param {String} string Id
 * @return {Boolean} Es valido
 */
const isValidObjectId = Types.ObjectId.isValid;

/**
 * Genera un string urlFriendly, que puede servir como token
 * @return {String} Devuelve token
 */
const generateUrlFriendlyToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

const generateToken = (payload, expiresIn = "7d") => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            JWT_SECRET,
            {
                expiresIn,
            },
            (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            }
        );
    });
};


const tokenValidation = async (tokenReceived) => {
    const [_, token] = tokenReceived?.split(" ") || [];
    if (!token) {
        throw new ApiCustomError("No existe token", null, 400);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const _id = decoded.id;
    const user = await User.findOne({ _id });

    if (!user) {
        throw new ApiCustomError("Token no valido", null, 400);
    }

    return user;
};

const hashPassword = async (password) => {
    const salt = 10;

    const passwordHashed = await bcrypt.hash(password, salt);

    return passwordHashed;
};

module.exports = {
    isValidObjectId,
    generateToken,
    generateUrlFriendlyToken,
    tokenValidation,
    hashPassword
};
