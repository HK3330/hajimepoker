var router = require("express").Router();

router.get("/", (req, res) => {
    res.render("/usr/src/src/view/entrance.ejs");
});

router.get("/room/", (req, res) => {
    res.render("../view/index.ejs");
});

module.exports = router;