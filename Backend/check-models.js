require('dotenv').config();

const API_KEY = process.env.API_KEY;

async function listModels() {
    try {
        console.log('Checking API Key:', API_KEY ? API_KEY.substring(0, 20) + '...' : 'NOT FOUND');
        console.log('\nFetching available models...\n');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ ERROR:', response.status, response.statusText);
            console.error(errorText);
            console.log('\n🔧 SOLUTION:');
            console.log('1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
            console.log('2. Select project "Mental"');
            console.log('3. Click "ENABLE" button');
            console.log('4. Wait a few seconds');
            console.log('5. Run this script again\n');
            return;
        }

        const data = await response.json();
        
        if (data.models && data.models.length > 0) {
            console.log('✅ API is working! Available models:');
            console.log('=====================================\n');
            data.models.forEach(model => {
                console.log(`📦 ${model.name}`);
                console.log(`   Display: ${model.displayName}`);
                console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No models available for this API key');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.log('\n🔧 Please enable the API at:');
        console.log('https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com\n');
    }
}

listModels();
