const express = require('express');
const task_router = express.Router();

// Create a new task
task_router.post('/tasks', async (req, res) => {
    try {
      const newTask = await Task.create(req.body);
      res.status(201).json(newTask);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Get all tasks
  task_router.get('/tasks', async (req, res) => {
    try {
      const tasks = await Task.find();
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get a single task by task_id
  task_router.get('/tasks/:taskId', async (req, res) => {
    try {
      const task = await Task.findOne({ task_id: req.params.taskId });
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.json(task);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update a task by task_id
  task_router.put('/tasks/:taskId', async (req, res) => {
    try {
      const updatedTask = await Task.findOneAndUpdate({ task_id: req.params.taskId }, req.body, { new: true });
      if (!updatedTask) {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.json(updatedTask);
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Delete a task by task_id
  task_router.delete('/tasks/:taskId', async (req, res) => {
    try {
      const deletedTask = await Task.findOneAndDelete({ task_id: req.params.taskId });
      if (!deletedTask) {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.json(deletedTask);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = task_router