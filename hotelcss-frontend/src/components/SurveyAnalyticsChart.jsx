import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getQuestionTrends } from '../api/surveys';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const SurveyAnalyticsChart = ({ surveyId }) => {
    const { translateUiText } = useLanguage();
    const [chartData, setChartData] = useState([]);
    const [questionLines, setQuestionLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // A beautiful color palette for your different lines
    const lineColors = ['#D35400', '#4A3728', '#8E735B', '#2A9D8F', '#E67E22', '#2C3E50'];

    useEffect(() => {
        const fetchTrends = async () => {
            if (!surveyId) return;

            try {
                setLoading(true);
                const res = await getQuestionTrends(surveyId);

                // 👇 THIS IS OUR ULTIMATE DEBUGGER 
                console.log("API RESPONSE: ", res);

                if (res.success && res.data.length > 0) {
                    const rawData = res.data;

                    // 1. FLATTEN & TRANSLATE THE DATA
                    // Recharts needs a flat object: { period: "...", "Cleanliness": 4.5, "Speed": 3.8 }
                    const formattedData = rawData.map(item => {
                        const dataPoint = { period: item.period }; // The X-Axis label

                        // Loop through the dictionary C# sent us
                        Object.entries(item.questionAverages).forEach(([questionText, score]) => {
                            // Translate the question text right here!
                            const translatedQuestion = translateUiText(questionText);
                            dataPoint[translatedQuestion] = score;
                        });

                        return dataPoint;
                    });

                    setChartData(formattedData);

                    // 2. EXTRACT THE KEYS FOR THE LINES
                    // Look at the first bucket, grab all the keys, and filter out 'period'
                    if (formattedData.length > 0) {
                        const keys = Object.keys(formattedData[0]).filter(key => key !== 'period');
                        setQuestionLines(keys);
                    }
                } else {
                    setChartData([]);
                }
            } catch (err) {
                console.error("Error fetching survey trends:", err);
                setError(translateUiText('Failed to load survey analytics.'));
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [surveyId, translateUiText]); // Re-run if language changes!

    if (loading) return <LoadingSpinner text={translateUiText('Loading analytics...')} />;
    if (error) return <ErrorMessage message={error} />;
    if (chartData.length === 0) return <p className="text-[#8E735B] italic">{translateUiText('Not enough data to display trends yet.')}</p>;

    return (
        <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[24px] border border-[#E3DCD2]/40 shadow-[0_10px_30px_rgba(15,28,44,0.03)] w-full">
            <h3 className="font-headline text-xl text-[#4A3728] font-bold mb-6">
                {translateUiText('Question Performance Trends')}
            </h3>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3DCD2" />

                        {/* The X-Axis uses the 'period' string ("21/05/2026 - 28/05/2026") */}
                        <XAxis
                            dataKey="period"
                            tick={{ fill: '#8E735B', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />

                        {/* The Y-Axis is locked between 0 and 5 stars */}
                        <YAxis
                            domain={[0, 5]}
                            tick={{ fill: '#8E735B', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickCount={6}
                        />

                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: '1px solid #E3DCD2', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />

                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {/* 3. DYNAMICALLY DRAW THE LINES */}
                        {questionLines.map((questionTitle, index) => (
                            <Line
                                key={questionTitle}
                                type="monotone"
                                dataKey={questionTitle}
                                name={questionTitle}
                                stroke={lineColors[index % lineColors.length]}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#FDFBF7' }}
                                activeDot={{ r: 7, strokeWidth: 0 }}
                                connectNulls={true}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SurveyAnalyticsChart;