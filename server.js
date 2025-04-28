const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();

// MySQL Connection
const db = mysql.createConnection({
    host: 'yamabiko.proxy.rlwy.net',
    user: 'root',
    password: 'eRFkVzbdqPfvmDtEnpvfikIdEYeZsnhb',
    database: 'user_auth',
    port: '39868'
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

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ihaveagun12@gmail.com', // Replace with your email
        pass: 'xpki wdnl ssll wpfy'   // Replace with your email password
    }
});

// Routes

// Home Page (Finance Dashboard) - No login required
app.get('/', (req, res) => {
    res.render('home');
});

// Register Page
app.get('/register', (req, res) => {
    res.render('register');
});

// Net Worth Page Route
app.use(express.json());  // <-- Add this if missing

app.get('/networth', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login'); // Redirect if not logged in
    }
    res.render('networth', { username: req.session.username });
});

// Fetch Net Worth Data (For Logged-in User)
app.get('/get-networth', (req, res) => {
    if (!req.session.loggedin) {
        return res.json({ message: "Not logged in" });
    }

    db.query('SELECT * FROM networth WHERE user_id = ?', [req.session.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length > 0) {
            res.json(results[0]); // Send user's saved net worth data
        } else {
            res.json({ assets: 0, liabilities: 0, netWorth: 0 }); // Default values
        }
    });
});

// Save Net Worth Data (Auto-save for Logged-in User)
app.post('/save-networth', (req, res) => {
    if (!req.session.loggedin) {
        return res.json({ message: "Not logged in" });
    }

    const { assets, liabilities, netWorth } = req.body;
    const userId = req.session.user_id;

    db.query('SELECT * FROM networth WHERE user_id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length > 0) {
            // Update existing net worth record
            db.query(
                'UPDATE networth SET assets = ?, liabilities = ?, netWorth = ? WHERE user_id = ?',
                [assets, liabilities, netWorth, userId],
                (err) => {
                    if (err) return res.status(500).json({ error: "Error updating net worth" });
                    res.json({ message: "Net worth updated successfully" });
                }
            );
        } else {
            // Insert new net worth record
            db.query(
                'INSERT INTO networth (user_id, assets, liabilities, netWorth) VALUES (?, ?, ?, ?)',
                [userId, assets, liabilities, netWorth],
                (err) => {
                    if (err) return res.status(500).json({ error: "Error saving net worth" });
                    res.json({ message: "Net worth saved successfully" });
                }
            );
        }
    });
});


// Loan & EMI Calculator Page
app.use(express.json());  // <-- Add this if missing
app.get('/loan', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }
    res.render('loan', { username: req.session.username });
});

// Fetch Loan Data for Logged-in User
app.get('/get-loan', (req, res) => {
    if (!req.session.loggedin) {
        return res.json({ message: "Not logged in" });
    }

    db.query('SELECT * FROM loan WHERE user_id = ?', [req.session.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length > 0) {
            res.json(results[0]); // Send saved loan data
        } else {
            res.json({ amount: 0, rate: 0, tenure: 0, emi: 0 }); // Default values
        }
    });
});

// Save Loan Details (Auto-Save)
app.post('/save-loan', (req, res) => {
    if (!req.session.loggedin) {
        return res.json({ message: "Not logged in" });
    }

    const { amount, rate, tenure, emi } = req.body;
    const userId = req.session.user_id;

    db.query('SELECT * FROM loan WHERE user_id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length > 0) {
            // Update existing loan data
            db.query(
                'UPDATE loan SET amount = ?, rate = ?, tenure = ?, emi = ? WHERE user_id = ?',
                [amount, rate, tenure, emi, userId],
                (err) => {
                    if (err) return res.status(500).json({ error: "Error updating loan" });
                    res.json({ message: "Loan details updated successfully" });
                }
            );
        } else {
            // Insert new loan data
            db.query(
                'INSERT INTO loan (user_id, amount, rate, tenure, emi) VALUES (?, ?, ?, ?, ?)',
                [userId, amount, rate, tenure, emi],
                (err) => {
                    if (err) return res.status(500).json({ error: "Error saving loan" });
                    res.json({ message: "Loan details saved successfully" });
                }
            );
        }
    });
});

// Tax Calculator Page
app.use(express.json());
// Tax Estimator - Load Page with User's Saved Data
app.get('/tax', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }

    db.query('SELECT * FROM tax_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [req.session.user_id], (err, results) => {
            if (err) {
                console.log(err);
                return res.send('Database error');
            }
            const taxData = results.length > 0 ? results[0] : {}; // Ensure taxData is always defined
            res.render('tax', { username: req.session.username, taxData });
        }
    );
});

// Tax Estimator - Save User Input
app.post('/tax', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }

    const { income, deductions, taxSlab } = req.body;
    const taxableIncome = Math.max(0, income - deductions);
    const taxAmount = (taxableIncome * taxSlab) / 100;

    db.query('INSERT INTO tax_records (user_id, income, deductions, tax_slab, tax_amount) VALUES (?, ?, ?, ?, ?)',
        [req.session.user_id, income, deductions, taxSlab, taxAmount], (err) => {
            if (err) {
                console.log(err);
                return res.send('Error saving tax details');
            }
            res.redirect('/tax');
        }
    );
});


// Retirement Planning Page
app.get('/retirement', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }

    db.query('SELECT * FROM retirement_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [req.session.user_id], (err, results) => {
            if (err) {
                console.log(err);
                return res.send('Database error');
            }
            const retirementData = results.length > 0 ? results[0] : {}; 
            res.render('retirement', { username: req.session.username, retirementData });
        }
    );
});

// Save & Calculate Retirement Plan
app.post('/retirement', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }

    const { currentAge, retirementAge, monthlyExpenses, currentSavings, expectedReturn } = req.body;

    // Calculate the total savings required for retirement (assuming 20 years of post-retirement life)
    const yearsAfterRetirement = 20;
    const annualExpenses = monthlyExpenses * 12;
    const totalSavingsNeeded = annualExpenses * yearsAfterRetirement * (1 + expectedReturn / 100);

    db.query(
        'INSERT INTO retirement_plans (user_id, current_age, retirement_age, monthly_expenses, current_savings, expected_return, savings_needed) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.session.user_id, currentAge, retirementAge, monthlyExpenses, currentSavings, expectedReturn, totalSavingsNeeded],
        (err) => {
            if (err) {
                console.log(err);
                return res.send('Error saving retirement details');
            }
            res.redirect('/retirement');
        }
    );
});


// Debt Planner Page (Protected Route)
app.get('/debt-planner', (req, res) => {
    if (!req.session.loggedin) return res.redirect('/login');

    db.query('SELECT * FROM debt_planner WHERE user_id = ?', [req.session.user_id], (err, debts) => {
        if (err) return res.send('Database error');
        res.render('debt-planner', { debts });
    });
});

// Add Debt Entry
app.post('/debt-planner', (req, res) => {
    if (!req.session.loggedin) return res.redirect('/login');

    const { debt_name, amount, interest_rate, min_payment, method } = req.body;

    db.query(
        'INSERT INTO debt_planner (user_id, debt_name, amount, interest_rate, min_payment, method) VALUES (?, ?, ?, ?, ?, ?)',
        [req.session.user_id, debt_name, amount, interest_rate, min_payment, method],
        (err) => {
            if (err) return res.send('Database error');
            res.redirect('/debt-planner');
        }
    );
});

// Delete Debt Entry
app.post('/debt-planner/delete/:id', (req, res) => {
    if (!req.session.loggedin) return res.redirect('/login');

    db.query('DELETE FROM debt_planner WHERE id = ? AND user_id = ?', [req.params.id, req.session.user_id], (err) => {
        if (err) return res.send('Database error');
        res.redirect('/debt-planner');
    });
});

// csv
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

app.get('/download-csv', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }

    const userId = req.session.user_id;

    // Fetch all user data from different tables
    db.query(
        `SELECT u.username, u.email, 
                nw.assets, nw.liabilities, 
                l.amount, l.rate, l.tenure, l.emi,
                t.income, t.deductions, t.tax_amount,
                r.current_savings, r.monthly_expenses, r.retirement_age, r.savings_needed,
                d.debt_name, d.amount, d.interest_rate AS debt_interest, d.min_payment, d.method
        FROM users u
        LEFT JOIN networth nw ON u.id = nw.user_id
        LEFT JOIN loan l ON u.id = l.user_id
        LEFT JOIN tax_records t ON u.id = t.user_id
        LEFT JOIN retirement_plans r ON u.id = r.user_id
        LEFT JOIN debt_planner d ON u.id = d.user_id
        WHERE u.id = ?`, [userId], 
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error while fetching data');
            }

            if (results.length === 0) {
                return res.status(404).send('No data found for this user');
            }

            const csvWriter = createCsvWriter({
                path: `./user_data_${userId}.csv`,
                header: [
                    { id: 'username', title: 'Username' },
                    { id: 'email', title: 'Email' },
                    { id: 'assets', title: 'Assets' },
                    { id: 'liabilities', title: 'Liabilities' },
                    { id: 'amount', title: 'Loan Amount' },
                    { id: 'rate', title: 'Loan Interest Rate' },
                    { id: 'tenure', title: 'Loan Tenure' },
                    { id: 'emi', title: 'Loan EMI' },
                    { id: 'income', title: 'Income' },
                    { id: 'deductions', title: 'Tax Deductions' },
                    { id: 'tax_amount', title: 'Tax Payable' },
                    { id: 'current_savings', title: 'Current Savings' },
                    { id: 'monthly_expenses', title: 'Monthly Savings' },
                    { id: 'savings_needed', title: 'Retirement Goal' },
                    { id: 'retirement_age', title: 'Retirement age' },
                    { id: 'debt_name', title: 'Debt Type' },
                    { id: 'amount', title: 'Debt Balance' },
                    { id: 'debt_interest', title: 'Debt Interest Rate' },
                    { id: 'min_payment', title: 'Minimum Payment' },
                    { id: 'method', title: 'Debt Strategy' }
                ]
            });

            csvWriter.writeRecords(results)
                .then(() => {
                    res.download(`./user_data_${userId}.csv`, `user_data_${userId}.csv`, (err) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send('Error downloading file');
                        } else {
                            fs.unlinkSync(`./user_data_${userId}.csv`); // Delete after download
                        }
                    });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('Error generating CSV');
                });
        }
    );
});

//portfolie
app.get('/portfolio', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/login');
    }

    const userId = req.session.user_id;

    // Fetch all financial data for the user
    const queries = {
        netWorth: `SELECT * FROM networth WHERE user_id = ?`,
        loanEmi: `SELECT * FROM loan WHERE user_id = ?`,
        tax: `SELECT * FROM tax_records WHERE user_id = ?`,
        retirement: `SELECT * FROM retirement_plans WHERE user_id = ?`,
        debt: `SELECT * FROM debt_planner WHERE user_id = ?`
    };

    let data = {};

    db.query(queries.netWorth, [userId], (err, netWorthResults) => {
        if (err) return res.send('Database error');

        data.netWorth = netWorthResults[0] || { assets: 0, liabilities: 0 };

        db.query(queries.loanEmi, [userId], (err, loanResults) => {
            if (err) return res.send('Database error');

            data.loanEmi = loanResults[0] || {amount: 0, emi: 0 };

            db.query(queries.tax, [userId], (err, taxResults) => {
                if (err) return res.send('Database error');

                data.tax = taxResults[0] || { income: 0, tax_amount: 0 };

                db.query(queries.retirement, [userId], (err, retirementResults) => {
                    if (err) return res.send('Database error');

                    data.retirement = retirementResults[0] || {current_savings: 0, savings_needed: 0 };

                    db.query(queries.debt, [userId], (err, debtResults) => {
                        if (err) return res.send('Database error');

                        data.debt = debtResults[0] || { amount: 0, min_payment: 0 };

                        res.render('portfolio', { username: req.session.username, data });
                    });
                });
            });
        });
    });
});


// Register User
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    db.query('INSERT INTO users SET ?', { username, password: hashedPassword, email }, (err) => {
        if (err) {
            console.log(err);
            res.send('Error registering user');
        } else {
            res.redirect('/login');
        }
    });
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Login User
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.send('Error logging in');

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            res.send('Incorrect Username or Password!');
        } else {
            req.session.loggedin = true;
            req.session.user_id = results[0].id;
            req.session.username = username;
            res.redirect('/home');
        }
    });
});

// Forgot Password Page
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

// Handle Forgot Password Request
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.send('Database error');
        if (results.length === 0) return res.send('No account found with that email');

        const token = crypto.randomBytes(20).toString('hex');
        const expireTime = Date.now() + 3600000; // Token valid for 1 hour

        db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', 
            [token, expireTime, email], (err) => {
                if (err) return res.send('Error saving reset token');

                const resetLink = `https://financial-dashboard-jqf9.onrender.com/reset-password/${token}`;
                const mailOptions = {
                    to: email,
                    from: 'ihaveagun12@gmail.com',
                    subject: 'Password Reset',
                    text: `Click this link to reset your password: ${resetLink}`
                };

                transporter.sendMail(mailOptions, (error) => {
                    if (error) return res.send("<script>alert('Error sending email'); window.location.href='/forgot-password';</script>");
                    res.send("<script>alert('Password reset link sent to your email.'); window.location.href='/';</script>");
                });
                
            }
        );
    });
});

// Reset Password Page
app.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;

    db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?', [token, Date.now()], (err, results) => {
        if (err) return res.send('Database error');
        if (results.length === 0) return res.send('Invalid or expired token');

        res.render('reset-password', { token });
    });
});

// Handle Password Reset
app.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?', [token, Date.now()], (err, results) => {
        if (err) return res.send('Database error');
        if (results.length === 0) return res.send('Invalid or expired token');

        const email = results[0].email;

        db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?', 
            [hashedPassword, email], 
            (err) => {
                if (err) return res.send("<script>alert('Error updating password'); window.location.href='/reset-password';</script>");
                res.send("<script>alert('Password reset successful!'); window.location.href='/login';</script>");
            }
        );
        
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


// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error logging out');
        res.redirect('/login');
    });
});

// Dashboard (Login Required)
app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        res.render('home', { username: req.session.username });
    } else {
        res.redirect('/login');
    }
});

// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
