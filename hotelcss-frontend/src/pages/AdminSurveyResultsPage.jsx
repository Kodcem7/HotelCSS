import { useState, useEffect } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { getAllSurveys, getSurveyResponses, getResponseDetails, toggleSurveyStatus, getSurveyAiAnalysis, deleteSurvey, averageStars } from '../api/surveys';

const AdminSurveyResultsPage = () => {
    // view state can be: 'surveys', 'responses', 'answers', 'analysis'
    const [currentView, setCurrentView] = useState('surveys');

    const [surveys, setSurveys] = useState([]);
    const [responses, setResponses] = useState([]);
    const [answers, setAnswers] = useState(null);
    const [currentSurveyTitle, setCurrentSurveyTitle] = useState('');

    // 👇 NEW STATE: Hold the average rating for the survey being viewed
    const [currentSurveyAverage, setCurrentSurveyAverage] = useState(null);

    // AI States
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const handleDeleteSurvey = async (surveyId) => {
        if (!window.confirm('Are you sure you want to delete this survey? This will permanently delete all guest responses attached to it.')) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await deleteSurvey(surveyId);
            await fetchSurveys();

            setSuccess('Survey and all responses deleted successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete survey.');
        } finally {
            setLoading(false);
        }
    };

    // 👇 UPGRADED: Now fetches the responses AND the average score dynamically!
    const handleViewResponses = async (surveyId) => {
        try {
            setLoading(true);
            setError('');
            setCurrentSurveyAverage(null); // Reset from previous views

            // 1. Fetch the responses
            const res = await getSurveyResponses(surveyId);
            setResponses(res.responses || []);
            setCurrentSurveyTitle(res.surveyTitle);

            // 2. Fetch the average silently in the background
            try {
                const avgRes = await averageStars(surveyId);
                // Only set it if it's greater than 0
                if (avgRes && avgRes.average > 0) {
                    setCurrentSurveyAverage(avgRes.average);
                }
            } catch (avgErr) {
                // If it fails (e.g. no star questions on this survey), just ignore it and don't break the page
                console.log("No star ratings to average for this survey.");
            }

            // 3. Switch the view
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

    const handleAnalyzeSurvey = async (surveyId, title) => {
        try {
            setIsAnalyzing(true);
            setCurrentSurveyTitle(title);
            setCurrentView('analysis');
            setError('');

            const res = await getSurveyAiAnalysis(surveyId);
            setAiAnalysis(res.analysis);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze survey.');
            setCurrentView('surveys');
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading data..." />; // ✅ Layout removed

    return (
        <> {/* ✅ Using Fragment */}
            <div className="max-w-6xl mx-auto p-6">
                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

                {/* LEVEL 1: ALL SURVEYS */}
                {currentView === 'surveys' && (
                    <div className="animation-fade-in-up">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="font-headline text-4xl text-[#4A3728] font-bold leading-tight">Survey Results</h2>
                                <p className="text-[#5D534A] mt-2 text-[14px] leading-relaxed">Select a survey to view guest feedback or manage its status.</p>
                            </div>
                        </div>

                        <div className="bg-[#FDFBF7] rounded-[24px] shadow-[0_20px_40px_rgba(15,28,44,0.04)] border border-[#E3DCD2]/40 overflow-hidden mb-8">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F2EBE1] border-b border-[#E3DCD2]/50 text-[#8E735B] text-sm uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Survey Title</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Created</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E3DCD2]/40">
                                    {surveys.map((s) => (
                                        <tr key={s.id} className="hover:bg-[#F8F2EA] transition-colors">
                                            <td className="p-4 font-medium text-[#4A3728]">{s.title}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-[#EFE7DD] text-[#8E735B]'}`}>
                                                    {s.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[#5D534A]">
                                                {new Date(s.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleToggleStatus(s.id)}
                                                    className={`font-semibold text-sm px-4 py-2 rounded-xl transition-colors ${s.isActive
                                                        ? 'text-[#B22222] bg-[#FBEAEA] hover:bg-[#F7D9D9]'
                                                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                                        }`}
                                                >
                                                    {s.isActive ? 'Deactivate' : 'Activate'}
                                                </button>

                                                <button
                                                    onClick={() => handleAnalyzeSurvey(s.id, s.title)}
                                                    className="text-[#4A3728] hover:text-[#2C241E] font-semibold text-sm bg-[#F2EBE1] hover:bg-[#E8DFD1] px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1 border border-[#E3DCD2]"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] text-[#D35400]">auto_awesome</span>
                                                    Analyze with AI
                                                </button>

                                                <button
                                                    onClick={() => handleViewResponses(s.id)}
                                                    className="text-[#D35400] hover:text-[#BA4A00] font-semibold text-sm bg-[#F2EBE1] hover:bg-[#E8DFD1] px-4 py-2 rounded-xl transition-colors"
                                                >
                                                    Details
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteSurvey(s.id)}
                                                    className="text-[#B22222] hover:text-[#8B0000] font-semibold text-sm bg-[#FBEAEA] hover:bg-[#F7D9D9] px-4 py-2 rounded-xl transition-colors border border-[#F7D9D9]"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {surveys.length === 0 && (
                                        <tr><td colSpan="4" className="p-8 text-center text-[#8E735B]">No surveys created yet.</td></tr>
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
                                className="flex items-center text-[#8E735B] hover:text-[#4A3728] font-semibold mb-4 transition-colors"
                            >
                                <span className="material-symbols-outlined mr-1 text-sm">arrow_back</span> Back to Surveys
                            </button>
                            <h2 className="font-headline text-4xl text-[#4A3728] font-bold leading-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-4xl text-[#D35400]">auto_awesome</span>
                                AI Executive Analysis
                            </h2>
                            <p className="text-[#5D534A] mt-2 text-[14px]">Survey: {currentSurveyTitle}</p>
                        </div>

                        <div className="bg-[#FDFBF7] p-8 rounded-[24px] shadow-[0_20px_40px_rgba(15,28,44,0.06)] border border-[#E3DCD2]/50 min-h-[300px]">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                                    <div className="w-12 h-12 border-4 border-[#E3DCD2] border-t-[#D35400] rounded-full animate-spin"></div>
                                    <p className="text-[#D35400] font-bold animate-pulse">Aggregating data and generating insights...</p>
                                </div>
                            ) : (
                                <div className="prose max-w-none">
                                    <p className="whitespace-pre-wrap text-[#2C241E] leading-relaxed text-lg">
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
                        <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <button
                                    onClick={() => setCurrentView('surveys')}
                                    className="flex items-center text-[#8E735B] hover:text-[#4A3728] font-semibold mb-4 transition-colors"
                                >
                                    <span className="material-symbols-outlined mr-1 text-sm">arrow_back</span> Back to Surveys
                                </button>
                                <h2 className="font-headline text-4xl text-[#4A3728] font-bold leading-tight">{currentSurveyTitle}</h2>
                                <p className="text-[#5D534A] mt-2 text-[14px]">Showing all submitted responses for this survey.</p>
                            </div>

                            {currentSurveyAverage !== null && (
                                <div className="bg-white px-6 py-4 rounded-[20px] border border-amber-200 shadow-sm flex items-center gap-4 animate-fade-in-up">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#8E735B] uppercase tracking-widest mb-1">Average Score</p>
                                        <p className="text-3xl font-black text-[#4A3728]">{currentSurveyAverage} <span className="text-sm font-bold text-[#8E735B]">/ 5</span></p>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                                        <span className="material-symbols-outlined text-amber-500 text-3xl pb-1">star</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#FDFBF7] rounded-[24px] shadow-[0_20px_40px_rgba(15,28,44,0.04)] border border-[#E3DCD2]/40 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F2EBE1] border-b border-[#E3DCD2]/50 text-[#8E735B] text-sm uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Room Number</th>
                                        <th className="p-4 font-semibold">Submitted At</th>
                                        <th className="p-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E3DCD2]/40">
                                    {responses.map((r) => (
                                        <tr key={r.responseId} className="hover:bg-[#F8F2EA] transition-colors">
                                            <td className="p-4 font-bold text-[#D35400]">Room {r.roomNumber}</td>
                                            <td className="p-4 text-[#5D534A]">
                                                {new Date(r.submittedAt).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleViewAnswers(r.responseId)}
                                                    className="text-[#4A3728] hover:text-[#2C241E] font-semibold text-sm bg-[#F2EBE1] hover:bg-[#E8DFD1] px-4 py-2 rounded-xl transition-colors"
                                                >
                                                    View Answers
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {responses.length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-[#8E735B]">No responses yet for this survey.</td></tr>
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
                                className="flex items-center text-[#8E735B] hover:text-[#4A3728] font-semibold mb-4 transition-colors"
                            >
                                <span className="material-symbols-outlined mr-1 text-sm">arrow_back</span> Back to Responses
                            </button>
                            <h2 className="font-headline text-4xl text-[#4A3728] font-bold leading-tight">Room {answers.roomNumber} Feedback</h2>
                            <p className="text-[#5D534A] mt-2 text-[14px]">Submitted: {new Date(answers.submittedAt).toLocaleString()}</p>
                        </div>

                        <div className="space-y-4">
                            {answers.answers.map((a, index) => (
                                <div key={index} className="bg-[#FDFBF7] p-6 rounded-[20px] shadow-[0_14px_30px_rgba(15,28,44,0.03)] border border-[#E3DCD2]/40">
                                    <h4 className="font-semibold text-[#4A3728] mb-3">{a.questionText}</h4>

                                    {a.questionType === 'StarRating' ? (
                                        <div className="flex items-center text-yellow-400">
                                            <span className="font-bold text-2xl mr-2 text-[#2C241E]">{a.answerValue}/5</span>
                                            <span className="material-symbols-outlined">star</span>
                                        </div>
                                    ) : (
                                        <div className="bg-[#F2EBE1]/60 p-4 rounded-xl border border-[#E3DCD2]/40 text-[#2C241E] italic">
                                            "{a.answerValue}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminSurveyResultsPage;