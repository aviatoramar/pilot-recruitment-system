const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('pilot-secret-key-35000ft'));

// Protection Middleware
const protect = (req, res, next) => {
    if (req.signedCookies.session === 'verified') return next();
    res.redirect('/');
};

/** * SMART PATH RESOLVER
 * This checks if your folders are 'Public' or 'public' 
 * to prevent the ENOENT error on Render.
 */
const getFolderPath = (name) => {
    const capsPath = path.resolve(__dirname, name.charAt(0).toUpperCase() + name.slice(1));
    const lowerPath = path.resolve(__dirname, name.toLowerCase());
    return fs.existsSync(capsPath) ? capsPath : lowerPath;
};

const PUBLIC_DIR = getFolderPath('public');
const PRIVATE_DIR = getFolderPath('private');

// Debugging: This will show in your Render logs so we can see what it found
console.log(`System Root: ${__dirname}`);
console.log(`Resolved Public Path: ${PUBLIC_DIR}`);
console.log(`Resolved Private Path: ${PRIVATE_DIR}`);

// Serve Login Page
app.get('/', (req, res) => {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Critical Error: index.html not found in Public folder.");
    }
});

// Login Logic
app.post('/login', (req, res) => {
    if (req.body.password === "Aviator01@") {
        res.cookie('session', 'verified', { httpOnly: true, signed: true, sameSite: 'strict' });
        res.redirect('/dashboard/index.html');
    } else {
        res.send("Invalid Key. <a href='/'>Retry</a>");
    }
});

// Test Verification
app.post('/verify-test', (req, res) => {
    if (req.body.testPassword === "pilot77") { 
        res.redirect(req.body.testPath);
    } else {
        res.send("Invalid Test Key. <a href='/dashboard/index.html'>Back</a>");
    }
});

// Secure Dashboard
app.use('/dashboard', protect, express.static(PRIVATE_DIR));

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`PILOT TERMINAL ACTIVE ON PORT: ${PORT}`);
});
