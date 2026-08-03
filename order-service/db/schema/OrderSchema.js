import mongoose from 'mongoose'

const { Schema } = mongoose;

const OrderSchema = new Schema ({
    name: {type: String, required: true, trim: true},
    isin: {type: String, required: true, trim: true},
    amount: {type: Schema.Types.Int32, required: true},
    price: {type: Schema.Types.Double, required: true},
    state: {type: Schema.Types.Int32, required: true}
})

export default OrderSchema;