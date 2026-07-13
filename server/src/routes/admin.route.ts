import { Router } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/mongodb";

const router = Router();

router.get("/users", async (req, res) => {
  console.log("GET /api/admin/users called");

  try {
    const db = await connectDB();
    const users = await db.collection("user").find({}).toArray();

    console.log("Found Users:", users.length);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// ২. POST Add User
router.post("/users", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("user").insertOne(req.body);

    const newUser = await db.collection("user").findOne({
      _id: result.insertedId,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add user",
    });
  }
});

// ৩. PUT Update User
router.put("/users/:id", async (req, res) => {
  console.log("PUT HIT");
  console.log("ID:", req.params.id);
  console.log("BODY:", req.body);  
  try {
    const db = await connectDB();
    const { name, email, role } = req.body;
    const userId = req.params.id;

    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name,
          email,
          role,
        },
      }
    );

    console.log("Matched Count:", result.matchedCount);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in database",
      });
    }

    const updatedUser = await db.collection("user").findOne({
      _id: new ObjectId(userId),
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
});

// ৪. DELETE User
router.delete("/users/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("user").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
});



// stays routes for admin(add )
router.post("/stays", async (req, res) => {
  try {
    const db = await connectDB();

    const result = await db.collection("stays").insertOne(req.body);

    const stay = await db.collection("stays").findOne({
      _id: result.insertedId,
    });

    res.status(201).json(stay);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to add stay",
    });
  }
});

// stays routes for admin(update )

router.put("/stays/:id", async (req, res) => {
  try {
    const db = await connectDB();

    const { title, location, price, type, image } = req.body;

    const result = await db.collection("stays").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          title,
          location,
          price,
          type,
          image,
        },
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Stay not found",
      });
    }

    const updated = await db.collection("stays").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});


// stays routes for admin(delete )
router.delete("/stays/:id", async (req, res) => {
  try {
    const db = await connectDB();

    const result = await db.collection("stays").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Stay not found",
      });
    }

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

export default router;