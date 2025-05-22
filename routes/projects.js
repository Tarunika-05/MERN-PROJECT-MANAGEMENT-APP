const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  getProjectById,
  editProject, // Changed from updateProject to match the controller function name
  deleteProject,
  addTimelineEvent,
  editTimelineEvent, // Added missing functions
  deleteTimelineEvent,
  addCalendarEvent,
  editCalendarEvent,
  deleteCalendarEvent,
  addDepartment,
  editDepartment,
  deleteDepartment,
  addTeamMember,
  removeTeamMember,
  updateTeam,
  editTeamMember,
  deleteTeamMember,
  // searchTeamMember, // Removed as not needed
  addTask,
  editTask,
  deleteTask,
} = require("../controllers/projectController");

// Create a new project
router.post("/", authMiddleware, createProject);

// Get all projects for logged-in user
router.get("/", authMiddleware, getProjects);

// Get single project by ID
router.get("/:id", authMiddleware, getProjectById);

// Update entire project by ID
router.put("/:id", authMiddleware, editProject); // Changed from updateProject to editProject

// Delete project by ID
router.delete("/:id", authMiddleware, deleteProject);

// Timeline event routes
router.post("/:id/timeline", authMiddleware, addTimelineEvent);
router.put("/:id/timeline/:eventId", authMiddleware, editTimelineEvent);
router.delete("/:id/timeline/:eventId", authMiddleware, deleteTimelineEvent);

// Calendar event routes
router.post("/:id/calendar", authMiddleware, addCalendarEvent);
router.put("/:id/calendar/:eventId", authMiddleware, editCalendarEvent);
router.delete("/:id/calendar/:eventId", authMiddleware, deleteCalendarEvent);

// Department routes
router.post("/:id/departments", authMiddleware, addDepartment);
router.put("/:id/departments/:departmentId", authMiddleware, editDepartment);
router.delete(
  "/:id/departments/:departmentId",
  authMiddleware,
  deleteDepartment
);

// Team member routes
router.post(
  "/:id/departments/:departmentId/members",
  authMiddleware,
  addTeamMember
);
router.put(
  "/:id/team/:departmentId/members/:memberId",
  authMiddleware,
  editTeamMember
);
router.delete(
  "/:id/team/:departmentId/members/:memberId",
  authMiddleware,
  deleteTeamMember
);
router.put("/:id/team", authMiddleware, updateTeam);

// Task routes
router.post("/:id/tasks", authMiddleware, addTask);
router.put("/:id/tasks/:taskId", authMiddleware, editTask);
router.delete("/:id/tasks/:taskId", authMiddleware, deleteTask);

// Search route removed as indicated it's not needed
// router.get("/:id/team/search", authMiddleware, searchTeamMember);

module.exports = router;
