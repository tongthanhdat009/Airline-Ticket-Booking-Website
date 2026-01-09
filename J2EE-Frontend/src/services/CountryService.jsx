import apiClient from './apiClient';

const COUNTRIES_API_URL = '/countries';

export const getAllCountries = async () => {
    try {
        const response = await apiClient.get(COUNTRIES_API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw error;
    }
};