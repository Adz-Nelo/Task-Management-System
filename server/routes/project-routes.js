import express, { Router } from "express";
import {
  addMember,
  createProject,
  updateProject,
} from "../controllers/project-controller.js";

const projectRouter = express.Router();

projectRouter.post("/", createProject);
projectRouter.put("/", updateProject);
projectRouter.put("/:projectId/addMember", addMember);

export default projectRouter;
