import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

console.log("✅ explore.route.ts loaded");
const uri = process.env.MONGODB_URI;


if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}


const client = new MongoClient(uri);


export const connectDB = async () => {

  try {

    await client.connect();

    console.log("MongoDB Connected Successfully");


    return client.db(
      process.env.AUTH_DB_NAME
    );


  } catch (error) {

    console.log(
      "MongoDB Connection Failed",
      error
    );

    process.exit(1);

  }

};