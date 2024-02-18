const express = require('express');
const guest_router = express.Router();

// Create a new guest
guest_router.post('/guests', async (req, res) => {
    try {
      const newGuest = await Guest.create(req.body);
      res.status(201).json(newGuest);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Get all guests
  guest_router.get('/guests', async (req, res) => {
    try {
      const guests = await Guest.find();
      res.json(guests);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get a single guest by guest_id
  guest_router.get('/guests/:guestId', async (req, res) => {
    try {
      const guest = await Guest.findOne({ guest_id: req.params.guestId });
      if (!guest) {
        res.status(404).json({ error: 'Guest not found' });
      } else {
        res.json(guest);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update a guest by guest_id
  guest_router.put('/guests/:guestId', async (req, res) => {
    try {
      const updatedGuest = await Guest.findOneAndUpdate({ guest_id: req.params.guestId }, req.body, { new: true });
      if (!updatedGuest) {
        res.status(404).json({ error: 'Guest not found' });
      } else {
        res.json(updatedGuest);
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Delete a guest by guest_id
  guest_router.delete('/guests/:guestId', async (req, res) => {
    try {
      const deletedGuest = await Guest.findOneAndDelete({ guest_id: req.params.guestId });
      if (!deletedGuest) {
        res.status(404).json({ error: 'Guest not found' });
      } else {
        res.json(deletedGuest);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = guest_router