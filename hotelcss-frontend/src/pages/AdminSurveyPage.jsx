import { useState } from 'react';
import Layout from '../components/Layout';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { createSurvey } from '../api/surveys';

const AdminSurveyPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [questions, setQuestions] = useState([
        { questionText: '', questionType: 'StarRating' }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', questionType: 'StarRating' }]);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Survey title is required.');
            return;
        }

        const invalidQuestions = questions.some(q => !q.questionText.trim());
        if (invalidQuestions || questions.length === 0) {
            setError('All questions must have text, and you need at least one question.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Format data to match our C# DTO exactly
            const surveyData = {
                title,
                description,
                isActive,
                questions: questions.map((q, index) => ({
                    questionText: q.questionText,
                    questionType: q.questionType,
                    orderIndex: index + 1 // Keep them in order!
                }))
            };

            await createSurvey(surveyData);

            setSuccess('Survey successfully created and published!');
            setTitle('');
            setDescription('');
            setQuestions([{ questionText: '', questionType: 'StarRating' }]);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create survey.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Survey Creator</h2>
                <p className="text-gray-600 mt-1">
                    Design a new survey. If you set it to Active, it will replace any currently running survey and appear on all guest dashboards.
                </p>
            </div>

            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
            {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit}>
                    {/* Survey Details Section */}
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Survey Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Mid-Stay Satisfaction Survey"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Please let us know how we are doing!"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center mt-4">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm font-bold text-gray-900">
                                Publish Immediately (Make Active)
                            </label>
                        </div>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    {/* Dynamic Questions Section */}
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Questions</h3>
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold text-sm transition"
                        >
                            + Add Question
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        {questions.map((q, index) => (
                            <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-grow">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Question {index + 1} Text
                                    </label>
                                    <input
                                        type="text"
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                                        placeholder="e.g., How clean was your room?"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="w-48">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Answer Type
                                    </label>
                                    <select
                                        value={q.questionType}
                                        onChange={(e) => handleQuestionChange(index, 'questionType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="StarRating">5-Star Rating</option>
                                        <option value="Text">Text Box</option>
                                        <option value="YesNo">Yes / No</option>
                                    </select>
                                </div>
                                {questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(index)}
                                        className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="Remove Question"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 rounded-xl font-bold text-white shadow-sm transition-all ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                                }`}
                        >
                            {loading ? 'Publishing...' : 'Save & Publish Survey'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default AdminSurveyPage;