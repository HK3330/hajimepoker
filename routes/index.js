var router = require("express").Router();

router.get("/", (req, res) => {
    // index.ejsをレンダリング
    res.render("./index.ejs");
});

router.get("/room", (req, res) => {
    // index.ejsをレンダリング
    res.render("./entrance.ejs");
});

module.exports = router;