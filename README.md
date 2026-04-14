# SupportHub – Fullstack Task

A simple portal to integrate **Freshdesk** and **HubSpot**, view tickets, conversations, and webhook logs.

---

## ⚙️ Setup Instructions

### 🔹 Frontend

```bash
cd frontend
npm install
ng serve
```

---

### 🔹 Backend

```bash
cd backend
npm install
node server.js
```

---

## 🔑 Environment Variables (`backend/.env`)

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
HUBSPOT_REDIRECT_URI=your_redirect_url
```

---

## 🔗 Webhook Configuration (Freshdesk)

1. Run:

```bash
ngrok http 5000
```

2. Go to Freshdesk:

```
Admin → Workflows → Automations → Ticket Creation
```

3. Add action:

* Trigger Webhook
* Method: POST
* URL:

```
https://<ngrok-url>/api/webhook/freshdesk
```

4. Request Body:

```json
{
  "event": "ticket_created",
  "ticket_id": "{{ticket.id}}",
  "subject": "{{ticket.subject}}",
  "email": "{{ticket.requester.email}}"
}
```

---

## 👤 Sample User

```
Email: sujithakavi20@gmail.com
Password: @Sujii2001
```

---

## 🔗 Integrations

### Freshdesk

* Requires domain + API key (user-specific)

### HubSpot

* OAuth login
* Optional (used for contact details)

---

## 🌐 Hosted Links

Frontend: <your-frontend-url>
Backend: <your-backend-url>

---
