const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    id: { type: String, default: null },
    title: String,
    name: String,
    description: String,
    columnId: {
      type: String,
      default: "todo", // ✅ Default column is "todo"
    },
    assignee: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: Date,
  },
  { timestamps: true }
);

const columnSchema = new mongoose.Schema({
  id: { type: String, default: null },
  title: String,
  color: String,
  tasks: [taskSchema],
});

const timelineEventSchema = new mongoose.Schema({
  id: { type: String, default: null },
  title: String,
  description: String,
  category: String,
  date: String,
  time: String,
  timestamp: Number,
});

const calendarEventSchema = new mongoose.Schema({
  id: { type: String, default: null },
  title: String,
  description: String,
  type: String,
  date: String,
  time: String,
});

const teamMemberSchema = new mongoose.Schema({
  id: { type: String, default: null },
  name: String,
  role: String,
  status: String,
  department: String,
});

const departmentSchema = new mongoose.Schema({
  id: { type: String, default: null },
  title: String,
  color: String,
  members: [teamMemberSchema],
});

const projectSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    dueDate: Date,
    color: String,

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    progress: { type: Number, default: 0 },

    tasks: [taskSchema],

    taskStats: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    columns: [columnSchema],
    timeline: [timelineEventSchema],
    calendar: [calendarEventSchema],
    team: [departmentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
