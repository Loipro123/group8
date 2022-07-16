const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');

app.use(cors());
app.use(express.json({extended:false}))



app.use('/users',require('./routes/customer'));
app.use('/products',require('./routes/product'));
app.use('/orders',require('./routes/order'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log('Server run on port 500'))