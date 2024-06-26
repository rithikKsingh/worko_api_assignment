const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");

const createUser = async (userData) => {
  const { password } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ ...userData, password: hashedPassword });
  return await user.save();
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const getUserById = async (id) => {
  return await User.findById(id).where("isDeleted").equals(false);
};

const getUsers = async ({ offset, limit, sortBy, order, filters }) => {
  const query = {};
  if (filters.name) query.name = new RegExp(filters.name, "i");
  if (filters.city) query.city = new RegExp(filters.city, "i");
  if (filters.zipCode) query.zipCode = new RegExp(filters.zipCode, "i");
  query.isDeleted = false;
  return await User.find(query)
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip(offset)
    .limit(limit);
};

const updateUser = async (id, userData) => {
  return await User.findByIdAndUpdate(id, userData, { new: true })
    .where("isDeleted")
    .equals(false);
};

const deleteUser = async (id) => {
  return await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  findUserByEmail,
};
