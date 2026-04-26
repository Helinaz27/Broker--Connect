import dotenv from 'dotenv';
dotenv.config();

const env = {
  port: process.env.PORT || 6000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '30d'
};

export default env;