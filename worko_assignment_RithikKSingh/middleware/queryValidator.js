const Joi = require("joi");

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  sortBy: Joi.string().valid("age", "name").default("name"),
  order: Joi.string().valid("asc", "desc").default("asc"),
  name: Joi.string().optional(),
  city: Joi.string().optional(),
  zipCode: Joi.string().optional(),
});

const queryValidator = (req, res, next) => {
  try {
    querySchema.validate(req.query);
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).send(error.details[0].message);
  }
};

module.exports = queryValidator;
