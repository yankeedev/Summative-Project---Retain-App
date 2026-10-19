import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/user";

const router = Router();
function publicUser(user: { _id: unknown; name: string; email: string; role: string }) {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email and password are required" });
    return;
  }
  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    res.status(409).json({ message: "Email already registered" });
    return;
  }
  const user = await User.create({
    name: String(name),
    email: String(email).toLowerCase(),
    password: await bcrypt.hash(String(password), 10),
    role: "user",
  });
  res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
});
router.post("/signin", async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = await User.findOne({ email: String(email ?? "").toLowerCase() });
  if (!user || !(await bcrypt.compare(String(password ?? ""), user.password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  res.json({ token: signToken(user.id), user: publicUser(user) });
});
export default router;