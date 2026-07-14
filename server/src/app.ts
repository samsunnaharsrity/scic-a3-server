
import express from "express";
import cors from "cors";
import reviewRoute from "./routes/review.route";
import commentRoute from "./routes/comment.route";
import stayRoute from "./routes/stay.route";
import exploreRoute from "./routes/explore.route";
import userRoute from "./routes/user.route";
import adminRoute from "./routes/admin.route";
import bookingsRoute from "./routes/bookings.route";
import saveRoute from "./routes/save.route";
import settingsRoute from "./routes/settings.route";
import userDashboardRoute from "./routes/userDashboard.route";
import adminBookingRoute from "./routes/adminBooking.route";
import adminAnalyticsRoute from "./routes/adminAnalytics.route";





// console.log("app.ts loaded");

const app = express();


app.use((req, res, next) => {
  next();
});

app.use(cors());
app.use(express.json());


// Explore Routes
app.use("/api/explore", exploreRoute);
// console.log("Explore Route Registered");


app.use("/api/reviews", reviewRoute);
// console.log("Review Route Registered");



app.use("/api/comments", commentRoute);
// console.log("Comment Route Registered");


app.use("/api/save", saveRoute);
// console.log("Save Route Registered");

// Stay Routes
app.use("/api/stays", stayRoute);
// console.log("Stay Route Registered");



// console.log("adminRoute =", adminRoute);

// admin route
app.use("/api/admin", adminRoute);
// console.log("Admin Route Registered");



console.log("userRoute type:", typeof userRoute);
console.log("userRoute stack length:", (userRoute as any)?.stack?.length);
// user profile route
app.use("/api/user", userRoute);
// console.log("user Route Registered");



// bookings route
app.use("/api/bookings", bookingsRoute);



// settings
app.use("/api/settings", (req, res, next) => {
  next();
}, settingsRoute);


app.use("/api/user", userDashboardRoute);


app.use("/api/admin/bookings", adminBookingRoute);




app.use("/api/admin", adminAnalyticsRoute);

// Hello Route
app.get("/api/hello", (req, res) => {
  res.send("Hello");
});

// console.log("Hello Route Registered");

















// Root Route
app.get("/api", (req, res) => {
  res.send("StudyNook API Running...");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;