import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const UserModel = User as unknown as import('mongoose').Model<any>;
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['user', 'farmer', 'admin']).optional(),
  farmName: z.string().optional(),
  farmLocation: z.string().optional(),
  remember: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['user', 'farmer', 'admin']).optional(),
  remember: z.boolean().optional(),
});

export const register: RequestHandler = async (req, res) => {
  try {
  const { email, password, name, role, farmName, farmLocation, remember } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { authId: `email-${email}` }],
    }).exec();
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Validate farmer registration has required fields
    if (role === 'farmer' && (!farmName || !farmLocation)) {
      return res.status(400).json({ error: "Farm name and location are required for farmer registration" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with specified role (default to 'user' if not provided)
    const user = new User({
      authId: `email-${email}`,
      email,
      name,
      password: hashedPassword,
      profileComplete: true,
      role: role || 'user',
      farmName: role === 'farmer' ? farmName : undefined,
      farmLocation: role === 'farmer' ? farmLocation : undefined,
    });
    await user.save();

    // Create JWT token
    const u = user as any;
    // If remember is true, issue a longer lived token
    const expiresIn = remember ? "30d" : "1d";
    const token = jwt.sign(
      { userId: u._id, authId: u.authId, role: u.role },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      token,
      user: {
        id: u._id,
        email: u.email,
        name: u.name,
        profileComplete: u.profileComplete,
        role: u.role,
        ...(u.role === 'farmer' && {
          farmName: u.farmName,
          farmLocation: u.farmLocation,
        }),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
  const { email, password, role, remember } = loginSchema.parse(req.body);

    // Find user
  const user = await UserModel.findOne({ email }).exec();
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Validate role matches - users can only login with their registered role
    if (role && user.role !== role) {
      if (role === 'farmer') {
        return res.status(403).json({ error: "This account is not registered as a Farmer. Please login as a Customer or register a new Farmer account." });
      } else if (role === 'user') {
        return res.status(403).json({ error: "This account is registered as a Farmer. Please login using the Farmer option." });
      } else {
        return res.status(403).json({ error: "Invalid role for this account." });
      }
    }

    // Use the user's actual role from database
    const userRole = user.role;

    // Create JWT token
    const uu = user as any;
    const expiresIn = remember ? "30d" : "1d";
    const token = jwt.sign(
      { userId: uu._id, authId: uu.authId, role: userRole },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      token,
      user: {
        id: uu._id,
        email: uu.email,
        name: uu.name,
        profileComplete: uu.profileComplete,
        role: userRole,
        ...(userRole === 'farmer' && {
          farmName: uu.farmName,
          farmLocation: uu.farmLocation,
        }),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyToken: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
  const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          profileComplete: user.profileComplete,
          role: (user as any).role,
          ...( (user as any).role === 'farmer' ? { farmName: (user as any).farmName, farmLocation: (user as any).farmLocation } : {} ),
        },
      });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Request password reset - generate a token and (in production) email it to the user.
export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      // Don't reveal whether account exists
      return res.json({ ok: true });
    }

    // Generate a secure one-time token and hash it before storing.
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const tokenHash = await bcrypt.hash(token, 12);
    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = expires;
    await user.save();

    // If SMTP is configured, send an email with the reset link. Otherwise (dev) return the token.
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
      try {
        // Dynamically import nodemailer to avoid a hard dependency during development if not installed
  const nodemailer = (await import('nod' + 'emailer')) as any;
  const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@example.com',
          to: email,
          subject: 'Reset your password',
          text: `To reset your password, visit: ${resetUrl}`,
          html: `<p>To reset your password, click <a href="${resetUrl}">here</a>.</p>`,
        });
        return res.json({ ok: true });
      } catch (err) {
        console.error('Failed to send reset email', err);
        // fallthrough to return token in response for non-production convenience
      }
    }

    // Dev fallback: return token so UI can use it directly during development/testing
    res.json({ ok: true, token });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password using token
export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const body = z.object({ token: z.string(), password: z.string().min(6) }).parse(req.body);
    const { token, password } = body;


  const user = await UserModel.findOne({ resetPasswordExpires: { $gt: new Date() } }).exec();
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

  // Compare provided token with stored hash
  const matches = user.resetPasswordTokenHash ? await bcrypt.compare(token, user.resetPasswordTokenHash) : false;
  if (!matches) return res.status(400).json({ error: 'Invalid or expired token' });

  // Hash new password and clear reset token hash
  const hashed = await bcrypt.hash(password, 12);
  user.password = hashed;
  user.resetPasswordTokenHash = undefined as any;
  user.resetPasswordExpires = undefined as any;
  await user.save();

    res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send OTP to a phone number (dev: return OTP in response). Stores hashed OTP on user document with expiry.
export const sendOTP: RequestHandler = async (req, res) => {
  try {
    const { phone } = z.object({ phone: z.string().min(8) }).parse(req.body);

    // Generate 6-digit OTP.
    // For the specific testing phone number 9601563635 always use 123456.
    const phoneDigits = phone.replace(/\D/g, '');
    let otp: string;
    if (phoneDigits === '9601563635') {
      otp = '123456';
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
    const otpHash = await bcrypt.hash(otp, 12);

    // Find or create a lightweight user record to attach OTP to (do not require full profile)
    let user = await UserModel.findOne({ phone }).exec();
    if (!user) {
      user = new User({ authId: `phone-${phone}`, phone, profileComplete: false, role: 'user' });
    }

    (user as any).otpHash = otpHash;
    (user as any).otpExpires = expires;
    await user.save();

    // In production, integrate with SMS provider here. For development, return the OTP in response
    res.json({ ok: true, otp });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify OTP: phone + otp; if user exists, sign them in, otherwise create account. Accepts optional remember flag.
export const verifyOTP: RequestHandler = async (req, res) => {
  try {
    const { phone, otp, remember } = z.object({ phone: z.string().min(8), otp: z.string(), remember: z.boolean().optional() }).parse(req.body);

    const user = await UserModel.findOne({ phone }).exec();
    if (!user || !(user as any).otpHash) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (!(user as any).otpExpires || new Date() > (user as any).otpExpires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const matches = await bcrypt.compare(otp, (user as any).otpHash);
    if (!matches) return res.status(400).json({ error: 'Invalid OTP' });

    // Clear OTP fields
    (user as any).otpHash = undefined;
    (user as any).otpExpires = undefined;
    await user.save();

    // Create JWT
    const expiresIn = remember ? '30d' : '1d';
    const token = jwt.sign({ userId: (user as any)._id, authId: (user as any).authId, role: (user as any).role }, JWT_SECRET, { expiresIn });

    res.json({ token, user: { id: (user as any)._id, phone: (user as any).phone, name: (user as any).name, profileComplete: (user as any).profileComplete, role: (user as any).role } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify JWT
export const authenticateToken: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Development helper: accept a mock admin token to bypass JWT during local dev
    if (token === 'mock-admin-token') {
      (req as any).user = { id: 'mock-admin', email: 'admin@example.com', role: 'admin', profileComplete: true };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware to verify admin role
export const authenticateAdmin: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
