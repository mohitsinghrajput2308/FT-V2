import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const IncomeExpenseChart = ({ data = [], height = 300, currency = '$' }) => {
    const { isDark } = useTheme();

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No data available
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`px-3 py-2 rounded-lg shadow-lg border ${isDark ? 'bg-dark-200 border-dark-400 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <p className="font-medium mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {currency}{entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#3d3d3d' : '#e5e7eb'}
                />
                <XAxis
                    dataKey="month"
                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                    axisLine={{ stroke: isDark ? '#4d4d4d' : '#d1d5db' }}
                />
                <YAxis
                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                    axisLine={{ stroke: isDark ? '#4d4d4d' : '#d1d5db' }}
                    tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    formatter={(value) => (
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{value}</span>
                    )}
                />
                <Bar
                    dataKey="income"
                    name="Income"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default IncomeExpenseChart;
