import 'dotenv/config';
import twilio from './src/be/whatsapp-msg-service/twilio.js';

async function testWhatsappMessage() {
    console.log('--- Testing sendWhatsappMessage ---');

    // Replace with a valid WhatsApp phone number (do not include the +91 if the method appends it)
    // For example, if your number is +91-9876543210, just enter '9876543210'
    const testNumber = '7320885821';

    // Demo Data
    const demoName = 'John Doe';
    const demoVehicleNo = 'DL81YJ5252';
    const demoViolation = 'Overspeeding';

    console.log(`Sending to: ${testNumber}`);
    console.log(`Name: ${demoName}`);
    console.log(`Vehicle No: ${demoVehicleNo}`);
    console.log(`Violation: ${demoViolation}`);
    console.log('-----------------------------------');

    try {
        // Calling the target function
        await twilio.sendWhatsappMessage(testNumber, demoName, demoVehicleNo, demoViolation);

        console.log('Test completed. Check your Twilio logs or the recipient WhatsApp number.');
    } catch (error) {
        console.error('\nThere was an error while testing sendWhatsappMessage:');
        console.error(error);
    }
}

testWhatsappMessage();
