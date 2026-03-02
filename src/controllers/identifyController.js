const { processIdentity } = require("../services/contactService");

exports.identify = async (req, res) => {
  try {
    const result = await processIdentity(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};