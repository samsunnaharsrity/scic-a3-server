import express from "express";
import cors from "cors";
import exploreRoute from "./routes/explore.route";
import reviewRoute from "./routes/review.route";
import commentRoute from "./routes/comment.route";
import saveRoutes from "./routes/saveRoutes";


console.log("app.ts loaded");

const app = express();

app.use(cors());
app.use(express.json());


// Explore Routes
app.use("/api/explore", exploreRoute);

console.log("Explore Route Registered");

app.use("/api/reviews", reviewRoute);



app.use("/api/comments", commentRoute);


app.use("/api/save", saveRoutes);

// Hello Route
app.get("/hello", (req, res) => {
  res.send("Hello");
});

// Root Route
app.get("/", (req, res) => {
  res.send("StudyNook API Running...");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;