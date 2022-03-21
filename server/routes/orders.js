const express = require('express');
const router = express.Router();

module.exports = db => {
  router.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const orders = await db.query(
        `SELECT orders.id AS order_id, order_items.id AS order_items_id, quantity, orders.customer_id, paid_price_cents, title, dish_description, country_style, image_link
          FROM orders
          JOIN order_items ON orders.id = order_items.order_id
          JOIN dishes ON order_items.dish_id = dishes.id
          WHERE orders.confirmed = false AND orders.customer_id = $1;
        `,
        [id]
      );
      res.json(orders.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/previous/:id', async (req, res) => {
    console.log('this is the req.params', req.params);
    const { id } = req.params;
    try {
      const orders = await db.query(
        `SELECT dishes.id AS dish_id, title, order_items.paid_price_cents, dishes.image_link, quantity, country_style, orders.id AS order_id FROM orders
          JOIN order_items ON orders.id = order_items.order_id
          JOIN dishes ON order_items.dish_id = dishes.id
          WHERE orders.confirmed = true AND orders.customer_id = $1;
        `,
        [id]
      );
      res.json(orders.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/delete', async (req, res) => {
    const { orderItemsId } = req.body;
    try {
      const orders = await db.query(
        `DELETE FROM order_items
          WHERE id = $1;
        `,
        [orderItemsId]
      );
      res.json(orders.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/current/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const order = await db.query(
        `SELECT title, order_items.paid_price_cents, dishes.image_link, quantity, country_style, orders.id AS order_id FROM dishes
          JOIN order_items ON dishes.id = order_items.dish_id
          JOIN orders ON order_items.order_id = orders.id
          WHERE orders.confirmed = true AND dishes.user_id = $1;
        `,
        [id]
      );
      res.json(order.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/order_item', async (req, res) => {
    const { order_id, dish_id, quantity, paid_price_cents } = req.body;
    try {
      const order = await db.query(
        `INSERT INTO order_items(order_id, dish_id, quantity, paid_price_cents)
          VALUES ($1, $2, $3, $4) RETURNING *;
        `,
        [order_id, dish_id, quantity, paid_price_cents]
      );
      // res.json(order.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/confirm', async (req, res) => {
    const { orderId } = req.body;
    try {
      const data = await db.query(
        `UPDATE orders
          SET confirmed = true
          WHERE customer_id = $1;
        `,
        [orderId]
      );
      res.json(data.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/reviews', async (req, res) => {
    const { reviewBody, userId, dishId } = req.body;

    try {
      await db.query(
        `INSERT INTO reviews(content, star_rating, reviewer_id, dish_id)
          VALUES ($1, $2, $3, $4);
        `,
        [reviewBody, 5, userId, dishId]
      );
      // res.json(data.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', async (req, res) => {
    const { userId } = req.body;
    try {
      const data = await db.query(
        `INSERT INTO orders(customer_id)
          VALUES ($1) RETURNING *;
        `,
        [userId]
      );
      res.json(data.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
