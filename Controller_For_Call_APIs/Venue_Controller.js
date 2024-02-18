const express = require('express');
const venue_router = express.Router();

// Create a new venue
venue_router.post('/venues', async (req, res) => {
    try {
      const newVenue = await Venue.create(req.body);
      res.status(201).json(newVenue);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Get all venues
  venue_router.get('/venues', async (req, res) => {
    try {
      const venues = await Venue.find();
      res.json(venues);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get a single venue by venue_id
  venue_router.get('/venues/:venueId', async (req, res) => {
    try {
      const venue = await Venue.findOne({ venue_id: req.params.venueId });
      if (!venue) {
        res.status(404).json({ error: 'Venue not found' });
      } else {
        res.json(venue);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update a venue by venue_id
  venue_router.put('/venues/:venueId', async (req, res) => {
    try {
      const updatedVenue = await Venue.findOneAndUpdate({ venue_id: req.params.venueId }, req.body, { new: true });
      if (!updatedVenue) {
        res.status(404).json({ error: 'Venue not found' });
      } else {
        res.json(updatedVenue);
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Delete a venue by venue_id
  venue_router.delete('/venues/:venueId', async (req, res) => {
    try {
      const deletedVenue = await Venue.findOneAndDelete({ venue_id: req.params.venueId });
      if (!deletedVenue) {
        res.status(404).json({ error: 'Venue not found' });
      } else {
        res.json(deletedVenue);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = venue_router