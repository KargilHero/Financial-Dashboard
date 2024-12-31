const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Corona123', 
    database: 'user_auth'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.username = req.session.username || null;
    next();
});

app.set('view engine', 'ejs');

// Routes

// Home Page (Finance Dashboard) - No login required
app.get('/', (req, res) => {
    res.render('home'); // Home page is now the landing page
});

// Register Page - No login required
app.get('/register', (req, res) => {
    res.render('register');
});

// Register User
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    db.query('INSERT INTO users SET ?', { username, password: hashedPassword, email }, (err, results) => {
        if (err) {
            console.log(err);
            res.send('Error registering user');
        } else {
            res.redirect('/login');
        }
    });
});

// Login Page - No login required
app.get('/login', (req, res) => {
    res.render('login');
});

// Login User
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.log(err);
            return res.send('Error logging in');
        }

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            res.send('Incorrect Username or Password!');
        } else {
            req.session.loggedin = true;
            req.session.user_id = results[0].id; // Store user ID in session
            req.session.username = username;
            res.render('home', { username: req.session.username || '' });
        }
    });
});

// Currency Converter Page - No login required
app.get('/converter', (req, res) => {
    res.render('converter', { username: req.session.username || '' });
});

// Stock Market Page - No login required
app.get('/stocks', (req, res) => {
    res.render('stocks', { username: req.session.username || '' });
});

// Latest Financial News - No login required
app.get('/news', (req, res) => {
    res.render('news', { username: req.session.username || '' });
});

// About Page
app.get('/about', (req, res) => {
    res.render('about', { username: req.session.username || '' });
});

// Contact Page
app.get('/contact', (req, res) => {
    res.render('contact', { username: req.session.username || '' });
});

// To-Do List Page - Login required
app.get('/todo', (req, res) => {
    if (req.session.loggedin) {
        // Retrieve tasks associated with the logged-in user
        db.query('SELECT * FROM tasks WHERE user_id = ?', [req.session.user_id], (err, tasks) => {
            if (err) {
                console.log(err);
                res.send('Error retrieving tasks');
            } else {
                // Render the to-do list page with tasks
                res.render('todo', { tasks: tasks, username: req.session.username });
            }
        });
    } else {
        res.redirect('/login'); // Redirect to login if user is not logged in
    }
});

// Add a New Task to To-Do List
app.post('/todo', (req, res) => {
    if (req.session.loggedin) {
        const { description } = req.body;
        db.query('INSERT INTO tasks (user_id, description) VALUES (?, ?)', [req.session.user_id, description], (err) => {
            if (err) {
                console.log(err);
                res.send('Error adding task');
            } else {
                res.redirect('/todo');
            }
        });
    } else {
        res.redirect('/login'); // Redirect to login if user is not logged in
    }
});

// Mark a Task as Complete
app.post('/todo/complete/:id', (req, res) => {
    const taskId = req.params.id;

    db.query('UPDATE tasks SET completed = TRUE WHERE id = ? AND user_id = ?', [taskId, req.session.user_id], (err) => {
        if (err) {
            console.log(err);
            res.send('Error completing task');
        } else {
            res.redirect('/todo');
        }
    });
});

// Remove a Task
app.post('/todo/delete/:id', (req, res) => {
    const taskId = req.params.id;

    db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.session.user_id], (err) => {
        if (err) {
            console.log(err);
            res.send('Error deleting task');
        } else {
            res.redirect('/todo');
        }
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error logging out');
        } else {
            res.redirect('/login');
        }
    });
});

// Dashboard - After login
app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        res.render('home', { username: req.session.username });
    } else {
        res.redirect('/login');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
