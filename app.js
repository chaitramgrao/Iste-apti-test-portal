const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));
app.use(express.static('public'));

// Load questions from a JSON file (you will create this later)
let questions = require('./questions.json');

// Simple login system for students and admin
const users = {}; // To store student information dynamically

// Login route (for students and admin)
app.post('/login', (req, res) => {
    const { name, usn, email, phone, section, branch } = req.body;
    users[usn] = { name, email, phone, section, branch };
    req.session.user = users[usn];
    res.redirect('/test');
});

// Serve the test page
app.get('/test', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.sendFile(__dirname + '/public/test.html');
});

// Get questions (to display on the frontend)
app.get('/get-questions', (req, res) => {
    res.json(questions);
});

// Submit test and calculate score
app.post('/submit-test', (req, res) => {
    const answers = req.body;
    let score = 0;
    questions.forEach((question, index) => {
        if (answers[`q${index}`] === question.correctAnswer) {
            score++;
        }
    });
    req.session.user.score = score; // Save the score in the session
    res.redirect('/thank-you'); // Redirect to a thank-you page after submission
});

// Route for showing the thank you page
app.get('/thank-you', (req, res) => {
    res.sendFile(__dirname + '/public/thank-you.html');
});

// Admin route to view qualified students
app.get('/admin', (req, res) => {
    if (req.session.user && req.session.user.isAdmin) {
        const qualifiedStudents = Object.values(users).filter(user => user.score > 15);
        res.json(qualifiedStudents); // Display only students who scored more than 50%
    } else {
        res.status(403).send('Unauthorized');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});





app.get('/admin', (req, res) => {
    // Add admin check (you can use a password or an admin session)
    const qualifiedStudents = Object.values(users).filter(user => user.score > 15); // More than 50%
    res.json(qualifiedStudents);
});



const adminPassword = 'yourAdminPassword'; // Set a strong password here

app.get('/admin', (req, res) => {
    if (req.query.password === adminPassword) {
        const qualifiedStudents = Object.values(users).filter(user => user.score > 15);
        res.json(qualifiedStudents);
    } else {
        res.status(403).send('Unauthorized');
    }
});




app.post('/add-question', (req, res) => {
    const newQuestion = req.body;
    questions.push(newQuestion); // Add to in-memory questions array

    // Save to questions.json file
    fs.writeFileSync('./questions.json', JSON.stringify(questions, null, 2), 'utf8');
    res.sendStatus(200); // Success response
});
