var axios = require('axios');

// const API_URL = 'http://localhost:5000';

export default async function post_AWS_API(data) {
    if (data == "") {
        return;
    }

    console.log("Sending data:", data);

    var config = {
        method: 'post',
        url: `${API_URL}/subscription`,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios(config);
        console.log("Response received:", response.data);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export async function get_plan_details(planId) {
    try {
        const response = await axios.get(`${API_URL}/plan/${planId}`);
        console.log("Plan details received:", response.data);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export async function get_all_plans() {
    try {
        const response = await axios.get(`${API_URL}/plans`);
        console.log("All plans received:", response.data);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}
