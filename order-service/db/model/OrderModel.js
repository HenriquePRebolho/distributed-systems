import mongoose from 'mongoose'
import OrderSchema from '../schema/OrderSchema.js';

const OrderModel = mongoose.model('Order', OrderSchema);

export default OrderModel;