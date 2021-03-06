const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');

const index = require('./routes/index');
// const hello = require('./routes/hello');
const stuff = require('./models/stuff.js');

const app = express();

const port = 8333;

// This is middleware called for all routes.
// Middleware takes three parameters.

app.use(cors());

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});


app.use('/', index);
// app.use('/hello', hello);

// app.get("/reports/week/:week", (req, res) => {
//     const data = {
//         data: {
//             msg: req.params.msg
//         }
//     };
//
//     res.json(data);
// });

app.get('/reports/week/:week', (req, res) => stuff.getReport(res, req.params.week));


// Testing routes with method
// app.get("/user", (req, res) => {
//     res.json({
//         data: {
//             msg: "Got a GET request, sending back default 200"
//         }
//     });
// });
//
// app.get("/user", (req, res) => {
//     res.json({
//         data: {
//             msg: "Got a GET request, sending back default 200"
//         }
//     });
// });
//
// app.get("/hello/:msg", (req, res) => {
//     const data = {
//         data: {
//             msg: req.params.msg
//         }
//     };
//
//     res.json(data);
// });
//
// app.post("/user", (req, res) => {
//     res.status(201).json({
//         data: {
//             msg: "Got a POST request, sending back 201 Created"
//         }
//     });
// });


// app.delete('/', (req, res) => stuff.deleteReport(res, req.body));

// app.post('/', (req, res) => stuff.addOrEdit(res, req.body));


app.delete("/",
    (req, res, next) => stuff.checkToken(req, res, next),
    (req, res) => stuff.deleteReport(res, req.body));


app.post("/",
    (req, res, next) => stuff.checkToken(req, res, next),
    (req, res) => stuff.addOrEdit(res, req.body));

// function checkToken(req, res, next) {
//     const token = req.headers['x-access-token'];
//
//     jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
//         if (err) {
//             // send error response
//         }
//
//         // Valid token send on the request
//         next();
//     });
// }




app.post('/register', (req, res) => stuff.newUserStorage(res, req.body));

app.post('/login', (req, res) => stuff.findUser(res, req.body));


// app.put("/user", (req, res) => {
//     // PUT requests should return 204 No Content
//      res.status(204).send();
// });
//
// app.delete("/user", (req, res) => {
//     // DELETE requests should return 204 No Content
//      res.status(204).send();
// });



// Add routes for 404 and error handling
// Catch 404 and forward to error handler
// Put this last
app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title":  err.message,
                "detail": err.message
            }
        ]
    });
});


// Start up server
const server = app.listen(port, () => console.log(`Example API listening on port ${port}!`));

module.exports = server;
