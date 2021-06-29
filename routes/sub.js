const express = require("express");
const { create, list, read, update, remove } = require("../controllers/sub");
const { authCheck, adminCheck } = require("../middlewares/auth");

const router = express.Router();

router.post("/sub", authCheck, adminCheck, create);
router.get("/subs", list);
router.get("/sub/:slug", read);
router.put("/sub/:slug", authCheck, adminCheck, update);
router.delete("/sub/:slug", authCheck, adminCheck, remove);

module.exports = router;
