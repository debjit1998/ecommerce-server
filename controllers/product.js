const Product = require("../models/product");
const slugify = require("slugify");
const User = require("../models/user");

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err: err.message,
    });
  }
};

exports.listAll = async (req, res) => {
  let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate("category")
    .populate("subs")
    .sort([["createdAt", "desc"]])
    .exec();
  res.json(products);
};

// exports.list = async (req, res) => {
//   try {
//     const { sort, order, limit } = req.body;
//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .sort([[sort, order]])
//       .limit(limit)
//       .exec();

//     res.json(products);
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.list = async (req, res) => {
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;

    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subs")
      .sort([[sort, order]])
      .limit(perPage)
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

exports.remove = async (req, res) => {
  //console.log(req.params.slug);
  try {
    const deleted = await Product.findOneAndRemove({
      slug: req.params.slug,
    }).exec();
    res.json(deleted);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Product delete failed");
  }
};

exports.read = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category")
    .populate("subs")
    .exec();

  res.json(product);
};

exports.update = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err: err.message,
    });
  }
};

exports.productsCount = async (req, res) => {
  let total = await Product.find({}).estimatedDocumentCount().exec();
  res.json(total);
};

exports.productStar = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();
  const user = await User.findOne({ email: req.user.email }).exec();
  const { star } = req.body;

  let existingRatingObject = product.ratings.find(
    (ele) => ele.postedBy.toString() === user._id.toString()
  );

  if (existingRatingObject === undefined) {
    let ratingAdded = Product.findByIdAndUpdate(
      product._id,
      {
        $push: { ratings: { star, postedBy: user._id } },
      },
      { new: true }
    ).exec();
    res.json(ratingAdded);
  } else {
    let ratingUpdated = Product.updateOne(
      {
        ratings: { $elemMatch: existingRatingObject },
      },
      {
        $set: { "ratings.$.star": star },
      },
      { new: true }
    ).exec();

    res.json(ratingUpdated);
  }
};

exports.listRelated = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(3)
    .populate("category")
    .populate("subs")
    .populate("postedBy")
    .exec();

  res.json(related);
};

//Search Filters

const handleQuery = async (req, res, query) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("postedBy", "_id name")
    .exec();

  res.json(products);
};

const handlePrice = async (req, res, price) => {
  try {
    const products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleCategory = async (req, res, category) => {
  try {
    const products = await Product.find({ category })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleStars = (req, res, stars) => {
  try {
    Product.aggregate([
      {
        $project: {
          document: "$$ROOT",
          floorAverage: {
            $floor: { $avg: "$ratings.star" },
          },
        },
      },
      { $match: { floorAverage: stars } },
    ])
      .limit(12)
      .exec((err, aggregates) => {
        //console.log("Aggregates", aggregates);
        if (err) console.log(err);
        Product.find({ _id: aggregates })
          .populate("category")
          .populate("subs")
          .populate("postedBy")
          .exec((err, products) => {
            if (err) console.log(err);
            res.json(products);
          });
      });
  } catch (err) {
    console.log(err);
  }
};

const handleSub = async (req, res, sub) => {
  const products = await Product.find({ subs: sub })
    .populate("category")
    .populate("subs")
    .populate("postedBy")
    .exec();

  res.json(products);
};

const handleShipping = async (req, res, shipping) => {
  const products = await Product.find({ shipping })
    .populate("category")
    .populate("subs")
    .populate("postedBy")
    .exec();

  res.json(products);
};

const handleColor = async (req, res, color) => {
  const products = await Product.find({ color })
    .populate("category")
    .populate("subs")
    .populate("postedBy")
    .exec();

  res.json(products);
};

const handleBrand = async (req, res, brand) => {
  const products = await Product.find({ brand })
    .populate("category")
    .populate("subs")
    .populate("postedBy")
    .exec();

  res.json(products);
};

exports.searchFilters = async (req, res) => {
  const {
    query,
    price,
    category,
    stars,
    sub,
    shipping,
    color,
    brand,
  } = req.body;

  if (query) {
    console.log("query --->", query);
    await handleQuery(req, res, query);
  }

  if (price !== undefined) {
    console.log("price --->", price);
    await handlePrice(req, res, price);
  }

  if (category !== undefined) {
    console.log("category --->", category);
    await handleCategory(req, res, category);
  }

  if (stars !== undefined) {
    console.log("stars --->", stars);
    await handleStars(req, res, parseInt(stars));
  }

  if (sub !== undefined) {
    console.log("sub --->", sub);
    await handleSub(req, res, sub);
  }

  if (shipping !== undefined) {
    console.log("shipping --->", shipping);
    await handleShipping(req, res, shipping);
  }

  if (color !== undefined) {
    console.log("color --->", color);
    await handleColor(req, res, color);
  }

  if (brand !== undefined) {
    console.log("brand --->", brand);
    await handleBrand(req, res, brand);
  }
};
