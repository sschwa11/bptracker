import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const fetchUsers = async () => {
    if (!API_URL) {
        console.warn('API_URL not set');
        return { users: [] };
    }
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return { users: [] };
    }
};

export const addUser = async (name) => {
    if (!API_URL) return;
    try {
        await axios.post(API_URL, JSON.stringify({ action: 'addUser', name }), {
            headers: { 'Content-Type': 'text/plain' }
        });
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

export const removeUser = async (name) => {
    if (!API_URL) return;
    try {
        await axios.post(API_URL, JSON.stringify({ action: 'removeUser', name }), {
            headers: { 'Content-Type': 'text/plain' }
        });
    } catch (error) {
        console.error('Error removing user:', error);
        throw error;
    }
};

export const updateBlueprintStatus = async (userName, blueprintId, status) => {
    if (!API_URL) return;
    try {
        await axios.post(API_URL, JSON.stringify({
            action: 'updateBlueprint',
            name: userName,
            blueprintId,
            status
        }), {
            headers: { 'Content-Type': 'text/plain' }
        });
    } catch (error) {
        console.error('Error updating blueprint:', error);
        throw error;
    }
};

export const setAllBlueprintsStatus = async (userName, status) => {
    if (!API_URL) return;
    try {
        await axios.post(API_URL, JSON.stringify({
            action: 'setAll',
            name: userName,
            status
        }), {
            headers: { 'Content-Type': 'text/plain' }
        });
    } catch (error) {
        console.error('Error bulk updating:', error);
        throw error;
    }
};
