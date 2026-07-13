import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env");
}


const client = new MongoClient(uri);

let db: Db;


export const connectDB = async () => {
  try {

    await client.connect();

    console.log("MongoDB Connected Successfully");


    db = client.db(
      process.env.AUTH_DB_NAME
    );


    return db;


  } catch (error) {

    console.log(
      "MongoDB Connection Failed",
      error
    );

    process.exit(1);

  }
};



export const getDB = () => {

  if (!db) {
    throw new Error(
      "Database not connected"
    );
  }


  return db;

};