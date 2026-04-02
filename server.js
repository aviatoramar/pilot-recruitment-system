const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('pilot-secret-key-35000ft'));

// Middleware to protect private routes
const protect = (req, res, next) => {
    if (req.signedCookies.session === 'verified') {
        return next();
    }
    res.redirect('/');
};

// --- PATH CONFIGURATION (Matches your GitHub Capital Letters) ---
const PUBLIC_DIR = path.resolve(__dirname, 'Public');
const PRIVATE_DIR = path.resolve(__dirname, 'Private');

// 1. Serve the Login Page
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// 2. Handle Main Login (Accepts any name, password: Aviator01@)
app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === "Aviator01@") {
        res.cookie('session', 'verified', { 
            httpOnly: true, 
            signed: true, 
            sameSite: 'strict',
            maxAge: 3600000 
        });
        res.redirect('/dashboard/index.html');
    } else {
        res.send("<div style='text-align:center; font-family:sans-serif; margin-top:50px;'><h2 style='color:red;'>INVALID ACCESS KEY</h2><a href='/'>Try again</a></div>");
    }
});

// 3. Handle Internal Test Encryption (Key: pilot77)
app.post('/verify-test', (req, res) => {
    const { testPath, testPassword } = req.body;
    if (testPassword === "pilot77") { 
        res.redirect(testPath);
    } else {
        res.send("<div style='text-align:center; font-family:sans-serif; margin-top:50px;'><h2 style='color:red;'>INTERNAL DECRYPTION FAILED</h2><a href='/dashboard/index.html'>Back to Dashboard</a></div>");
    }
});

// 4. Secure Static Files in /dashboard
app.use('/dashboard', protect, express.static(PRIVATE_DIR));

// 5. Logout
app.get('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`PILOT TERMINAL STABILIZED ON PORT: ${PORT}`);
});
