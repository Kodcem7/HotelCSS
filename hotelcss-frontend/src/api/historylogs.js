import axios from './axios'; 

export const getHistoryLogs = async () => {
    const response = await axios.get('/HistoryLog/GetHistoryLogs');
    return response.data;
};

export const deleteLog = async (id) => {
    const response = await axios.delete(`/HistoryLog/DeleteLogs?id=${id}`);
    return response.data;
};


export const deleteLast6Months = async () => {
    const response = await axios.delete('/HistoryLog/DeleteLast6Months');
    return response.data;
};