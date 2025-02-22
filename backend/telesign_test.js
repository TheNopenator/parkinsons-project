const TeleSignSDK = require("telesignsdk");

// Replace the defaults below with your Telesign authentication credentials or pull them from environment variables.
const customerId =
  process.env.TELESIGN_CUSTOMER_ID || "BDB69E86-9DB9-4EA1-B9F1-029640C7A68C";
const apiKey =
  process.env.TELESIGN_API_KEY ||
  "LeNRpMiOTEuNPWskahS0LaOQBlNszSDjBti7PEBV2cFgsiQGWw3yFxgD0OCtaZPKgoITd6gHeoSXI1hPXu5qdw==";
const phoneNumber = process.env.TELESIGN_PHONE_NUMBER || "+18472816611"; // Ensure the phone number is in E.164 format

// Set the message text and type.
const message =
  "Your package has shipped! Follow your delivery at https://vero-finto.com/orders/3456";
const messageType = "ARN"; // This is an alert message

// Instantiate a messaging client object.
const client = new TeleSignSDK(customerId, apiKey);

// Define the callback.
function smsCallback(error, responseBody) {
  if (error === null) {
    console.log("Response body:" + JSON.stringify(responseBody));
  } else {
    console.error("Unable to send SMS. Error:" + error);
  }
}

// Send the SMS
client.sms.message(smsCallback, phoneNumber, message, messageType, {});
