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

// Sends the survey email for a log in the chosen language (tr/en/ru/de/da/pl).
export const sendEmail = async (id, lang = 'en') => {
    const response = await axios.post(`/HistoryLog/SendMail?id=${id}&lang=${encodeURIComponent(lang)}`);
    return response.data;
};

// Delete multiple logs in one call. Backend: [FromBody] List<int> logdIds.
export const bulkDeleteLogs = async (ids) => {
    const response = await axios.delete('/HistoryLog/LogsBulkDelete', {
        data: ids,
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};
