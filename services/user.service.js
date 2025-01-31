const User = require("../models/Account");
const { hashPassword } = require("../utils");

const getAllUsers = async (where = {}, skip = 10, limit = 10) => {
    const allUsers = await User.find(where).skip(skip).limit(limit);
    return allUsers;
};

const getUserByExternalId = async (_id) => {
    const user = await User.findOne({ _id });

    if (!user) {
        res.json({ status: 400, message: "La usuario no fue encontrado" });
    }

    return user;
};

const createUser = async ({ password, ...newUser }) => {
    const userExist = await User.findOne({ email: newUser.email });
    const hashedPassword = await hashPassword(password);
    newUser.password = hashedPassword;

    if (userExist) {
        return res.json({ status: 400, message: "El usuario ya existe" });
    }

    const user = await User.create({
        ...newUser,
    });

    return user;
};

const updateUser = async (_id, newInfo) => {
    let user = await getUserByExternalId(_id);
    if (newInfo.password) {
        newInfo.password = await hashPassword(newInfo.password);
    }

    user = await User.findOneAndUpdate({ _id }, newInfo, {
        new: true,
    });

    return user;
};

const deleteUser = async (_id) => {
    const accountA = await getUserByExternalId(_id);

    if (!accountA) {
        return res.status(400).json({ status: 400, message: "El usuario no existe" });
    }

    const toDelete = await updateUser(_id, {
        email: null,
        deletedAt: new Date(),
    });

    return toDelete;
};

const getCountUsers = async (where = {}) => {
    where.deletedAt = null;
    return await User.countDocuments(where);
};

module.exports = {
    getAllUsers,
    getUserByExternalId,
    updateUser,
    deleteUser,
    createUser,
    getCountUsers,
};