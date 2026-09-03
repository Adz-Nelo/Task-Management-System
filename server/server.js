import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { inngestServe } from "./inngest/index.js";
import workspaceRouter from "./routes/workspace-routes.js";
import { protect } from "./middleware/auth-middleware.js";
import projectRouter from "./routes/project-routes.js";
import taskRouter from "./routes/task-routes.js";
import commentRouter from "./routes/comment-routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is live!"));

// Inngest HTTP endpoint
app.use("/api/inngest", inngestServe);

// Routes
app.use("/api/workspace", protect, workspaceRouter);
app.use("/api/projects", protect, projectRouter); 
app.use("/api/tasks", protect, taskRouter); 
app.use("/api/comments", protect, commentRouter); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
