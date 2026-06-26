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

// Delete multiple logs in one call. Backend: [FromBody] List<int> logdIds.
export const bulkDeleteLogs = async (ids) => {
    const response = await axios.delete('/HistoryLog/LogsBulkDelete', {
        data: ids,
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};