const express = require("express");
const db = require("mysql2");
const app = express();
const port = 3000;
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
db.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecom",
  connectionLimit: 10,
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
      if (results.length) {
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
  const user = req.body.email;
  const password = req.body.password;
  db.query(
    `insert into users(username,password) value(?,?)`,
    [user, password],
    function (err, results, fields) {
      if (results.length) {
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
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
