const express = require("express");
const pool = require("mysql2");
const app = express();
const port = 3000;
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
const db = pool.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecom",
});

if (db) {
  console.log("db connected");
}

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.post("/login", (req, res) => {
  const user = req.body.email;
  const password = req.body.password;
  db.query(
    `select * from users where username=? and password=?`,
    [user, password],
    function (err, results, fields) {
      if (results.length > 0) {
        return res.status(200).json({
          status: true,
          message: "success",
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "failed",
        });
      }
    }
  );
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  const phone = req.body.phone;
  db.query(
    `insert into users(username,email,phone,password) value(?,?,?,?)`,
    [email, password, username, phone],
    function (err, results, fields) {
      if (results) {
        return res.status(201).json({
          status: true,
          message: "success",
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "failed",
        });
      }
    }
  );
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
