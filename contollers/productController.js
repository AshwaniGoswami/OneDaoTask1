const pool = require("../config/dbConfig");
const Joi = require("joi");

// product schema
const productSchema = Joi.object({
  carComfort: Joi.string().max(255).required(),
  startLocation: Joi.string().max(255).required(),
  endLocation: Joi.string().max(255).required(),
  price: Joi.number().precision(2).positive().required(),
});

//Creating a product
exports.AddProduct = async (req, res) => {
  const { carComfort, startLocation, endLocation, price } = req.body;
  const userId = req.userId;

  // Validate product data
  const { error } = productSchema.validate({
    carComfort,
    startLocation,
    endLocation,
    price,
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const product = await pool.query(
      `INSERT INTO products (carComfort, startLocation, endLocation, price, userId)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [carComfort, startLocation, endLocation, price, userId]
    );

    res.status(201).json(product.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//Get all products
exports.GetProducts = async (req, res) => {
  // Calculate pagination parameters based on query parameters default values are 1 for page and 10 for limit
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const products = await pool.query(
      `SELECT * FROM products
       ORDER BY ordered_time DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total number of products
    const countResult = await pool.query(`SELECT COUNT(*) FROM products`);
    const totalProducts = parseInt(countResult.rows[0].count, 10);

    res.status(200).json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      products: products.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//Edit product
exports.EditProduct = async (req, res) => {
  const { id } = req.params;
  const { carComfort, startLocation, endLocation, price } = req.body;
  const userId = req.userId;

  // Validate product data
  const { error } = productSchema.validate({
    carComfort,
    startLocation,
    endLocation,
    price,
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const product = await pool.query(
      `UPDATE products
       SET carComfort = $1, startLocation = $2, endLocation = $3, price = $4
       WHERE id = $5 AND userId = $6
       RETURNING *`,
      [carComfort, startLocation, endLocation, price, id, userId]
    );

    if (product.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Product not found or not owned by user." });
    }

    res.json(product.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//Delete product
exports.DeleteProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const product = await pool.query(
      `DELETE FROM products
       WHERE id = $1 AND userId = $2
       RETURNING *`,
      [id, userId]
    );

    if (product.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Product not found or not owned by user." });
    }

    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};
