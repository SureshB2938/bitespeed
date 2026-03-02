const { processIdentity } = require("../services/contactService");

exports.identify = async (req, res) => {
  try {
    // Ensure body exists
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        error: "Invalid request body"
      });
    }

    const { email, phoneNumber } = req.body;

    // Validation: at least one must be provided
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Either email or phoneNumber must be provided"
      });
    }

    const result = await processIdentity({ email, phoneNumber });

    return res.status(200).json(result);

  } catch (error) {
    console.error("Identify Error:", error);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
};