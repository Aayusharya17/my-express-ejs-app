const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ejsMate = require('ejs-mate');
const rateLimit = require('express-rate-limit');
const path = require('path');
const User = require('./Models/user');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const app = express();
require('dotenv').config();
const PORT =process.env.PORT_NAME || 3000;
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log(" Database connected successfully");
  } catch (err) {
    console.error(" Database connection failed:", err);
    process.exit(1);
  }
}
connectDB();


app.use(express.urlencoded({ extended: true }));
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 5,
//   message: "Too many login attempts. Please try again later."
// });
app.use('/login', loginLimiter);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
  res.render('home.ejs');
});

app.get('/signup', (req, res) => {
  res.render('signup.ejs',{
                      err:null,
                      old:null
                    });
});

//<----------- Helmet - secure against web attacks like XSS (Cross-Site Scripting), Clickjacking, and Content Sniffing.

// app.use(helmet());

app.post('/signup',
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body('email')
      .isEmail()
      .withMessage("Enter a valid email"),
    body('mobile')
      .isMobilePhone()
      .withMessage("Enter a valid mobile number"),
    body('password')
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async(req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      const errorObj = {};
      errors.array().forEach(err => {
        errorObj[err.path] = err.msg;
      });
      console.log(errorObj);
      return res.status(400).render('signup', { 
                                    err: errorObj,
                                  old:req.body
                                 });
    }

  try {
    const { username, email, mobile, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("Email already registered");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({ username, email, mobile, password: hashPassword });
    await newUser.save();

    console.log(" User registered:", newUser);
    res.send('Signup successful!');
  } catch (err) {
    console.error(" Error during signup:", err);
    res.status(500).send("Internal Server Error");
  }

});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.send("Email is Not registered");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send("Invalid email or password");
    }

    res.send("Login Successful");
  } catch (err) {
    console.error(" Error during login:", err);
    res.status(500).send("Internal Server Error");
  }
});
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
