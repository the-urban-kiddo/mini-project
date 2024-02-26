// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({}))
app.use(cors({
    origin: 'http://127.0.0.1:5501',
    credentials: true
}));
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define MongoDB schemas
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const itemSchema = new mongoose.Schema({
    itemId: String,
    description: String,
    details : String
});

const User = mongoose.model('User', userSchema,'users');
const Item = mongoose.model('Item', itemSchema,'items');

app.use(bodyParser.json());

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            const token = jwt.sign({ username }, 'secret_key');
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// List endpoint
app.get('/list', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update endpoint
app.put('/update/:itemId', verifyToken, async (req, res) => {
    const { itemId } = req.params;
    const { description } = req.body;
    try {
        const item = await Item.findOneAndUpdate({ itemId }, { description }, { new: true });
        if (item) {
            res.json({ message: 'Item updated successfully', updatedItem: item });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// app.put('/update/:itemId', verifyToken, async (req, res) => {
//     const { itemId } = req.params;
//     const { description } = req.body;
//     try {
//         const item = await Item.findOneAndUpdate({ itemId }, { description }, { new: true });
//         if (item) {
//             res.json({ message: 'Item updated successfully' });
//         } else {
//             res.status(404).json({ message: 'Item not found' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// Token verification middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.username = decoded.username;
        next();
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});