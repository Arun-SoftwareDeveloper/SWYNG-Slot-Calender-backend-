const mongoose = require("mongoose");
const Slot = require("../Models/SlotModal");
const nodemailer = require("nodemailer");

exports.initializeSlots = async () => {
  try {
    // Check if there are already initialized slots
    const existingSlots = await Slot.find();
    if (existingSlots.length > 0) {
      console.log("Slots already initialized. Skipping initialization.");
      return;
    }

    const availableSlots = [];
    const startYear = 2023;
    const endYear = 2024;

    // Define time slots
    const timeSlots = [
      { start: "09:00", end: "10:00" },
      { start: "11:00", end: "12:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:00", end: "16:00" },
      { start: "16:00", end: "17:00" },
      // Add more time slots as needed
    ];

    for (let year = startYear; year <= endYear; year++) {
      // Loop through each day of the year
      for (let month = 0; month < 12; month++) {
        for (let day = 1; day <= 31; day++) {
          // Note: This doesn't handle varying days in each month, you may want to improve this part
          const date = new Date(`${year}-${month + 1}-${day}`);

          // Loop through time slots for each day
          for (const timeSlot of timeSlots) {
            const startDateTime = new Date(
              `${date.toISOString().split("T")[0]}T${timeSlot.start}:00.000Z`
            );
            const endDateTime = new Date(
              `${date.toISOString().split("T")[0]}T${timeSlot.end}:00.000Z`
            );

            const slot = new Slot({
              _id: new mongoose.Types.ObjectId(),
              date: startDateTime,
              endDateTime,
            });

            try {
              await slot.save();
              console.log(`Slot initialized for date and time: `);
              availableSlots.push(slot);
            } catch (error) {
              console.error(
                `Error initializing slot for date and time ${startDateTime}:`,
                error
              );
            }
          }
        }
      }
    }

    console.log("Available Slots:", availableSlots);
    return availableSlots;
  } catch (error) {
    console.error("Error initializing slots:", error);
  }
};

exports.getAvailableDates = async (req, res) => {
  try {
    const availableDates = await Slot.distinct("date");
    res.json({ availableDates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const formattedDate = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const availableSlots = await Slot.find({
      date: { $gte: formattedDate, $lte: endOfDay },
      available: true,
    });

    if (!availableSlots || availableSlots.length === 0) {
      return res.status(404).json({
        error: `No availability found for date: ${formattedDate.toISOString()}`,
      });
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { email, name, phoneNumber, purpose } = req.body;
    console.log("Recipient Email:", email);

    if (!slotId) {
      return res.status(400).json({ error: "Slot ID is required" });
    }

    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res
        .status(404)
        .json({ error: "No slot found for the specified ID" });
    }

    if (!slot.available) {
      return res.status(409).json({ error: "Slot is already booked" });
    }

    slot.available = false;
    slot.email = email;
    slot.name = name;
    slot.phoneNumber = phoneNumber;
    slot.purpose = purpose;

    await slot.save();

    // Send an email with the booked person's details
    await sendConfirmationEmail(
      email,
      name,
      slot.date,
      slot.startDateTime,
      slot.endDateTime,
      purpose
    );

    res.json({ message: "Slot booked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to send a confirmation email
async function sendConfirmationEmail(
  email,
  name,
  date,
  startTime,
  endTime,
  purpose
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "arunramasamy46@gmail.com", // replace with your Gmail email
        pass: "pruxtxnekznczdpc", // replace with your Gmail password
      },
    });
    const mailOptions = {
      from: "arunramasamy46@gmail.com",
      to: email,
      subject: "Booking Confirmation",
      html: `
    <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Dear ${name},</p>
    <p style="font-size: 14px; color: #555; margin-bottom: 15px;">
      Your slot on ${new Date(
        date
      ).toLocaleDateString()} from has been booked for the purpose: ${purpose}.
    </p>
    <p style="font-size: 14px; color: #555;">Thank you for using our slot booking service.</p>
  `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent: Booking confirmation");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
