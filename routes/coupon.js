const express = require("express");

const { authCheck, adminCheck } = require("../middlewares/auth");
const { create, remove, list } = require("../controllers/coupon");

const router = express.Router();

router.post("/coupon", authCheck, adminCheck, create);
router.delete("/coupon/:couponId", authCheck, adminCheck, remove);
router.get("/coupons", list);

module.exports = router;
