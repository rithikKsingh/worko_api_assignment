const userDao = require("../dao/userDao.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (userData) => {
  return await userDao.createUser(userData);
};

const getUserById = async (id) => {
  return await userDao.getUserById(id);
};

const getUsers = async ({
  page,
  limit,
  sortBy,
  order,
  name,
  city,
  zipCode,
}) => {
  const offset = (page - 1) * limit;
  const filters = { name, city, zipCode };
  return await userDao.getUsers({ offset, limit, sortBy, order, filters });
};

const login = async (email, password) => {
  const existingUser = await userDao.findUserByEmail(email);
  if (!existingUser) {
    return { error: "User is not registered" };
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) {
    return { error: "Invalid password" };
  }

  const token = jwt.sign(
    {
      userId: existingUser._id,
      email: existingUser.email,
      isAdmin: existingUser.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token };
};

const updateUser = async (id, userData) => {
  return await userDao.updateUser(id, userData);
};

const deleteUser = async (id) => {
  return await userDao.deleteUser(id);
};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  login,
};
