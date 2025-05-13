import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // You can add auth token here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorMessage = error.response?.data?.message || error.message;
        console.error(`[API Error] ${errorMessage}`);
        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data
        });
    }
);

// API endpoints
const endpoints = {
    subscription: '/subscription',
    plan: (id) => `/plan/${id}`,
    plans: '/plans'
};

// Helper function for API calls
const handleApiCall = async (apiCall, errorContext) => {
    try {
        const response = await apiCall;
        return response.data;
    } catch (error) {
        console.error(`[API] Error in ${errorContext}:`, error);
        throw error;
    }
};

export const postAWSAPI = async (data) => {
    if (!data) {
        throw new Error('No data provided for API call');
    }
    return handleApiCall(
        api.post(endpoints.subscription, data),
        'postAWSAPI'
    );
};

export const getPlanDetails = async (planId) => {
    if (!planId) {
        throw new Error('Plan ID is required');
    }
    return handleApiCall(
        api.get(endpoints.plan(planId)),
        'getPlanDetails'
    );
};

export const getAllPlans = async () => {
    try {
        // Define the specific plan IDs we want to fetch
        const planIds = [
            'plan_Q7qkkiaBkypLek',  // Basic Plan
            'plan_QBKMIS4rIFWgOG',  // Professional Plan
            'plan_QBKreMzkSNck8V'   // Enterprise Plan
        ];

        // Fetch each plan individually and combine the results
        const planPromises = planIds.map(planId => getPlanDetails(planId));
        const planResponses = await Promise.all(planPromises);
        
        // Filter successful responses and extract plan data
        const plans = planResponses
            .filter(response => response.statusCode === 200)
            .map(response => response.body.data);

        return {
            statusCode: 200,
            body: {
                status: 'success',
                data: {
                    entity: 'collection',
                    count: plans.length,
                    items: plans
                }
            }
        };
    } catch (error) {
        console.error('Error fetching plans:', error);
        return {
            statusCode: 500,
            body: {
                status: 'error',
                message: error.message || 'Failed to fetch plans'
            }
        };
    }
};
