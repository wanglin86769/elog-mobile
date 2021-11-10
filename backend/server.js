const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


// Setting up express
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Api root
const logbookRoute = require('./routes/logbook_route.js');
app.use('/api/elog', logbookRoute);

// Create port
const port = process.env.PORT || 3001;

// Connecting port
const server = app.listen(port, () => {
    console.log('Port connected to: ' + port)
})
