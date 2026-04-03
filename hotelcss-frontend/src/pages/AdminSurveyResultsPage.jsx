import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getAllSurveys, getSurveyResponses, getResponseDetails, toggleSurveyStatus, getSurveyAiAnalysis } from '../api/surveys';

const AdminSurveyResultsPage = () => {
    // view state can be: 'surveys', 'responses', 'answers', 'analysis'
    const [currentView, setCurrentView] = useState('surveys');

    const [surveys, setSurveys] = useState([]);
    const [responses, setResponses] = useState([]);
    const [answers, setAnswers] = useState(null);
    const [currentSurveyTitle, setCurrentSurveyTitle] = useState('');

    // AI States
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const res = await getAllSurveys();
            const surveyArray = res.surveys || res.data || res.value || res || [];
            setSurveys(Array.isArray(surveyArray) ? surveyArray : []);
        } catch (err) {
            setError('Failed to load surveys.');
            console.error("Fetch Surveys Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (surveyId) => {
        try {
            setLoading(true);
            await toggleSurveyStatus(surveyId);
            await fetchSurveys();
        } catch (err) {
            setError('Failed to update survey status.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewResponses = async (surveyId) => {
        try {
            setLoading(true);
            const res = await getSurveyResponses(surveyId);
            setResponses(res.responses || []);
            setCurrentSurveyTitle(res.surveyTitle);
            setCurrentView('responses');
        } catch (err) {
            setError('Failed to load responses.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAnswers = async (responseId) => {
        try {
            setLoading(true);
            const res = await getResponseDetails(responseId);
            setAnswers(res);
            setCurrentView('answers');
        } catch (err) {
            setError('Failed to load answers.');
        } finally {
            setLoading(false);
        }
    };

    // The AI Action Trigger
    const handleAnalyzeSurvey = async (surveyId, title) => {
        try {
            setIsAnalyzing(true);
            setCurrentSurveyTitle(title);
            setCurrentView('analysis'); // Switch to the AI view instantly
            setError('');

            const res = await getSurveyAiAnalysis(surveyId);
            setAiAnalysis(res.analysis);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze survey.');
            setCurrentView('surveys'); // Kick them back if it fails
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <Layout><LoadingSpinner text="Loading data..." /></Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto p-6">
                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

                {/* LEVEL 1: ALL SURVEYS */}
                {currentView === 'surveys' && (
                    <div className="animation-fade-in-up">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Survey Results</h2>
                                <p className="text-gray-600 mt-1">Select a survey to view guest feedback or manage its status.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Survey Title</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Created</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {surveys.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">{s.title}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {s.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {new Date(s.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {/* The Toggle Button */}
                                                <button
                                                    onClick={() => handleToggleStatus(s.id)}
                                                    className={`font-semibold text-sm px-4 py-2 rounded-lg transition-colors ${s.isActive
                                                            ? 'text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800'
                                                            : 'text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-800'
                                                        }`}
                                                >
                                                    {s.isActive ? 'Deactivate' : 'Activate'}
                                                </button>

                                                {/* The AI Analytics Button */}
                                                <button
                                                    onClick={() => handleAnalyzeSurvey(s.id, s.title)}
                                                    className="text-purple-700 hover:text-purple-900 font-semibold text-sm bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1 border border-purple-200"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                                    Analyze with AI
                                                </button>

                                                {/* The Manual Details Button */}
                                                <button
                                                    onClick={() => handleViewResponses(s.id)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {surveys.length === 0 && (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No surveys created yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* LEVEL AI - THE ANALYSIS VIEW */}
                {currentView === 'analysis' && (
                    <div className="animation-fade-in-up">
                        <div className="mb-6">
                            <button
                                onClick={() => setCurrentView('surveys')}
                                className="flex items-center text-gray-500 hover:text-gray-800 font-semibold mb-4 transition-colors"
                            >
                                <span className="material-symbols-outlined mr-1 text-sm">arrow_back</span> Back to Surveys
                            </button>
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
                                <span className="material-symbols-outlined text-4xl text-purple-600">auto_awesome</span>
                                AI Executive Analysis
                            </h2>
                            <p className="text-gray-600 mt-1">Survey: {currentSurveyTitle}</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-100 min-h-[300px]">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                    <p className="text-purple-600 font-bold animate-pulse">Aggregating data and generating insights...</p>
                                </div>
                            ) : (
                                <div className="prose prose-purple max-w-none">
                                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">
                                        {aiAnalysis}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* LEVEL 2: ROOM RESPONSES */}
                {currentView === 'responses' && (
                    <div className="animation-fade-in-up">
                        <div className="mb-6">
                            <button
                                onClick={() => setCurrentView('surveys')}
                                className="flex items-center text-gray-500 hover:text-gray-800 font-semibold mb-4 transition-colors"
                            >
                                <span className="material-symbols-outlined mr-1 text-sm">arrow_back</span> Back to Surveys
                            </button>
                            <h2 className="text-3xl font-bold text-gray-900">{currentSurveyTitle}</h2>
                            <p className="text-gray-600 mt-1">Showing all submitted responses for this survey.</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Room Number</th>
                                        <th className="p-4 font-semibold">Submitted At</th>
                                        <th className="p-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {responses.map((r) => (
                                        <tr key={r.responseId} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-bold text-blue-700">Room {r.roomNumber}</td>
                                            <td className="p-4 text-gray-600">
                                                {new Date(r.submittedAt).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleViewAnswers(r.responseId)}
                                                    className="text-orange-600 hover:text-orange-800 font-semibold text-sm bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    View Answers
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {responses.length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-500">No responses yet for this survey.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* LEVEL 3: EXACT ANSWERS */}
                {currentView === 'answers' && answers && (
                    <div className="animation-fade-in-up">
                        <div className="mb-6">
                            <button
                                onClick={() => setCurrentView('responses')}
                                className="flex items-center text-gray-500 hover:text-gray-800 font-semibold mb-4 transition-colors"
                            >
                                <span className="material-symbols-outlined mr-1 text-sm">arrow_back</span> Back to Responses
                            </button>
                            <h2 className="text-3xl font-bold text-gray-900">Room {answers.roomNumber} Feedback</h2>
                            <p className="text-gray-600 mt-1">Submitted: {new Date(answers.submittedAt).toLocaleString()}</p>
                        </div>

                        <div className="space-y-4">
                            {answers.answers.map((a, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3">{a.questionText}</h4>

                                    {a.questionType === 'StarRating' ? (
                                        <div className="flex items-center text-yellow-400">
                                            <span className="font-bold text-2xl mr-2 text-gray-800">{a.answerValue}/5</span>
                                            <span className="material-symbols-outlined">star</span>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 italic">
                                            "{a.answerValue}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminSurveyResultsPage;