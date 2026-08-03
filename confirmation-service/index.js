const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.info(`Server is running on port ${PORT}`)
});


// GET confirmation
app.get("/confirmation", async  (req, res) => {
    console.log("Confirmation order received: " + req.query.isin);
    try {
        const isin = req.query.isin;
        let priceData = await getPriceData(isin);
        const price = parseFloat(Object.values(priceData)[0]);

        res.status(200).send({price: price, state: 1});
    } catch (error) {
        res.status(500).send({message: "Could not retrieve price or confirm state update.", price: 0, state: 0});
    }
})


async function getPriceData(isin) {
    try {
        const response = await axios.get(`https://onlineweiterbildung-reutlingen-university.de/vswsp5/index.php?isin=${isin}`);
        return response.data;
    } catch (error)  {
        console.error("Price could not be retrieved");
    }
}
