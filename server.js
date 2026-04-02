const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('pilot-secret-key-35000ft'));

// Middleware to protect private routes
const protect = (req, res, next) => {
    if (req.signedCookies.session === 'verified') return next();
    res.redirect('/');
};

/**
 * AUTO-PATH DETECTOR
 * This looks for your folders in the root or /src, and 
 * handles both 'Public' and 'public' naming.
 */
function findFolder(name) {
    const targets = [
        path.join(__dirname, name),
        path.join(__dirname, name.toLowerCase()),
        path.join(__dirname, name.charAt(0).toUpperCase() + name.slice(1)),
        path.join(process.cwd(), name),
        path.join(process.cwd(), 'src', name)
    ];
    
    for (const target of targets) {
        if (fs.existsSync(target)) return target;
    }
    return null;
}

const PUBLIC_DIR = findFolder('public');
const PRIVATE_DIR = findFolder('private');

// Log findings to Render console for debugging
console.log(`Detected Public Folder: ${PUBLIC_DIR}`);
console.log(`Detected Private Folder: ${PRIVATE_DIR}`);

// 1. Serve Login Page
app.get('/', (req, res) => {
    if (PUBLIC_DIR) {
        res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    } else {
        res.status(500).send("System Error: Public directory not found.");
    }
});

// 2. Login Handler
app.post('/login', (req, res) => {
    if (req.body.password === "Aviator01@") {
        res.cookie('session', 'verified', { httpOnly: true, signed: true, sameSite: 'strict' });
        res.redirect('/dashboard/index.html');
    } else {
        res.send("Invalid Key. <a href='/'>Retry</a>");
    }
});

// 3. Test Verification
app.post('/verify-test', (req, res) => {
    if (req.body.testPassword === "pilot77") { 
        res.redirect(req.body.testPath);
    } else {
        res.send("Invalid Test Key. <a href='/dashboard/index.html'>Back</a>");
    }
});

// 4. Secure Dashboard Static Assets
if (PRIVATE_DIR) {
    app.use('/dashboard', protect, express.static(PRIVATE_DIR));
}

// 5. Logout
app.get('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('---------------------------------------------');
    console.log(`PILOT TERMINAL STABILIZED ON PORT: ${PORT}`);
    console.log('---------------------------------------------');
});
