const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('pilot-secret-key-35000ft'));

// Protection Middleware
const protect = (req, res, next) => {
    if (req.signedCookies.session === 'verified') {
        return next();
    }
    res.redirect('/');
};

// --- FIX START: Better Path Handling ---
const publicPath = path.join(__dirname, 'public');
const privatePath = path.join(__dirname, 'private');

// Public Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === "Aviator01@") {
        res.cookie('session', 'verified', { httpOnly: true, signed: true, sameSite: 'strict' });
        res.redirect('/dashboard/index.html');
    } else {
        res.send("Invalid Key. <a href='/'>Retry</a>");
    }
});

app.post('/verify-test', (req, res) => {
    const { testPath, testPassword } = req.body;
    if (testPassword === "pilot77") { 
        res.redirect(testPath);
    } else {
        res.send("Invalid Test Key. <a href='/dashboard/index.html'>Back</a>");
    }
});

// Secure the Private Folder
// This uses 'privatePath' to ensure Render finds it
app.use('/dashboard', protect, express.static(privatePath));

// --- FIX END ---

app.get('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('---------------------------------------------');
    console.log(`PILOT TERMINAL ACTIVE ON PORT: ${PORT}`);
    console.log('---------------------------------------------');
});
