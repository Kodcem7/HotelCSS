import api from './axios'; // Ensure this points to your configured axios instance

export const getTripAdvisorReviews = async (forceRefresh = false) => {
    try {
        const response = await api.get('/Reviews/tripadvisor', {
            params: forceRefresh ? { forceRefresh: true } : undefined,
        });
        // TripAdvisor wraps the actual reviews inside a 'data' array in their JSON
        return response.data.data || [];
    } catch (error) {
        console.error("Failed to fetch TripAdvisor reviews:", error);
        throw error;
    }
};