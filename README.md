# 🚀 Bitespeed Identity Reconciliation API

A backend API built using **Node.js, Express, and MySQL** that reconciles contact identities based on email and phone number.

This project implements primary–secondary contact linking and automatic identity merging as per the Bitespeed assignment requirements.

---

## 🌐 Live API

Base URL:
https://bitespeed-production-5fd5.up.railway.app/identify


---

## 📌 Problem Statement

Customers may interact using different emails and phone numbers.  
The system must:

- Identify whether a contact already exists
- Link related contacts
- Maintain one **primary contact**
- Convert others into **secondary contacts**
- Merge clusters when overlapping data is found

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MySQL (Railway)
- mysql2 (Promise-based driver)
- Railway (Deployment)

---

## 🗂 Database Schema

Table: `contact`

| Column | Type |
|--------|------|
| id | INT (Auto Increment, Primary Key) |
| email | VARCHAR(255) |
| phoneNumber | VARCHAR(20) |
| linkedId | INT (nullable) |
| linkPrecedence | VARCHAR(20) |
| createdAt | TIMESTAMP |
| updatedAt | TIMESTAMP |
| deletedAt | TIMESTAMP (nullable) |

---

## 🔁 Identity Reconciliation Logic

1. If no match → Create new **primary contact**
2. If match found:
   - Oldest primary remains primary
   - Other primaries become secondary
3. If new email or phone is introduced:
   - Create secondary linked to primary
4. Always return:
   - primaryContactId
   - All unique emails
   - All unique phoneNumbers
   - secondaryContactIds

---

## 📬 API Usage

### Endpoint

🏗 Local Setup
1️⃣ Clone Repository
git clone https://github.com/SureshB2938/bitespeed.git
cd bitespeed

2️⃣ Install Dependencies
npm install

3️⃣ Create .env File
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=bitespeed
DB_PORT=3306

4️⃣ Run Server
npm start

Server runs on:

http://localhost:3000

