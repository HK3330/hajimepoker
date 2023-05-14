const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("./entrance.ejs");
});

router.get("/room/", (req, res) => {
  res.render("./index.ejs");
});

module.exports = router;
