const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


// Setting up express
const app = express();

// application/json
app.use(bodyParser.json({limit: '10mb', extended: true}));

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use(cors());

// Api root
const authenticateRoute = require('./auth/authenticate.js');
const logbookRoute = require('./routes/logbook_route.js');
app.use('/api/authenticate', authenticateRoute);
app.use('/api/elog', logbookRoute);

// Create port
const port = process.env.PORT || 3001;

// Connecting port
const server = app.listen(port, () => {
    console.log('Port connected to: ' + port)
});
