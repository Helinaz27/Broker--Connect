import dotenv from 'dotenv';
dotenv.config();

const env = {
  port:          process.env.PORT || 6000,
  mongoUri:      process.env.MONGODB_URI,
  jwtSecret:     process.env.JWT_SECRET,
  jwtExpire:     process.env.JWT_EXPIRE || '30d',
  emailUser:     process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  frontendUrl:   process.env.FRONTEND_URL || 'http://localhost:3000',
};

export default env;