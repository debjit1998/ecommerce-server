const express = require("express");

const {
  create,
  listAll,
  remove,
  read,
  update,
  list,
  productsCount,
  productStar,
  listRelated,
  searchFilters,
} = require("../controllers/product");
const { authCheck, adminCheck } = require("../middlewares/auth");

const router = express.Router();

router.post("/product", authCheck, adminCheck, create);
router.get("/products/total", productsCount);
router.get("/products/:count", listAll);
router.delete("/product/:slug", authCheck, adminCheck, remove);
router.get("/product/:slug", read);
router.put("/product/:slug", authCheck, adminCheck, update);

router.post("/products", list);

//Rating
router.put("/product/star/:productId", authCheck, productStar);

//Related products
router.get("/product/related/:productId", listRelated);

//Search
router.post("/search/filters", searchFilters);

module.exports = router;
