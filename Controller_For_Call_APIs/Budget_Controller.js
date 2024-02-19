const express = require("express");
const budget_router = express.Router();

// Create a new budget
budget_router.post("/budgets", async (req, res) => {
  try {
    const newBudget = await Budget.create(req.body);
    res.status(201).json(newBudget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all budgets
budget_router.get("/budgets", async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single budget by budget_id
budget_router.get("/budgets/:budgetId", async (req, res) => {
  try {
    const budget = await Budget.findOne({ budget_id: req.params.budgetId });
    if (!budget) {
      res.status(404).json({ error: "Budget not found" });
    } else {
      res.json(budget);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a budget by budget_id
budget_router.put("/budgets/:budgetId", async (req, res) => {
  try {
    const updatedBudget = await Budget.findOneAndUpdate(
      { budget_id: req.params.budgetId },
      req.body,
      { new: true }
    );
    if (!updatedBudget) {
      res.status(404).json({ error: "Budget not found" });
    } else {
      res.json(updatedBudget);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a budget by budget_id
budget_router.delete("/budgets/:budgetId", async (req, res) => {
  try {
    const deletedBudget = await Budget.findOneAndDelete({
      budget_id: req.params.budgetId,
    });
    if (!deletedBudget) {
      res.status(404).json({ error: "Budget not found" });
    } else {
      res.json(deletedBudget);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = budget_router;
