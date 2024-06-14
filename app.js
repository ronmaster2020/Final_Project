const express = require('express');
const path = require('path');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.post('/cart/add', (req, res) => {
    const inputValue = req.body.product_id; // Replace 'inputName' with the name of your input field
    console.log(inputValue); // Print the value to the console  
    res.sendStatus(200);
})