import dotenv from "dotenv";
import { connectDB } from "./config/mongodb";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 7000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server Running On ${PORT}`);
  });
};

startServer();