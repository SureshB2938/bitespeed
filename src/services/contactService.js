const pool = require("../config/db");

async function processIdentity(data) {
  const { email, phoneNumber } = data;

  if (!email && !phoneNumber) {
    throw new Error("At least one of email or phoneNumber is required");
  }

  //  Find all contacts matching email or phone
  const [matched] = await pool.query(
    `SELECT * FROM contact 
     WHERE email = ? OR phoneNumber = ?`,
    [email || null, phoneNumber || null]
  );

  //  If no match → create new primary
  if (matched.length === 0) {
    const [result] = await pool.query(
      `INSERT INTO contact (email, phoneNumber, linkPrecedence)
       VALUES (?, ?, 'primary')`,
      [email || null, phoneNumber || null]
    );

    return {
      contact: {
        primaryContactId: result.insertId,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [String(phoneNumber)] : [],
        secondaryContactIds: []
      }
    };
  }

  //  Determine main primary
  let primaries = matched.filter(c => c.linkPrecedence === "primary");

  let mainPrimary;

  if (primaries.length > 0) {
    primaries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    mainPrimary = primaries[0];
  } else {
    // Only secondary matched → fetch its primary
    const secondary = matched[0];
    const [primaryResult] = await pool.query(
      `SELECT * FROM contact WHERE id = ?`,
      [secondary.linkedId]
    );
    mainPrimary = primaryResult[0];
  }

  // Merge multiple primaries if exist
  for (let p of primaries) {
    if (p.id !== mainPrimary.id) {
      await pool.query(
        `UPDATE contact
         SET linkPrecedence = 'secondary', linkedId = ?
         WHERE id = ?`,
        [mainPrimary.id, p.id]
      );
    }
  }

  // Fetch all contacts in cluster
  const [allContacts] = await pool.query(
    `SELECT * FROM contact
     WHERE id = ? OR linkedId = ?`,
    [mainPrimary.id, mainPrimary.id]
  );

  let emails = [...new Set(
    allContacts.map(c => c.email).filter(Boolean)
  )];

  let phones = [...new Set(
    allContacts.map(c => String(c.phoneNumber)).filter(Boolean)
  )];

  let secondaryIds = allContacts
    .filter(c => c.linkPrecedence === "secondary")
    .map(c => c.id);

  //  Insert new secondary if new data
  const emailExists = email && emails.includes(email);
  const phoneExists = phoneNumber && phones.includes(String(phoneNumber));

  if ((email && !emailExists) || (phoneNumber && !phoneExists)) {
    const [newSecondary] = await pool.query(
      `INSERT INTO contact (email, phoneNumber, linkedId, linkPrecedence)
       VALUES (?, ?, ?, 'secondary')`,
      [email || null, phoneNumber || null, mainPrimary.id]
    );

    secondaryIds.push(newSecondary.insertId);

    if (email && !emails.includes(email)) emails.push(email);
    if (phoneNumber && !phones.includes(String(phoneNumber))) {
      phones.push(String(phoneNumber));
    }
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