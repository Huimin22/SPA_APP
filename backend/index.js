const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 8800;

app.use(cors());
app.use(bodyParser.json());

require('dotenv').config()

const dbConnect = {
    host: "localdb.cvp0oraj48yg.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "Mydb123456",
    database: "food_db"
}

console.log(dbConnect); 

const pool = mysql.createPool(dbConnect);

// Initialize the database and create the table if needed
async function initializeDatabase() { 
  try {
    const connection = await pool.getConnection();
    console.log('Database connected!');
    
    // Ensure the food_info table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS food_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity VARCHAR(255),
        expiration VARCHAR(255)
      )
    `);
    
    connection.release();
    console.log('Food info table created.');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Route to add new food information
app.post('/api/food', async (req, res) => {
  try {
    const { name, quantity, expiration } = req.body;
    
    // Validate incoming data
    if (!name || !quantity || !expiration) {
      return res.status(400).send('Missing required fields: name, quantity, or expiration');
    }

    const [result] = await pool.query(
      'INSERT INTO food_info (name, quantity, expiration) VALUES (?, ?, ?)',
      [name, quantity, expiration]
    );

    res.status(201).send({ id: result.insertId });
  } catch (error) {
    console.error('Error adding food: ', error);
    res.status(500).send('Error adding food.');
  }
});

// Route to delete food information by ID
app.delete('/api/food/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the ID
    if (isNaN(id)) {
      return res.status(400).send('Invalid food ID');
    }

    const [result] = await pool.query('DELETE FROM food_info WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).send('No food info found with that ID');
    } else {
      res.status(200).send('Food deleted');
    }
  } catch (error) {
    console.error('Error deleting food: ', error);
    res.status(500).send('Error deleting food.');
  }
});

// Route to get all food information
app.get('/api/food', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM food_info');
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving food info: ', error);
    res.status(500).send('Error retrieving food info.');
  }
});

// Route to update food information by ID
app.put('/api/food/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, expiration } = req.body;

    // Validate the ID and input fields
    if (isNaN(id)) {
      return res.status(400).send('Invalid food ID');
    }
    if (!name || !quantity || !expiration) {
      return res.status(400).send('Missing required fields: name, quantity, or expiration');
    }

    const [result] = await pool.query(
      'UPDATE food_info SET name = ?, quantity = ?, expiration = ? WHERE id = ?',
      [name, quantity, expiration, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).send('No food info found with that ID');
    } else {
      res.status(200).send('Food info updated');
    }
  } catch (error) {
    console.error('Error updating food: ', error);
    res.status(500).send('Error updating food.');
  }
});


// Start the app and initialize the database
async function startApp() {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`Server is up and running on http://localhost:${port}`);
  });
}

startApp();
