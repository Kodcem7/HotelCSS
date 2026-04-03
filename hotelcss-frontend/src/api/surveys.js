import api from './axios';

// For the Admin to create a new survey
export const createSurvey = async (surveyData) => {
    const response = await api.post('/Survey/CreateSurvey', surveyData);
    return response.data;
};

// We will use these two later for the Room Trap!
export const getPendingSurvey = async () => {
    const response = await api.get('/Survey/GetPendingSurvey');
    return response.data;
};

export const submitSurvey = async (data) => {
    const response = await api.post('/Survey/SubmitSurvey', data);
    return response.data;
};

export const getAllSurveys = async () => {
    const response = await api.get('/Survey/GetAllSurveys');
    return response.data;
};

export const getSurveyResponses = async (surveyId) => {
    const response = await api.get(`/Survey/GetSurveyResponses/${surveyId}`);
    return response.data;
};

export const getResponseDetails = async (responseId) => {
    const response = await api.get(`/Survey/GetResponseDetails/${responseId}`);
    return response.data;
};

export const toggleSurveyStatus = async (id) => {
    const response = await api.put(`/Survey/ToggleActive/${id}`);
    return response.data;
};

export const analyzeSurvey = async (id) => {
    const response = await api.get(`/Survey/AnalyzeSurvey/${id}`);
    return response.data;
};

export const getSurveyAiAnalysis = async (surveyId) => {
    const response = await api.get(`/Survey/AnalyzeSurvey/${surveyId}`);
    return response.data;
};
