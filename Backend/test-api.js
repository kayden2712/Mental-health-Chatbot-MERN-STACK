const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
console.log('Testing API Key:', API_KEY ? API_KEY.substring(0, 20) + '...' : 'NOT FOUND');

const genAI = new GoogleGenerativeAI(API_KEY);

async function testAPI() {
    try {
        console.log('\nTesting gemini-pro...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log('✓ SUCCESS with gemini-pro!');
        console.log('Response:', response.text());
    } catch (error) {
        console.log('✗ FAILED:', error.message);
        console.log('\nPlease enable Generative Language API:');
        console.log('https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    }
}

testAPI();
