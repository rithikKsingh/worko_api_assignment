const userService = require("../services/userService");


const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await userService.login(email, password);
    if (response.error)
      return res.status(400).json({ message: response.error });

    const { token } = response;
    return res
      .clearCookie("access_token")
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({ message: "User logged in successfully" });
  } catch (error) {
    console.log("Login error : ", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    if (!user) return res.status(404).send("User not found");
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getUsers = async (req, res) => {
  try {
    const { page, limit, sortBy, order, name, city, zipCode } = req.query;
    const users = await userService.getUsers({
      page,
      limit,
      sortBy,
      order,
      name,
      city,
      zipCode,
    });
    res.status(200).send(users);
  } catch (err) {
    console;
    res.status(500).send(err.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.userId, req.body);
    if (!user) return res.status(404).send("User not found");
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.userId);
    if (!user) return res.status(404).send("User not found");
    res.status(200).send("User deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  login,
};
