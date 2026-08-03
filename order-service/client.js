// Client Stub

// Import the packages
import grpc from "@grpc/grpc-js";
import protoLoader from '@grpc/proto-loader';

// Define and configure the package
const packageDefinition = protoLoader.loadSync('./confirmation.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

// Create a gRPC object from the .proto definition
const confirmationProto = grpc.loadPackageDefinition(packageDefinition).confirmation;

// Create the client
const client = new confirmationProto.Confirmation(
    'localhost:4000', grpc.credentials.createInsecure() // confirmation-service
);

// Define a function that executes the RPC and can be called locally
export function callConfirmationService(param) {
    console.log("Reached callConfirmationService");
    return new Promise((resolve, reject) => {
        client.ConfirmOrder({ isin: param.isin }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
}

export function callConfirmationBellowPriceService(param) {
    console.log("Reached callConfirmationBellowPriceService");
    return new Promise((resolve, reject) => {
        client.ConfirmOrderBellowPrice({ isin: param.isin, maxPrice: param.maxPrice }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
}
