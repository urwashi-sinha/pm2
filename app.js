const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');

// Load environment variables from .env file
require('dotenv').config();

const secretKey = process.env.SECRET_KEY || 'your-fallback-secret-key';
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Initialize session middleware
app.use(session({
    secret: secretKey, // Use the secret key from environment variable or fallback
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
  const { error, convertedTemp, fromUnit, toUnit } = req.session;

  // Pass conversionHistory to the template
  res.render('index', {
    error: error || null,
    convertedTemp: convertedTemp || null,
    fromUnit: fromUnit || null,
    toUnit: toUnit || null,
    conversionHistory: req.session.conversionHistory || [] // Pass the conversion history
  });

  // Clear the session variables after rendering
  req.session.error = null;
  req.session.convertedTemp = null;
  req.session.fromUnit = null;
  req.session.toUnit = null;
});

app.post('/convert', (req, res) => {
  let temp = parseFloat(req.body.temp);
  let fromUnit = req.body.fromUnit;
  let toUnit = req.body.toUnit;
  let convertedTemp = null;
  let error = null;

  // Conversion logic here
  if (isNaN(temp)) {
    error = 'Please enter a valid number for temperature.';
  } else {
    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      convertedTemp = (temp * 9/5) + 32;
    } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
      convertedTemp = (temp - 32) * 5/9;
    } else {
      convertedTemp = temp; // If fromUnit and toUnit are the same
    }
  }

  // Initialize conversion history if it doesn't exist
  if (!req.session.conversionHistory) {
    req.session.conversionHistory = [];
  }

  // Add to conversion history only if there's no error
  if (!error) {
    req.session.conversionHistory.push({
      temp,
      fromUnit,
      toUnit,
      convertedTemp
    });
  }

  // Store the result in the session
  req.session.error = error;
  req.session.convertedTemp = convertedTemp;
  req.session.fromUnit = fromUnit;
  req.session.toUnit = toUnit;

  // Redirect to the main page
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
