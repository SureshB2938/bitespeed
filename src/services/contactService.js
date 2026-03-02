const pool = require("../config/db");

async function processIdentity(data) {
  const { email, phoneNumber } = data;

  // 1️⃣ Find all matching contacts
  const [matched] = await pool.query(
    `SELECT * FROM contact WHERE email = $1 OR phoneNumber = $2`,
    [email, phoneNumber]
  );

  // 2️⃣ If no match → create primary
  if (matched.length === 0) {
    const [result] = await pool.query(
      `INSERT INTO contact (email, phoneNumber, linkPrecedence)
       VALUES (?, ?, 'primary')`,
      [email, phoneNumber]
    );

    return {
      contact: {
        primaryContactId: result.insertId,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: []
      }
    };
  }

  // 3️⃣ Find all primary contacts among matches
  let primaries = matched.filter(c => c.linkPrecedence === "primary");

  // Sort by createdAt (oldest first)
  primaries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  let mainPrimary = primaries[0];

  // 4Merge other primaries into mainPrimary
  for (let i = 1; i < primaries.length; i++) {
    await pool.query(
      `UPDATE contact
       SET linkPrecedence = 'secondary', linkedId = ?
       WHERE id = ?`,
      [mainPrimary.id, primaries[i].id]
    );
  }

  // Fetch all linked contacts
  const [allContacts] = await pool.query(
    `SELECT * FROM contact
     WHERE id = ? OR linkedId = ?`,
    [mainPrimary.id, mainPrimary.id]
  );

  let emails = [...new Set(allContacts.map(c => c.email).filter(Boolean))];
  let phones = [...new Set(allContacts.map(c => c.phoneNumber).filter(Boolean))];

  let secondaryIds = allContacts
    .filter(c => c.linkPrecedence === "secondary")
    .map(c => c.id);

  //  If new info → create secondary
  const emailExists = email && emails.includes(email);
  const phoneExists = phoneNumber && phones.includes(phoneNumber);

  if (!emailExists || !phoneExists) {
    const [newSecondary] = await pool.query(
      `INSERT INTO contact (email, phoneNumber, linkedId, linkPrecedence)
       VALUES (?, ?, ?, 'secondary')`,
      [email, phoneNumber, mainPrimary.id]
    );

    secondaryIds.push(newSecondary.insertId);

    if (email && !emails.includes(email)) emails.push(email);
    if (phoneNumber && !phones.includes(phoneNumber)) phones.push(phoneNumber);
  }

  return {
    contact: {
      primaryContactId: mainPrimary.id,
      emails,
      phoneNumbers: phones,
      secondaryContactIds: secondaryIds
    }
  };
}

module.exports = { processIdentity };