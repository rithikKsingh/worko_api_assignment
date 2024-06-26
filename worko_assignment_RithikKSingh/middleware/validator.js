const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required(),
  name: Joi.string().required(),
  age: Joi.number().integer().min(1).max(99).required(),
  city: Joi.string().required(),
  zipCode: Joi.string().required(),
  password: Joi.string().required(),
  isAdmin: Joi.boolean().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required(),
  password: Joi.string().required(),
});

const validator = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
};

module.exports = { validator, validateLogin };
