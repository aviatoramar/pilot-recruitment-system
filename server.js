const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

// Middleware to handle form data and cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('pilot-secret-key-35000ft')); // Secret key for signed cookies

/**
 * 1. THE SECURITY GUARD (Middleware)
 * This checks if the user has a valid session badge.
 * If not, it blocks access to the private folder.
 */
const protect = (req, res, next) => {
    if (req.signedCookies.session === 'verified') {
        return next();
    }
    // No valid session? Send them back to the public login page
    res.redirect('/');
};

/**
 * 2. PUBLIC ROUTES
 * These are visible to everyone.
 */

// Show the light-themed login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Handle the main login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check for the required password. Accepts any Pilot Name.
    if (password === "Aviator01@") {
        // Set a session cookie that expires when the browser/tab is closed
        res.cookie('session', 'verified', { 
            httpOnly: true, 
            signed: true,
            sameSite: 'strict' 
        });
        res.redirect('/dashboard/index.html');
    } else {
        res.send(`
            <div style="font-family:sans-serif; text-align:center; margin-top:50px;">
                <h2 style="color:red;">INVALID ACCESS KEY</h2>
                <a href="/">Return to Login</a>
            </div>
        `);
    }
});

/**
 * 3. INTERNAL TEST ENCRYPTION
 * This handles the second password for Spatial and Personality tests.
 */
app.post('/verify-test', (req, res) => {
    const { testPath, testPassword } = req.body;
    
    // Internal Password for specific high-security tests
    if (testPassword === "pilot77") { 
        res.redirect(testPath);
    } else {
        res.send(`
            <div style="font-family:sans-serif; text-align:center; margin-top:50px; background:#f8d7da; padding:20px;">
                <h2 style="color:#721c24;">INTERNAL DECRYPTION FAILED</h2>
                <p>The provided Test Key is incorrect.</p>
                <a href="/dashboard/index.html">Back to Dashboard</a>
            </div>
        `);
    }
});

/**
 * 4. SECURE PRIVATE FOLDER
 * The 'protect' middleware ensures only logged-in pilots can see these files.
 */
app.use('/dashboard', protect, express.static(path.join(__dirname, 'private')));

/**
 * 5. LOGOUT / TERMINATE SESSION
 * Destroys the cookie and forces a fresh login.
 */
app.get('/logout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log('---------------------------------------------');
    console.log(`PILOT TERMINAL ACTIVE AT: http://localhost:${PORT}`);
    console.log('MAIN PASSWORD: Aviator01@');
    console.log('INTERNAL TEST KEY: pilot77');
    console.log('---------------------------------------------');
});