const express = require("express");
const router = express.Router();
const projectsController = require("./projects.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

// All project routes require auth
router.use(authMiddleware);

router.get("/", projectsController.getProjects);
router.post("/", projectsController.createProject);
router.get("/:id", projectsController.getProjectById);
router.patch("/:id", projectsController.updateProject);
router.delete("/:id", projectsController.deleteProject);

module.exports = router;
