import { useState } from 'react';
import { submitSurvey } from '../api/surveys';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const SurveyModal = ({ survey, onComplete }) => {
    // Keep track of the guest's answers. Format: { questionId: "answerValue" }
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnswerChange = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value.toString()
        });
    };

    const handleSubmit = async () => {
        // Validation: Make sure they answered every question
        if (Object.keys(answers).length < survey.questions.length) {
            setError('Please answer all questions before submitting.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Format data exactly how C# expects it
            const submissionData = {
                surveyId: survey.id,
                answers: Object.entries(answers).map(([qId, val]) => ({
                    questionId: parseInt(qId),
                    value: val
                }))
            };

            await submitSurvey(submissionData);

            // Tell the dashboard the trap has been cleared!
            onComplete();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit survey. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C241E]/70 backdrop-blur-sm p-4">
            <div className="bg-[#FDFBF7] rounded-[28px] shadow-[0_35px_80px_rgba(15,28,44,0.24)] border border-[#E3DCD2]/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animation-fade-in-up">

                {/* Header */}
                <div className="bg-[#4A3728] p-6 text-white text-center sticky top-0 z-10">
                    <h2 className="font-headline text-3xl font-bold mb-1">{survey.title}</h2>
                    {survey.description && <p className="text-[#E8DFD1] text-sm">{survey.description}</p>}
                </div>

                {/* Questions Body */}
                <div className="p-6 md:p-8 space-y-8 flex-grow">
                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

                    {survey.questions.map((q, index) => (
                        <div key={q.id} className="bg-[#F2EBE1]/60 p-5 rounded-2xl border border-[#E3DCD2]/40">
                            <label className="block text-base font-semibold text-[#4A3728] mb-4">
                                <span className="text-[#D35400] mr-2">{index + 1}.</span>
                                {q.questionText}
                            </label>

                            {/* Render Star Rating */}
                            {q.questionType === 'StarRating' && (
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleAnswerChange(q.id, star)}
                                            className={`p-2 transition-transform hover:scale-110 focus:outline-none ${answers[q.id] >= star ? 'text-amber-400' : 'text-[#C9B8A5]'
                                                }`}
                                        >
                                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Render Yes/No */}
                            {q.questionType === 'YesNo' && (
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => handleAnswerChange(q.id, 'Yes')}
                                        className={`px-8 py-3 rounded-xl font-bold transition-colors ${answers[q.id] === 'Yes'
                                                ? 'bg-emerald-600 text-white shadow-md border-emerald-700'
                                                : 'bg-white text-[#5D534A] border border-[#D7CCBE] hover:bg-[#FDFBF7]'
                                            }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => handleAnswerChange(q.id, 'No')}
                                        className={`px-8 py-3 rounded-xl font-bold transition-colors ${answers[q.id] === 'No'
                                                ? 'bg-[#B22222] text-white shadow-md border-[#8F1B1B]'
                                                : 'bg-white text-[#5D534A] border border-[#D7CCBE] hover:bg-[#FDFBF7]'
                                            }`}
                                    >
                                        No
                                    </button>
                                </div>
                            )}

                            {/* Render Text Box */}
                            {q.questionType === 'Text' && (
                                <textarea
                                    rows="3"
                                    placeholder="Type your answer here..."
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="w-full px-4 py-3 border border-[#D7CCBE] rounded-xl bg-white text-[#2C241E] placeholder:text-[#8E735B] focus:ring-2 focus:ring-[#D35400]/20 focus:border-[#D35400] outline-none resize-none transition"
                                ></textarea>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer / Submit Button */}
                <div className="p-6 border-t border-[#E3DCD2]/50 bg-[#F2EBE1]/50 rounded-b-[28px] flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-sm transition-all ${loading ? 'bg-[#D9A57E] cursor-not-allowed' : 'bg-[#D35400] hover:bg-[#BA4A00] hover:shadow-md'
                            }`}
                    >
                        {loading ? 'Submitting...' : 'Submit Answers'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SurveyModal;