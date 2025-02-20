import express, { Request, Response } from "express";
import { UnitUser, User } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const allUsers: UnitUser[] = await database.findAll();
    if (allUsers.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "No users found." });
    }
    return res.status(StatusCodes.OK).json({ total_users: allUsers.length, users: allUsers });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch users." });
  }
});


userRouter.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const user = await database.findOne(req.params.id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found." });
    }
    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch user." });
  }
});

userRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required fields." });
    }

    if (await database.findByEmail(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Email is already registered." });
    }

    const newUser = await database.create(req.body);
    return res.status(StatusCodes.CREATED).json(newUser);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to register user." });
  }
});

userRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide email and password." });
    }

    const user = await database.findByEmail(email);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Invalid email or password." });
    }

    const isValidPassword = await database.comparePassword(email, password);
    if (!isValidPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Incorrect password." });
    }

    return res.status(StatusCodes.OK).json({ msg: "Login successful", user });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Login failed." });
  }
});

userRouter.put("/user/:id", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "All fields are required." });
    }

    const user = await database.findOne(req.params.id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: `No user found with ID ${req.params.id}` });
    }

    const updatedUser = await database.update(req.params.id, req.body);
    return res.status(StatusCodes.OK).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to update user." });
  }
});

userRouter.delete("/user/:id", async (req: Request, res: Response) => {
  try {
    const userDeleted = await database.remove(req.params.id);
    if (!userDeleted) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "User does not exist." });
    }
    return res.status(StatusCodes.OK).json({ msg: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to delete user." });
  }
});
