import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Distinct colors for each question's line.
const COLORS = ['#D35400', '#2E86C1', '#27AE60', '#8E44AD', '#C0392B', '#16A085', '#F39C12', '#34495E', '#E67E22', '#2980B9'];

// questions: [{ id, key, text }]  weeks: [{ label, q{id}: avg, responseCount, ... }]
const SurveyAnalyticsChart = ({ questions = [], weeks = [] }) => {
    if (!weeks || weeks.length === 0) {
        return (
            <p className="text-center text-[#8E735B] py-12">
                Henüz veri yok. Survey'i her hafta aktif edip kapattıkça grafik hafta hafta dolacaktır.
            </p>
        );
    }

    return (
        <div style={{ width: '100%', height: 440 }}>
            <ResponsiveContainer>
                <LineChart data={weeks} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3DCD2" />
                    <XAxis dataKey="label" tick={{ fill: '#5D534A', fontSize: 12 }} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fill: '#5D534A', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #E3DCD2', background: '#FDFBF7' }}
                        formatter={(value) => (value == null ? '—' : `${value} / 5`)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {questions.map((q, i) => (
                        <Line
                            key={q.key}
                            type="monotone"
                            dataKey={q.key}
                            name={q.text}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            connectNulls
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SurveyAnalyticsChart;
