import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/user.model";
import { IUser } from "../interface/user.interface";
import { v4 as uuidv4 } from "uuid";
import EmailConnection from "../config/nodeMailer.config";
import { VerifyAccount } from "../template/mailTemplate";

dotenv.config();

export const registerUser = async ({ body }: Request, res: Response) => {
  const userBody: IUser = {
    name: body.name,
    surname: body.surname,
    email: body.email,
    password: await bcrypt.hash(body.password, 10),
    verify: uuidv4(),
  };

  try {
    const newUser = await User.create(userBody);
    if (newUser)
      await EmailConnection(
        newUser.email,
        "Valide Email",
        VerifyAccount(String(newUser.verify))
      );
    return res.status(201).json({ message: "Successfully registered user" });
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const loginUser = async ({ body }: Request, res: Response) => {
  const { email, password }: IUser = body;
  try {
    const user = await User.findOne({ email, verify: { $exists: false } });
    if (user) {
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (passwordCompare) {
        const token = jwt.sign(
          { id: user.id, email: user.email },
          String(process.env.SECRET_KEY)
        );
        return res.status(200).json({
          data: {
            name: user.name,
            surname: user.surname,
            fullname: `${user.name} ${user.surname}`,
            email: user.email,
          },
          token,
        });
      } else if (!passwordCompare) {
        return res.status(403).json({ message: "Wrong email or password" });
      }
    }
    return res.status(401).json({ message: "User not verified" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const validateUser = async (
  { params: { verifytoken } }: Request,
  res: Response
) => {
  try {
    const validationUser = await User.findOneAndUpdate(
      { verify: verifytoken },
      { $unset: { verify: 1 } }
    );
    if (validationUser) {
      return res.status(200).json({ message: "User as been validate" });
    }
    return res
      .status(400)
      .json({ message: "This token is not associated with any user" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
