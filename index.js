import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
const url = process.env.MONGO_URI;
const { FRONTEND_URL } = process.env;
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ["PATCH", "GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

const schema = new mongoose.Schema(
  {
    name: String,
    age: String,
    photo: String,
    body: String,
    likes: { type: Number, default: 0 },
  },
  { collection: "FriendsApi" }
);

const Post = mongoose.model("Post", schema);
app.get("/favicon.ico", (req, res) => {
  res.sendStatus(204); // Send a No Content response (204) for favicon.ico requests
});

app.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Friend not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/", async (req, res) => {
  const post = new Post(req.body);
  try {
    await post.save();
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      res.status(404).json({ message: "Friend not found" });
      return;
    }
    res.json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const post = await Post.findByIdAndUpdate(id, updates, { new: true });
    if (!post) {
      res.status(404).json({ message: "Friend not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
