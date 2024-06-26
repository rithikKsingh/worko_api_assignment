const express = require("express");
const userController = require("../controllers/userController");
const { validator, validateLogin } = require("../middleware/validator");
const queryValidator = require("../middleware/queryValidator");
const {
  authenticateMiddleware,
  adminAuthenticateMiddleware,
} = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/worko/user", validator, userController.createUser);
router.post("/worko/user/login", validateLogin, userController.login);

// Authenticated routes
router.use(authenticateMiddleware);

router.put("/worko/user/:userId", validator, userController.updateUser);

// Admin-only routes
router.use(adminAuthenticateMiddleware);

router.get("/worko/users", queryValidator, userController.getUsers);
router.get("/worko/user/:userId", userController.getUserById);
router.delete("/worko/user/:userId", userController.deleteUser);

module.exports = router;
