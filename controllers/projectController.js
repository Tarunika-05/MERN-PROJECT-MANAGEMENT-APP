const mongoose = require("mongoose");
const Project = require("../models/Project");

// Helper to validate ObjectId only for project IDs
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to get next ID for a specific type
const getNextId = (project, type) => {
  let maxId = 0;

  switch (type) {
    case "task":
      if (project.tasks && project.tasks.length > 0) {
        maxId = Math.max(
          ...project.tasks.map((task) => parseInt(task.id) || 0)
        );
      }
      break;
    case "timeline":
      if (project.timeline && project.timeline.length > 0) {
        maxId = Math.max(
          ...project.timeline.map((event) => parseInt(event.id) || 0)
        );
      }
      break;
    case "calendar":
      if (project.calendar && project.calendar.length > 0) {
        maxId = Math.max(
          ...project.calendar.map((event) => parseInt(event.id) || 0)
        );
      }
      break;
  }

  return (maxId + 1).toString();
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      dueDate,
      color,
      members,
      priority,
      progress,
      columns,
      timeline,
      calendar,
      team,
    } = req.body;

    const project = new Project({
      createdBy: req.user.id,
      name,
      description,
      dueDate,
      color,
      members,
      priority,
      progress,
      columns,
      timeline,
      calendar,
      team,
      // Initialize task stats
      taskStats: {
        completed: 0,
        total: 0,
      },
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("createProject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all projects for user
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id }).lean();
    res.json(projects);
  } catch (err) {
    console.error("getProjects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: id,
      createdBy: req.user.id,
    }).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("getProjectById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit project
const editProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const updated = await Project.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      { ...req.body },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("editProject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const deleted = await Project.findOneAndDelete({
      _id: id,
      createdBy: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("deleteProject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add timeline event
const addTimelineEvent = async (req, res) => {
  try {
    const { id } = req.params; // project id
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Generate next incremental ID for timeline event
    const nextId = getNextId(project, "timeline");

    // Set id field for the event
    const newEvent = {
      ...req.body,
      id: nextId,
    };

    project.timeline = project.timeline || [];
    project.timeline.push(newEvent);

    await project.save();

    res.status(201).json(project);
  } catch (err) {
    console.error("addTimelineEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit timeline event
const editTimelineEvent = async (req, res) => {
  try {
    const { id: projectId, eventId } = req.params;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const event = project.timeline.find((ev) => ev.id === eventId);
    if (!event)
      return res.status(404).json({ message: "Timeline event not found" });

    // Don't allow changing the ID
    const { id, ...updateData } = req.body;
    Object.assign(event, updateData);

    await project.save();

    res.json(project);
  } catch (err) {
    console.error("editTimelineEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete timeline event
const deleteTimelineEvent = async (req, res) => {
  try {
    const { id: projectId, eventId } = req.params;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const index = project.timeline.findIndex((ev) => ev.id === eventId);
    if (index === -1)
      return res.status(404).json({ message: "Timeline event not found" });

    project.timeline.splice(index, 1);

    await project.save();

    res.json({ message: "Timeline event deleted successfully" });
  } catch (err) {
    console.error("deleteTimelineEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add calendar event
const addCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params; // project id
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Generate next incremental ID for calendar event
    const nextId = getNextId(project, "calendar");

    // Set id field for the event
    const newEvent = {
      ...req.body,
      id: nextId,
    };

    project.calendar = project.calendar || [];
    project.calendar.push(newEvent);

    await project.save();

    res.status(201).json(project);
  } catch (err) {
    console.error("addCalendarEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit calendar event
const editCalendarEvent = async (req, res) => {
  try {
    const { id: projectId, eventId } = req.params;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const event = project.calendar.find((ev) => ev.id === eventId);
    if (!event)
      return res.status(404).json({ message: "Calendar event not found" });

    // Don't allow changing the ID
    const { id, ...updateData } = req.body;
    Object.assign(event, updateData);

    await project.save();

    res.json(project);
  } catch (err) {
    console.error("editCalendarEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete calendar event
const deleteCalendarEvent = async (req, res) => {
  try {
    const { id: projectId, eventId } = req.params;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const index = project.calendar.findIndex((ev) => ev.id === eventId);
    if (index === -1)
      return res.status(404).json({ message: "Calendar event not found" });

    project.calendar.splice(index, 1);

    await project.save();

    res.json({ message: "Calendar event deleted successfully" });
  } catch (err) {
    console.error("deleteCalendarEvent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add department to team
const addDepartment = async (req, res) => {
  try {
    const { id } = req.params; // project id
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const newDepartment = {
      id: req.body.id || String(new mongoose.Types.ObjectId()),
      title: req.body.title || "New Department",
      color: req.body.color || "#4A6CFA",
      members: [],
    };

    project.team = project.team || [];
    project.team.push(newDepartment);

    await project.save();

    res.status(201).json(project);
  } catch (err) {
    console.error("addDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add team member to a department
const addTeamMember = async (req, res) => {
  try {
    const { id: projectId, departmentId } = req.params;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    const { id, name, role, status, department } = req.body;
    if (!name)
      return res.status(400).json({ message: "Team member name is required" });

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const dept = project.team.find((d) => d.id === departmentId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const newMember = {
      id: id || String(new mongoose.Types.ObjectId()),
      name,
      role,
      status,
      department,
    };

    dept.members.push(newMember);

    await project.save();

    res.status(201).json(project);
  } catch (err) {
    console.error("addTeamMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove team member from a department
const removeTeamMember = async (req, res) => {
  try {
    const { id: projectId, departmentId, memberId } = req.params;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const dept = project.team.find((d) => d.id === departmentId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const memberIndex = dept.members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1)
      return res.status(404).json({ message: "Team member not found" });

    dept.members.splice(memberIndex, 1);

    await project.save();

    res.json({ message: "Team member removed successfully" });
  } catch (err) {
    console.error("removeTeamMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update entire team array for a project
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Update the entire team array
    project.team = req.body.team || [];

    await project.save();

    res.json(project);
  } catch (err) {
    console.error("updateTeam error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit an individual team member
const editTeamMember = async (req, res) => {
  try {
    const { id, departmentId, memberId } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const dept = project.team.find((d) => d.id === departmentId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const member = dept.members.find((m) => m.id === memberId);
    if (!member)
      return res.status(404).json({ message: "Team member not found" });

    // Update member properties
    Object.assign(member, req.body);

    await project.save();

    res.json(project);
  } catch (err) {
    console.error("editTeamMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a team member
const deleteTeamMember = async (req, res) => {
  try {
    const { id, departmentId, memberId } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: id,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const dept = project.team.find((d) => d.id === departmentId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const memberIndex = dept.members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1)
      return res.status(404).json({ message: "Team member not found" });

    dept.members.splice(memberIndex, 1);

    await project.save();

    res.json({ message: "Team member deleted successfully" });
  } catch (err) {
    console.error("deleteTeamMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Search team members by name or id within a project
const searchTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.query;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    if (!query)
      return res.status(400).json({ message: "Search query is required" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Search logic for team members
    const results = [];

    project.team.forEach((dept) => {
      dept.members.forEach((member) => {
        if (
          member.name?.toLowerCase().includes(query.toLowerCase()) ||
          member.id?.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push({
            departmentId: dept.id,
            departmentTitle: dept.title,
            ...(member.toObject ? member.toObject() : member),
          });
        }
      });
    });

    res.json(results);
  } catch (err) {
    console.error("searchTeamMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add task to project
const addTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Generate next incremental ID for task
    const nextId = getNextId(project, "task");

    const newTask = {
      ...req.body,
      id: nextId,
      columnId: req.body.columnId || "todo",
      priority: req.body.priority || "medium",
    };

    project.tasks = project.tasks || [];
    project.tasks.push(newTask);

    project.taskStats = project.taskStats || { completed: 0, total: 0 };
    project.taskStats.total += 1;

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("addTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const editTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const wasCompleted = task.columnId === "done";
    const willBeCompleted = req.body.columnId === "done";

    // Don't allow changing the ID
    const { id: taskIdFromBody, ...updateData } = req.body;
    Object.assign(task, updateData);

    if (!wasCompleted && willBeCompleted) {
      project.taskStats.completed += 1;
    } else if (wasCompleted && !willBeCompleted) {
      project.taskStats.completed -= 1;
    }

    if (project.taskStats.total > 0) {
      project.progress = Math.round(
        (project.taskStats.completed / project.taskStats.total) * 100
      );
    }

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("editTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({ _id: id, createdBy: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const taskIndex = project.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1)
      return res.status(404).json({ message: "Task not found" });

    const task = project.tasks[taskIndex];
    const wasCompleted = task.columnId === "done";

    project.tasks.splice(taskIndex, 1);

    project.taskStats.total -= 1;
    if (wasCompleted) project.taskStats.completed -= 1;

    project.progress =
      project.taskStats.total > 0
        ? Math.round(
            (project.taskStats.completed / project.taskStats.total) * 100
          )
        : 0;

    await project.save();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit department
const editDepartment = async (req, res) => {
  try {
    const { id: projectId, departmentId } = req.params;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const department = project.team.find((d) => d.id === departmentId);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    // Update department properties
    if (req.body.title) department.title = req.body.title;
    if (req.body.color) department.color = req.body.color;

    await project.save();

    res.json(project);
  } catch (err) {
    console.error("editDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id: projectId, departmentId } = req.params;
    if (!isValidObjectId(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const departmentIndex = project.team.findIndex(
      (d) => d.id === departmentId
    );
    if (departmentIndex === -1)
      return res.status(404).json({ message: "Department not found" });

    // Remove the department
    project.team.splice(departmentIndex, 1);

    await project.save();

    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("deleteDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  editProject,
  deleteProject,
  addTimelineEvent,
  editTimelineEvent,
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
  searchTeamMember,
  addTask,
  editTask,
  deleteTask,
};
