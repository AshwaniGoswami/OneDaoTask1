const geoip = require("geoip-lite");
const pool = require("../config/dbConfig");
const restrictedCountries = require("../restriction");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const sendMail = require("../config/MailConfig");

// schema
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
});

const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().required(),
});

// helper functions
async function getCountryFromIP(ipAddress) {
  const geo = geoip.lookup(ipAddress);
  console.log("gep", geo);
  return geo ? geo.country : "Unknown";
}

async function sendOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("otp", otp);
  await pool.query("UPDATE users SET otp = $1 WHERE email = $2", [otp, email]);
  sendMail(email, "OTP", `Your OTP is ${otp}`);
  return;
}

// controllers

//Get users by country
exports.GetUsersByCountry = async (req, res) => {
  const { country } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(country) = LOWER($1)",
      [country]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `No users found in ${country}` });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error querying users by country:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//Signup
exports.Signup = async (req, res) => {
  const { email, password } = req.body;

  //validate data
  const { error } = signupSchema.validate({ email, password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const ipAddress = req.ip;
    console.log("ip", ipAddress);

    const country = getCountryFromIP(ipAddress);
    console.log("country", country);
    if (!country) {
      return res
        .status(400)
        .json("Some Error Occured. Please try again later.");
    }
    if (restrictedCountries.includes(country)) {
      return res
        .status(403)
        .json({ error: "Signup is not available in your country." });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password, country) VALUES ($1, $2, $3)",
      [email, hashedPassword, country]
    );

    // send OTP on signup
    sendOtp(email);
    res.status(201).json({ message: "Signup successful." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//Login
exports.Login = async (req, res) => {
  const { email, password } = req.body;

  //validate data
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    //generate token after successful validation
    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//Send Otp if signup otp is not sent or deleted by user from his mail
exports.SendOtpController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    sendOtp(email);
    res.json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//Verify Otp
exports.VerifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const { error } = otpSchema.validate({ email, otp });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    if (user.rows[0].otp !== otp) {
      return res.status(401).json({ error: "Invalid OTP." });
    }
    await pool.query(
      "UPDATE users SET otp = NULL, otpStatus = TRUE WHERE email = $1",
      []
    );
    res.json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};
