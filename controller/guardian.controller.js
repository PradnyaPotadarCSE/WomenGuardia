const Guardian = require("../model/guardian.model.js");
const User = require("../model/user.model.js"); // Ensure the correct path here

module.exports.guardian = async (req, res) => {
  try {
    const userWithGuardians = await User.findById(req.user._id).populate(
      "guardians"
    );
    res.render("guardian.ejs", {
      user: req.user,
      contacts: userWithGuardians.guardians,
    });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).send("Error retrieving contacts.");
  }
};

module.exports.getGuardian = async (req, res) => {
  try {
    const userWithGuardians = await User.findById(req.user._id).populate(
      "guardians"
    );
    if (!userWithGuardians) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ guardians: userWithGuardians.guardians });
  } catch (error) {
    console.error("Error fetching guardians:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching guardians" });
  }
};

module.exports.addGuardian = async (req, res) => {
  try {
    const { contacts } = req.body;

    // Validate contacts
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid contacts data." });
    }

    const newGuardians = [];
    for (const contact of contacts) {
      // Check if guardian already exists
      const existingGuardian = await Guardian.findOne({
        name: contact.name,
        mobile_number: contact.mobile_number,
      });
      if (!existingGuardian) {
        // Only add if it doesn't exist
        const guardian = await Guardian.create(contact);
        newGuardians.push(guardian);
      }
    }

    // Update the user's guardians list with new guardians
    await User.findByIdAndUpdate(req.user._id, {
      $push: { guardians: { $each: newGuardians.map((g) => g._id) } },
    });

    res.json({ success: true, savedContacts: newGuardians });
  } catch (error) {
    console.error("Error adding guardian:", error.message || error); // Log specific error message
    res.status(500).json({
      success: false,
      error: error.message || "Failed to add guardian.",
    });
  }
};

module.exports.deleteGuardian = async (req, res) => {
  try {
    const guardianId = req.params.id;

    // Remove the guardian reference from the user's guardians list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { guardians: guardianId },
    });

    // Delete the guardian from the database
    await Guardian.findByIdAndDelete(guardianId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting guardian:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete guardian." });
  }
};
