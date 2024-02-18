const express = require('express');
const user_router = express.Router();

// Create a new user
user_router.post('/users', async (req, res) => {
    try {
      const newUser = await User.create(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Get all users
  user_router.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get a single user by user_id
  user_router.get('/users/:userId', async (req, res) => {
    try {
      const user = await User.findOne({ user_id: req.params.userId });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(user);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update a user by user_id
  user_router.put('/users/:userId', async (req, res) => {
    try {
      const updatedUser = await User.findOneAndUpdate({ user_id: req.params.userId }, req.body, { new: true });
      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(updatedUser);
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Delete a user by user_id
  user_router.delete('/users/:userId', async (req, res) => {
    try {
      const deletedUser = await User.findOneAndDelete({ user_id: req.params.userId });
      if (!deletedUser) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(deletedUser);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  module.exports = user_router