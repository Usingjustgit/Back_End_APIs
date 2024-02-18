const express = require('express');
const registry_router = express.Router();

// Create a new registry item
registry_router.post('/registry', async (req, res) => {
    try {
      const newRegistryItem = await Registry.create(req.body);
      res.status(201).json(newRegistryItem);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Get all registry items
  registry_router.get('/registry', async (req, res) => {
    try {
      const registryItems = await Registry.find();
      res.json(registryItems);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get a single registry item by registry_id
  registry_router.get('/registry/:registryId', async (req, res) => {
    try {
      const registryItem = await Registry.findOne({ registry_id: req.params.registryId });
      if (!registryItem) {
        res.status(404).json({ error: 'Registry item not found' });
      } else {
        res.json(registryItem);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update a registry item by registry_id
  registry_router.put('/registry/:registryId', async (req, res) => {
    try {
      const updatedRegistryItem = await Registry.findOneAndUpdate({ registry_id: req.params.registryId }, req.body, { new: true });
      if (!updatedRegistryItem) {
        res.status(404).json({ error: 'Registry item not found' });
      } else {
        res.json(updatedRegistryItem);
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Delete a registry item by registry_id
  registry_router.delete('/registry/:registryId', async (req, res) => {
    try {
      const deletedRegistryItem = await Registry.findOneAndDelete({ registry_id: req.params.registryId });
      if (!deletedRegistryItem) {
        res.status(404).json({ error: 'Registry item not found' });
      } else {
        res.json(deletedRegistryItem);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  module.exports = registry_router