const express = require("express");
const pool = require("mysql2");
const multer = require("multer");
const path = require("path");
const app = express();
const port = 3000;
app.use(express.json());
app.use("/uploads", express.static("uploads"));

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
  const desc = req.body.desc;

  if (!file) {
    return res.status(400).send({ message: "Something went wrong" });
  }
  //   var sql = "INSERT INTO `food`(`name`) VALUES ('" + req.file.filename + "')";
  var sql =
    "INSERT INTO `pets`(`image`, `breed`, `bname`, `price`,`category`,`description`) VALUES (?,?,?,?,?,?)";
  var query = db.query(
    sql,
    [file.filename, breed, bname, price, category, desc],
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
  const category = req.params.petname;
  var sql = "select * from `pets` where category=?";
  var query = db.query(sql, [category], function (err, result) {
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
  const desc = req.body.desc;

  if (!file) {
    return res.status(400).send({ message: "Something went wrong" });
  }

  var sql =
    "INSERT INTO `product`(`type`, `breed`, `ileft`,`image`,`description`) VALUES (?,?,?,?,?)";
  var query = db.query(
    sql,
    [type, breed, ileft, file.filename, desc],
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
  const category = req.params.petname;
  var sql = "select * from `product` where type=?";
  var query = db.query(sql, [category], function (err, result) {
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

//get profile
app.get("/getprofile/:email", (req, res) => {
  const email = req.params.email;
  var sql = "select * from `users` where email=? limit 1";
  var query = db.query(sql, [email], function (err, result) {
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

//cart
app.post("/createcart", (req, res, next) => {
  const pid = req.body.pid;
  const qty = req.body.qty;

  var sql = "INSERT INTO `cart`(`pid`, `qty`) VALUES (?,?)";
  var query = db.query(sql, [pid, qty], function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        message: `failed to created cart`,
      });
    }
    return res.status(200).send({ message: `Successfully created cart.` });
  });
});

app.get("/getcarts", (req, res, next) => {
  var sql =
    "SELECT c.id,c.qty,p.image,p.breed,p.bname,p.price,p.category,p.description  FROM `cart` as c INNER JOIN `pets` as p WHERE c.pid=p.id";
  db.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        message: `failed to get cart`,
      });
    }
    return res
      .status(200)
      .send({ message: `Successfully get cart.`, data: result });
  });
});

//delete cart
app.delete("/deletecart/:id", (req, res, next) => {
  var id = req.params.id;
  var sql = "DELETE FROM `cart` WHERE id=?";
  db.query(sql, [id], function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        message: `failed to delete cart`,
      });
    }
    return res.status(200).send({ message: `Successfully deleted cart.` });
  });
});

//favourites
//cart
app.post("/createfav", (req, res, next) => {
  const pid = req.body.pid;

  var sql = "INSERT INTO `favorite`(`pid`) VALUES (?)";
  var query = db.query(sql, [pid], function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        message: `failed to created favorite`,
      });
    }
    return res.status(200).send({ message: `Successfully created favorite.` });
  });
});

app.get("/getfav", (req, res, next) => {
  var sql =
    "SELECT f.id,p.image,p.breed,p.bname,p.price,p.category,p.description  FROM `favorite` as f INNER JOIN `pets` as p WHERE f.pid=p.id";
  db.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        message: `failed to get favorite`,
      });
    }
    return res
      .status(200)
      .send({ message: `Successfully get favorite.`, data: result });
  });
});

//delete cart
app.delete("/deletefav/:id", (req, res, next) => {
  var id = req.params.id;
  var sql = "DELETE FROM `favorite` WHERE id=?";
  db.query(sql, [id], function (err, result) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        status: false,
        message: `failed to delete favorite`,
      });
    }
    return res.status(200).send({ message: `Successfully deleted favorite.` });
  });
});

app.listen(port, () => {
  console.log(`Pets app listening at http://localhost:${port}`);
});
