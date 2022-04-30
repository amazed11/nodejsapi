const express = require("express");
const pool = require("mysql2");
const multer = require("multer");
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
    `select * from users where email=? and password=?`,
    [user, password],
    function (err, results, fields) {
      if (results.length > 0) {
        return res.status(200).json({
          status: true,
          message: "success",
          data: results[0],
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
    [username, email, phone, password],
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

//upload file
// handle storage using multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

var upload = multer({ storage: storage });

// handle single file upload
app.post("/createpets", upload.single("image"), (req, res, next) => {
  const file = req.file;
  const breed = req.body.breed;
  const bname = req.body.bname;
  const price = req.body.price;
  const category = req.body.category;

  if (!file) {
    return res.status(400).send({ message: "Something went wrong" });
  }
  //   var sql = "INSERT INTO `food`(`name`) VALUES ('" + req.file.filename + "')";
  var sql =
    "INSERT INTO `pets`(`image`, `breed`, `bname`, `price`,`category`) VALUES (?,?,?,?,?)";
  var query = db.query(
    sql,
    [file.filename, breed, bname, price, category],
    function (err, result) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          message: "failed to create pets",
        });
      }
      return res
        .status(200)
        .send({ message: "Successfully created pets.", file });
    }
  );
});

//get all foods
app.get("/getpets/:petname", (req, res) => {
  const category = req.params.category;
  var sql = "select * from `pets` where category=?";
  var query = db.query(sql, [fcatname], function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        message: "failed to get",
      });
    }
    return res
      .status(200)
      .send({ message: "Successfully fetched.", status: true, data: result });
  });
});

app.post("/createspecificpets", upload.single("image"), (req, res, next) => {
  const file = req.file;
  const breed = req.body.breed;
  const ileft = req.body.ileft;
  const type = req.body.type;

  if (!file) {
    return res.status(400).send({ message: "Something went wrong" });
  }
  //   var sql = "INSERT INTO `food`(`name`) VALUES ('" + req.file.filename + "')";
  var sql =
    "INSERT INTO `product`(`type`, `breed`, `ileft`,`image`) VALUES (?,?,?,?)";
  var query = db.query(
    sql,
    [type, breed, ileft, file.filename],
    function (err, result) {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: false,
          message: `failed to create ${type} pets`,
        });
      }
      return res
        .status(200)
        .send({ message: `Successfully created ${type} pets.` });
    }
  );
});

//get all foods
app.get("/getspecificpets/:petname", (req, res) => {
  const category = req.params.category;
  var sql = "select * from `product` where type=?";
  var query = db.query(sql, [fcatname], function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        message: "failed to get",
      });
    }
    return res
      .status(200)
      .send({ message: "Successfully fetched.", status: true, data: result });
  });
});

app.listen(port, () => {
  console.log(`Pets app listening at http://localhost:${port}`);
});
