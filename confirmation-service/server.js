// Server skeleton

// Required packages need to be imported:
const gRPC = require('@grpc/grpc-js');
const { GRPC_METRICS_HEADER } = require('@grpc/grpc-js/build/src/orca');
const protoLoader = require('@grpc/proto-loader');


// Proto File is loaded and a packageDefinition object is created.
// This represents the definitions from the Proto File as a JavaScript object. 
const packageDef = protoLoader.loadSync('confirmation.proto', {});
// Then, a gRPC object is created from the packageDefinition. 
// This gRPC object contains the definitions and methods defined in confirmation.proto.
const gRPCObject = gRPC.loadPackageDefinition(packageDef);

// Confirmation package (defined in .proto) is extracted from the gRPC object and stored in a JS constant.
const confirmationPackage = gRPCObject.confirmation;


// The required methods are defined
async function ConfirmOrder(call, callback) {
    console.log(`Confirmation order received: ${call.request.isin}`)
    const isin = call.request.isin;

    let price = await getPriceData(isin);

    if (price > 0) {
        return callback(null, {price: price, state: 1}); // null to indicate no error
    } else {
        callback({
            code: gRPC.status.FAILED_PRECONDITION,
            details: 'Could not confirm order'
        });
    }
}

async function ConfirmOrderBellowPrice(call, callback) {
    console.log(`Confirmation order bellow price received: isin: ${call.request.isin}, max price: ${call.request.maxPrice}`);
    const isin = call.request.isin;
    console.log(call.request);
    const max_price = parseFloat(call.request.maxPrice);

    const price = await getPriceData(isin);

    if (price <= max_price) {
        return callback(null, {price: price, state: 1}); // null to indicate no error
    } else if (price > max_price) {
        return callback(null, {price: 0, state: 0}); // null to indicate no error
    } else {
        callback({
            code: gRPC.status.FAILED_PRECONDITION,
            details: 'Could not confirm order'
        });
    }
}

// Create new server
const server = new gRPC.Server();

// Add service to server
server.addService(confirmationPackage.Confirmation.service, {
    // List of functions that can be called
    ConfirmOrder,
    ConfirmOrderBellowPrice
})

// Bind address to server and start it
server.bindAsync("0.0.0.0:4000", gRPC.ServerCredentials.createInsecure(),
(error, bindAddress) => {
    if (error) {
        console.error(`Failed to bind server: ${error.message}`);
        return;
    }
    console.log(`Server is running at port ${bindAddress}`);
});



const axios = require('axios');

async function getPriceData(isin) {
    try {
        const response = await axios.get(`https://onlineweiterbildung-reutlingen-university.de/vswsp5/index.php?isin=${isin}`);
        const respData = Object.values(response.data)[0];
        const cleaned = respData.toString().replace(',','');
        const price = parseFloat(cleaned);
        return price;
    } catch (error)  {
        console.error("Price could not be retrieved");
    }
}
