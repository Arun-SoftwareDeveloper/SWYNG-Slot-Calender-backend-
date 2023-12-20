const express = require("express");
const router = express.Router();
const slotController = require("../Controllers/SlotController");

// Initialize slots (you might want to trigger this endpoint separately, not in production)
router.get("/initialize-slots", async (req, res) => {
  await slotController.initializeSlots();
  res.json({ message: "Slots initialized successfully" });
});

// Get available dates
router.get("/available-dates", slotController.getAvailableDates);

// Get available slots for a specific date
router.get("/available-slots/:date", slotController.getAvailableSlots);

// Book a slot
router.post("/book-slot/:date/:slotId", slotController.bookSlot);

module.exports = router;
