const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config()

const app = express();
app.use(bodyParser.json());

const createClickUpTask = async (lead) => {
    const url = `https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task`;
    const headers = {
        'Authorization': process.env.CLICKUP_API_TOKEN,
        'Content-Type': 'application/json'
    };
    const payload = {
        name: lead.name || 'New Lead',
        description: lead.description || 'No description provided',
        status: 'to do'
    };

    try {
        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        console.error('Error creating ClickUp task:', error);
        throw error;
    }
};

// Webhook endpoint to handle Nutshell leads
app.post('/nutshell-webhook', async (req, res) => {
    const data = req.body;

    if (data && data.lead) {
        const lead = data.lead;
        try {
            await createClickUpTask(lead);
            res.status(200).json({ status: 'success' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    } else {
        res.status(400).json({ status: 'error', message: 'Invalid data' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
