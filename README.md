

# Apartment Application Form

This project is a full-stack web application for collecting apartment applications. A user fills out a form, and the system does three things:

1. It sends a notification email to the leasing office or staff members.
2. It sends a confirmation email to the applicant, and also blind-copies you so you can see what they received.
3. It shows a confirmation page in the browser with all of the details they submitted.

The project is built with Node.js and Express for the backend, Nodemailer for sending email, and Bootstrap 5 for the frontend form.

---

## What it can do

* The form is mobile-friendly and styled with Bootstrap.
* The backend is built with Express and exposes an `/api/applications` endpoint.
* Emails are delivered through Gmail using App Passwords.
* You can configure multiple notification recipients, so both you and your business address can get applications.
* All emails use your Gmail account as the sender, but replies go directly to the applicant’s address.

---

## How the project is organized

The main folder is called `EmailConfirmation`. Inside:

* The `client` folder holds the `index.html` file which is the Bootstrap form.
* The `server` folder holds the `server.js` file, the `package.json` with Node dependencies, and the `.env` file for secrets.
* A `.env.example` file is included so others know what variables to configure.

---

## How to set it up

1. Clone or download the project to your computer.

2. In the `server` folder, install dependencies with `npm install`.

3. Create a `.env` file inside the `server` folder with the following information:

   * `GMAIL_USER` should be your Gmail address.
   * `GMAIL_APP_PASSWORD` is a 16-character password generated from Google (requires 2-Step Verification).
   * `NOTIFY_RECIPIENTS` is a list of one or more email addresses (separated by commas) where applications should be sent.
   * `ALLOWED_ORIGINS` is a list of allowed frontend URLs (usually localhost for testing).
   * `PORT` is the port number the server should run on (default is 4000, but you can change it if 4000 is already in use).

   Example:

   ```
   GMAIL_USER=youremail@gmail.com  
   GMAIL_APP_PASSWORD=abcdefghijklmnop  
   NOTIFY_RECIPIENTS=youremail@gmail.com,business@example.com  
   ALLOWED_ORIGINS=http://localhost:4000,http://localhost:3000  
   PORT=4000  
   ```

4. Start the backend with `npm run dev`. You should see “Server running on [http://localhost:4000”](http://localhost:4000”).

5. Open `http://localhost:4000` in your browser to view the form.

---

## How the emails work

* A notification email is sent to everyone listed in `NOTIFY_RECIPIENTS`.
* A confirmation email is sent to the applicant’s email address. You are also BCC’d on that email so you can see what they got.
* The email is always sent **from** your Gmail account (`GMAIL_USER`), but if you reply, it goes directly to the applicant.

---

## Tech used

* HTML, Bootstrap 5, and plain JavaScript for the frontend.
* Node.js and Express for the backend.
* Nodemailer for sending email with Gmail.

---

## Things you can add in the future

* Save all applications into a database.
* Create an admin dashboard to review applications online.
* Add spam protection such as rate limiting or honeypot fields.
* Deploy the project so it runs online (using services like Render, Railway, Netlify, or Vercel).

---

## License

This project uses the MIT License, which means you can freely use, copy, and modify it.

