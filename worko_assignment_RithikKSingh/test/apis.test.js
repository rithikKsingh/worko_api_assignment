const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const { adminAuthenticateMiddleware } = require('../middleware/auth.js');
const app=require("../index.js")
const bcrypt = require('bcrypt');
const jwtMock = require('jsonwebtoken');
const sinon = require('sinon');
const userService = require('../services/userService.js');
const userDao = require('../dao/userDao.js');
const Joi = require('joi');

// Mock userDao methods
jest.mock('../dao/userDao', () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
}));

// Example of mocking mongoose in test setup
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
  }));
  

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

// Mock bcrypt.hash and jwt.sign for testing
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UserService', () => {
  let userDaoMock;
  let app;

  beforeEach(() => {
    userDaoMock = userDao; // Using the mocked userDao

    // Create a new express application
    app = express();

    // Middleware setup
    app.use(express.json());

    // Mock adminAuthenticateMiddleware
    app.use('/api', (req, res, next) => {
      // Mock JWT token for a non-admin user
      const tokenPayload = {
        userId: 'user123',
        isAdmin: false,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

      req.cookies = {
        access_token: token,
      };

      next();
    });

    // Admin-only routes setup
    const router = express.Router();
    router.use(adminAuthenticateMiddleware);

    router.get('/worko/users', (req, res) => {
      res.status(200).json({ message: 'List of users' });
    });

    router.get('/worko/user/:userId', (req, res) => {
      res.status(200).json({ message: `User details for ID: ${req.params.userId}` });
    });

    router.delete('/worko/user/:userId', (req, res) => {
      res.status(200).json({ message: `Deleted user with ID: ${req.params.userId}` });
    });

    app.use('/api', router);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore mocks after each test
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
        age: 30,
        city: 'Test City',
        zipCode: '12345',
      };
      const mockedUser = { ...userData, _id: 'mockedUserId' };
      userDaoMock.createUser.mockResolvedValue(mockedUser);

      // Validate user data against schema
      const { error } = userSchema.validate(userData);
      expect(error).toBeUndefined(); // Ensure no validation errors

      const createdUser = await userService.createUser(userData);
      expect(userDaoMock.createUser).toHaveBeenCalledWith(userData);
      expect(createdUser).toEqual(mockedUser);
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockedUser = {
        _id: 'mockedUserId',
        email: 'test@example.com',
        password: hashedPassword,
      };

      userDaoMock.findUserByEmail.mockResolvedValue(mockedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue('mockedToken');

      const loginResult = await userService.login(email, password);
      expect(userDaoMock.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockedUser.password);
      expect(loginResult.token).toEqual('mockedToken');
    });

    it('should return error for non-existing user', async () => {
      const email = 'nonexisting@example.com';
      const password = 'password';
      userDaoMock.findUserByEmail.mockResolvedValue(null);

      const loginResult = await userService.login(email, password);
      expect(loginResult.error).toEqual('User is not registered');
    });

    it('should return error for invalid password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('password', 10);
      const mockedUser = {
        _id: 'mockedUserId',
        email: 'test@example.com',
        password: hashedPassword,
      };

      userDaoMock.findUserByEmail.mockResolvedValue(mockedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const loginResult = await userService.login(email, password);
      expect(loginResult.error).toEqual('Invalid password');
    });
  });

  describe('Admin-only route access', () => {
    it('should return "Access denied. Admins only." for non-admin users', async () => {
      // Make request to admin-only route
      const res = await request(app)
        .get('/api/worko/users');

      // Assert response
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied. Admins only.');
    });
  });
});

describe('Admin Access to User Routes', () => {
    let adminToken;
  
    beforeAll(async () => {
      // Mock admin user and generate token
      const adminUser = {
        _id: 'mockedAdminId',
        email: 'admin@example.com',
        isAdmin: true,
      };
      adminToken = jwt.sign(adminUser, process.env.JWT_SECRET);
    });
      
  
    it('should return error for non-admin user', async () => {
      // Mock regular user token without isAdmin:true
      const regularUser = {
        _id: 'mockedUserId',
        email: 'user@example.com',
        isAdmin: false,
      };
      const regularToken = jwt.sign(regularUser, process.env.JWT_SECRET);
  
      const res = await request(app)
        .get('/api/worko/users') 
        .set('Cookie', `access_token=${regularToken}`);
  
      expect(res.status).toBe(403); // Expecting 403 for access denied
      expect(res.body.message).toBe('Access denied. Admins only.');
    });
  
    it('should return error for missing token', async () => {
      const res = await request(app)
        .get('/api/worko/users'); 
  
      expect(res.status).toBe(401); // Expecting 401 for missing token
      expect(res.body.message).toBe('Authorization token not provided');
    });
    
  });