import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const ExpensePieChart = ({ data = [], height = 300, currency = '$' }) => {
    const { isDark } = useTheme();

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No expense data available
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`px-3 py-2 rounded-lg shadow-lg border ${isDark ? 'bg-dark-200 border-dark-400 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="text-sm">{currency}{payload[0].value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{((payload[0].value / data.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => (
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ExpensePieChart;
