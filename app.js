const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const session = require("express-session");
const uuid = require("uuid");
const upload = require("express-fileupload");




require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;


// using file upload
app.use(upload());


// Generate a random UUID to use as the session secret key
const sessionSecret = uuid.v4();

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Set the session to last for 1 day (adjust as needed)
    },
  })
);


app.get('/logout', (req, res) => {
  // Destroy the session to log the user out
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

app.use(bodyParser.urlencoded({ extension: false }));

//parse application.json
app.use(bodyParser.json());

//static files
app.use(express.static("public"));

//Templating engine
app.set("view engine", "hbs");

//database connection
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// connect to db
pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Connected as ID", connection.threadId);
});

//routes connection
const routes = require("./server/routes/user");
app.use("/", routes);








app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
