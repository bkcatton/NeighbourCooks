import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Stack,
  Icon
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import { UserContext } from "../../Providers/UserProvider";
import axiosConfig from "../../axiosConfig";
import PaymentForm from "./PaymentForm";
import getFormattedCurrency from "../../Helpers/getFormattedCurrency";

const Cart = () => {
  const [userOrders, setUserOrders] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(null);
  const { user } = useContext(UserContext);
  const { userId } = user;

  const getOrderTotal = (array) => {
    let runningTotal = 0;
    for (const item of array) {
      runningTotal += (item.paid_price_cents * item.quantity);
    }
    return runningTotal;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosConfig.get(`/orders/user/${userId}`);

        if (data) {
          setUserOrders(data);
          setOrderId(data[0].order_id);
          const newOrderTotal = getOrderTotal(data);
          setOrderTotal(newOrderTotal);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const deleteFromOrder = async (orderItemsId) => {
    try {
      await axiosConfig.delete("/orders/delete", { data: { orderItemsId } });
      const remainingOrders = userOrders.filter((item) => {
        return item.order_items_id !== orderItemsId;
      });

      setUserOrders(remainingOrders);
      const newOrderTotal = getOrderTotal(remainingOrders);
      setOrderTotal(newOrderTotal);
    } catch (error) {
      console.log(error);
    }
  };

  const onCheckout = async () => {
    try {
      await axiosConfig.post("/orders/confirm", { orderId });
    } catch (error) {
      console.log(error);
    }
  };

  const ordersList = userOrders.map((item, i) => {
    const {
      title,
      paid_price_cents,
      country_style,
      quantity,
      image_link,
      bought_by,
      dish_description,
    } = item;
    return (
        <Card
          key={i}
          variant="outlined"
          sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Stack direction="column" justifyContent="space-between">
              <Typography variant="h6" color="text.primary" textAlign="left">
                {title}
              </Typography>
              <Typography style={{ width: "75%" }}>{dish_description}</Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              mt="auto"
            >
              <Box>
                <Typography color="text.secondary">Quantity:</Typography>
                <Typography color="text.secondary">Price:</Typography>
                <Typography>Total:</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary">{quantity}</Typography>
                <Typography color="text.secondary">
                  {`${getFormattedCurrency(paid_price_cents)}`}
                </Typography>
                <Typography>
                  {getFormattedCurrency(paid_price_cents * quantity)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>

          <CardMedia
            component="img"
            src={image_link}
            alt={title}
            sx={{ width: "9rem" }}
          />
          <Stack direction="column" justifyContent="center" backgroundColor="pink">
            <IconButton
              size="md"
              variant="outlined"
              // color="error"
              sx={{ m: 1, color: "gray" }}
              onClick={() => deleteFromOrder(item.order_items_id)}
              position="absolute"
              left="50"
              >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
            </Stack>
        </Card>
        
    );
  });

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        My Cart
      </Typography>
      {ordersList.length ? (
        ordersList
      ) : (
        <Typography>
          You currently have no orders. Back to <Link to="/">Browse</Link>?
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!!ordersList.length && (
          <Typography sx={{ mb: 1 }}>
            Cart Total: <strong>{getFormattedCurrency(orderTotal)}</strong>
          </Typography>
        )}
        {!!ordersList.length && (
          <PaymentForm
            orderTotal={orderTotal}
            userOrders={userOrders}
            onCheckout={onCheckout}
          />
        )}
      </Box>
    </Box>
  );
};

export default Cart;
