import { Router } from "express";
import {
  getBranches,
  registerBranch,
  deleteBranch,
  editBranch,
  addImageToBranches,
  getBranchImages,
  addTextToBranches,
  getBranchTexts,
  getBranch,
  deleteImageFromBranch,
  deleteTextFromBranch,
} from "../controllers/branches.controller.js";

const branchsRouter = Router();

branchsRouter.post("/", registerBranch);
branchsRouter.get("/", getBranches);
branchsRouter.get("/branch/:id", getBranch);
branchsRouter.delete("/:id", deleteBranch);
branchsRouter.put("/:id", editBranch);
branchsRouter.patch("/add-image", addImageToBranches);
branchsRouter.patch("/branch-text", addTextToBranches);
branchsRouter.get("/:id/images", getBranchImages);
branchsRouter.get("/:id/texts", getBranchTexts);
branchsRouter.delete("/:id/image/:imageId", deleteImageFromBranch);
branchsRouter.delete("/:id/text/:textId", deleteTextFromBranch);

export default branchsRouter;