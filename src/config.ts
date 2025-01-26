import dotenv from 'dotenv';
dotenv.config();

export const TOKEN = process.env.TOKEN;
export const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  throw new Error('TOKEN or CLIENT_ID is not defined in the environment variables');
}