var router = require("express").Router();

router.get("/", (req, res) => {
    // index.ejsをレンダリング
    res.render("./index.ejs");
});

module.exports = router;