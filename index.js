const express = require('express');
const knex = require('knex')(require('./knexfile').development);
const app = express();
const { addDays } = require('date-fns');
const jwt = require('jsonwebtoken');

// Middleware for parsing JSON data
app.use(express.json());
// Custom logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const logEntry = {
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: req.headers,
  };

  // Logging request information
  console.log('Incoming Request:', logEntry);

  // Store the original res.end() function
  const originalEnd = res.end;

  // Override the res.end() function to log the response
  res.end = function (chunk, encoding) {
    const end = Date.now();
    const responseTime = end - start;
    const logResponse = {
      status: res.statusCode,
      headers: res.getHeaders(),
      responseTime: responseTime + 'ms',
      body: chunk.toString(),
    };

    // Logging response information
    console.log('Outgoing Response:', logResponse);

    // Call the original res.end() function to finish the response
    originalEnd.call(this, chunk, encoding);
  };

  // Continue the request-response cycle
  next();
});

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed. Token missing.' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Authentication failed. Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// Create a new weather data record
app.post('/weathers',authenticateJWT, async (req, res) => {
  try {
    const newWeather = await knex('weathers').insert(req.body);
    res.json(newWeather);
  } catch (error) {
    console.error('Error creating weather data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get weather data records from today to 90 days ago
app.get('/weathers', async (req, res) => {
  try {
    const today = new Date(); // Get today's date
    const ninetyDaysAgo = addDays(today, 98); // Calculate the date 90 days ago

    const weathers = await knex('weathers').where('date', '<=', ninetyDaysAgo).andWhere('date', '>=', today).select('*');
    res.json(weathers);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a specific weather data record by ID
app.get('/weathers/:id',authenticateJWT, async (req, res) => {
  const weatherId = req.params.id;
  try {
    const weather = await knex('weathers').where('id', weatherId).first();
    if (!weather) {
      return res.status(404).json({ message: 'Weather data not found' });
    }
    res.json(weather);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a weather data record
app.put('/weathers/:id', authenticateJWT,async (req, res) => {
  const weatherId = req.params.id;
  try {
    const updatedWeather = await knex('weathers').where('id', weatherId).update(req.body);
    if (updatedWeather === 0) {
      return res.status(404).json({ message: 'Weather data not found' });
    }
    res.json(updatedWeather);
  } catch (error) {
    console.error('Error updating weather data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a weather data record
app.delete('/weathers/:id',authenticateJWT, async (req, res) => {
  const weatherId = req.params.id;
  try {
    const deletedWeather = await knex('weathers').where('id', weatherId).del();
    if (deletedWeather === 0) {
      return res.status(404).json({ message: 'Weather data not found' });
    }
    res.json({ message: 'Weather data deleted successfully' });
  } catch (error) {
    console.error('Error deleting weather data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Weather service listening on port${process.env.PORT}`);
});