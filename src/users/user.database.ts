import { User, UnitUser, Users } from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadUsers(): Users {
  try {
    const usersPath = resolve("users.json");
    const data = readFileSync(usersPath, "utf-8");


    if (!data.trim()) return {};

    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading users: ${error}`);
    return {};
  }
}


function saveUsers() {
  try {
    const usersPath = resolve("users.json");
    writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf-8");
    console.log("User data saved successfully!");
  } catch (error) {
    console.error(`Error saving users: ${error}`);
  }
}


let users: Users = loadUsers();

export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

export const findOne = async (id: string): Promise<UnitUser | null> => {
  return users[id] || null;
};

export const create = async (userData: UnitUser): Promise<UnitUser> => {
  let id = uuidv4();
  while (users[id]) id = uuidv4(); 

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const newUser: UnitUser = {
    id,
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
  };

  users[id] = newUser;
  saveUsers();

  return newUser;
};

export const findByEmail = async (email: string): Promise<UnitUser | null> => {
  return Object.values(users).find(user => user.email === email) || null;
};

export const comparePassword = async (email: string, password: string): Promise<boolean> => {
  const user = await findByEmail(email);
  if (!user) return false;
  return bcrypt.compare(password, user.password);
};

export const update = async (id: string, updateValues: User): Promise<UnitUser | null> => {
  if (!users[id]) return null;

  if (updateValues.password) {
    const salt = await bcrypt.genSalt(10);
    updateValues.password = await bcrypt.hash(updateValues.password, salt);
  }

  users[id] = { ...users[id], ...updateValues };
  saveUsers();

  return users[id];
};

export const remove = async (id: string): Promise<boolean> => {
  if (!users[id]) return false;
  delete users[id];
  saveUsers();
  return true;
};
