import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios'
import './db/dbConnection.js';
import OrderModel from "./db/model/OrderModel.js";
import { callConfirmationService, callConfirmationBellowPriceService} from './client.js';

const app = express();

app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 6010;
app.listen(PORT, () => {
    console.info(`Server is running on port ${PORT}`)
});

const STATUS_BAD_REQUEST = 400;
const STATUS_FORBIDDEN = 403;
const STATUS_NOT_FOUND = 404;
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_NO_CONTENT = 204;


// POST orders
app.post("/orders", async (req, res) => {
    console.info("\nCreate new order request received.")

    // Extracting data from request
    const { name, isin, amount } = req.body;

    if (!name || !isin || !amount) {
        return res.status(STATUS_BAD_REQUEST).send({error: "Missing order fields"});
    }

    try {
        const newOrder = new OrderModel({
            name: name,
            isin: isin,
            amount: amount,
            price: 0,
            state: 0
        });

        await newOrder.save();

        return res.status(201).send({ _id: newOrder._id, 
            name: newOrder.name, 
            isin: newOrder.isin, 
            price: newOrder.price,
            state: newOrder.state
        });
    } catch (error) {
        return res.status(500).send({error: "Error creating new order: " + error.message});
    }
});


// GET all
app.get("/orders", async (req, res) => {
    console.info("\nGet all orders request received.")

    const state = req.query.state;

    try {
        const allOrders = (state)? await OrderModel.find({state: state}).exec() : await OrderModel.find({});
        return res.status(200).send({orders: allOrders})
    } catch (error) {
        return res.status(500).send({ error: "Error:" + error.message });
    };
});


// GET order by id
app.get("/orders/:id", async (req, res) => {
    console.info("\nGet order by id request received.");

    if (req.params.id) {
        const order = await OrderModel.findOne({_id: req.params.id}).exec();
        if (order) {
            return res.status(STATUS_OK).send({order: order});
        } else {
            return res.status(500).send({ error: "Error:" + error.message });
        }
    } else {
        return res.status(STATUS_BAD_REQUEST).send({message: "Missing URL parameter \"id\"."});
    }
});


// UPDATE order amount
app.patch("/orders/:id/amount", async (req, res) => {
    try {
        console.info("\nUpdate order amount request received.")

        const order = await OrderModel.findOne({_id: req.params.id}).exec();
        
        if (!order) {
            return res.status(500).send({ error: "Order not found." });
        } 
        else if (order.state == 0) {
            let updatedOrder = await OrderModel.findOneAndUpdate(
                { _id: req.params.id },
                { amount: req.body.amount, }, 
                { runValidator: true, returnDocument: 'after'} // validate schema, return updated todo instead of old one
            );
            
            if (!updatedOrder) {
                return res.status(404).send("Order not found.")
            }

            return res.status(204).send();
        } else {
            return res.status(403).send({error: "Amount can only be modified in status 0."});
        }
    } catch (error) {
        return res.status(500).send({error: "Error updating order amount: " + error.message});
    }
});


// UPDATE order state
app.patch("/orders/:id/state", async (req, res) => {
    console.info("\nUpdate order state request received.");

    const newState = req.body.state;

    if (2 > newState || newState > 3) {
        return res.status(STATUS_FORBIDDEN).send({message: `Order does not allow change to state '${newState}'.`});
    }

    try {
        const order = await OrderModel.findById(req.params.id).exec();
        if (!order) {
            return res.status(500).send({ error: "Error:" + error.message });
        } 
        // 1 --+1--> 2 --+1--> 3
        if (newState - order.state !== 1) {
            return res.status(STATUS_FORBIDDEN).send({message: `Order with state ${order.state} does not allow change to state '${newState}'.`});
        }

        let updatedOrder = await OrderModel.findOneAndUpdate(
            { _id: req.params.id },
            { state: req.body.state, }, 
            { runValidator: true, returnDocument: 'after'} // validate schema, return updated todo instead of old one
       );

        if (!updatedOrder) {
            return res.status(404).send("Order not found.")
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({error: "Error updating order: " + error.message});
    }    
});


// UPDATE order with state 0 to 1 bellow price if specified
app.patch("/orders/:id/confirm", async (req, res) => {
    console.info("\nUpdate order state request received.");

    const { id } = req.params;
    const { maxPrice } = req.query;

    try {
        const order = await OrderModel.findById(id).exec();
        if (!order) {
            return res.status(404).send({ message: `Order '${id}' not found` });
        }

        if (order.state !== 0) {
            return res.status(STATUS_FORBIDDEN).send({ message: `Order not updated: state ${order.State} is not 0.` });
        }

        const isin = order.isin;
        let price;

        if (maxPrice) {
            const response = await callConfirmationBellowPriceService({ isin, maxPrice });
            price = response.price;

            if (price === 0) {
                return res.status(STATUS_FORBIDDEN).send({
                    message: `Order not confirmed: ISIN higher than ${maxPrice}`
                });
            }
        } else {
            const response = await callConfirmationService({ isin });
            price = response.price;
        }

        let updatedOrder = await OrderModel.findOneAndUpdate(
            { _id: req.params.id },
            { price: price, state: 1}, 
            { runValidator: true, returnDocument: 'after'} // validate schema, return updated todo instead of old one
       );

        if (!updatedOrder) {
            return res.status(404).send("Order not found.")
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({ error: "Error: " + error.message });
    }
});


// DELETE order by id
app.delete("/orders/:id", async (req, res) => {
    console.info("\nDelete order request received.")

    try {
        const deleteOrder = await OrderModel.findOneAndDelete({
            _id: req.params.id,
            state: {$in: [0, 1]}
        });

        if (!deleteOrder) {
            return res.status(404).send("Order not found");
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).send({message:"Error deleting todo: " + error.message});
    }
});


// High Load and Baseline Test
app.get('/overload', async (req, res) => {
    for(let i=0; i < 100; i++) {
        console.log(`------------------------- Log iteration: ${i} -------------------------`)
        for(let j=0; j<10000; j++) {
            // empty
        }
    }
    res.status(200).send("Success");
});

