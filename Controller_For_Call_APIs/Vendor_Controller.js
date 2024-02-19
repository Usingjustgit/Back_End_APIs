const express = require("express");
const vendor_router = express.Router();

// Create a new vendor
vendor_router.post("/vendors", async (req, res) => {
  try {
    const newVendor = await Vendor.create(req.body);
    res.status(201).json(newVendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all vendors
vendor_router.get("/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single vendor by vendor_id
vendor_router.get("/vendors/:vendorId", async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ vendor_id: req.params.vendorId });
    if (!vendor) {
      res.status(404).json({ error: "Vendor not found" });
    } else {
      res.json(vendor);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a vendor by vendor_id
vendor_router.put("/vendors/:vendorId", async (req, res) => {
  try {
    const updatedVendor = await Vendor.findOneAndUpdate(
      { vendor_id: req.params.vendorId },
      req.body,
      { new: true }
    );
    if (!updatedVendor) {
      res.status(404).json({ error: "Vendor not found" });
    } else {
      res.json(updatedVendor);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a vendor by vendor_id
vendor_router.delete("/vendors/:vendorId", async (req, res) => {
  try {
    const deletedVendor = await Vendor.findOneAndDelete({
      vendor_id: req.params.vendorId,
    });
    if (!deletedVendor) {
      res.status(404).json({ error: "Vendor not found" });
    } else {
      res.json(deletedVendor);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = vendor_router;
