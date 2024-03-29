import { NextFunction, Request, Response } from "express";
import User from "../model/user.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";

dotenv.config();

const key = String(process.env.SECRET_KEY);

export const checkBodyValid = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validKeys = Object.keys(User.schema.obj);
  const bodyKeys = Object.keys(req.body);
  const invalidKeys = bodyKeys.filter((key) => !validKeys.includes(key));
  if (invalidKeys.length) {
    const errorMsg = `Invalid key(s) found in request body: ${invalidKeys.join(
      ", "
    )}`;
    return res.status(400).json({ error_message: errorMsg });
  }
  
  next();
};

export const emailUnique = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(409).json({ message: "Email is just present" });
  }
  next();
};

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }
  try {
    // Verify and decode the JWT token
    const decodedToken = jwt.verify(token, key);
    if (decodedToken) next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const checkErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const userValidation = [
  body("name").notEmpty(),
  body("surname").notEmpty(),
  body("email").notEmpty().isEmail().withMessage("Required Email"),
  body("password")
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage("short password"),
];

export const credentialsValidation = [
  body("email").isEmail().notEmpty().withMessage("Invalid Email"),
  body("password").isString().notEmpty().withMessage("Invalid Password"),
];
