import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const PortfolioChart = ({ data = [], height = 300, currency = '$' }) => {
    const { isDark } = useTheme();

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No investment data available
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const total = data.reduce((a, b) => a + b.value, 0);
            return (
                <div className={`px-3 py-2 rounded-lg shadow-lg border ${isDark ? 'bg-dark-200 border-dark-400 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="text-sm">{currency}{payload[0].value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                        {((payload[0].value / total) * 100).toFixed(1)}% of portfolio
                    </p>
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
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke={isDark ? '#1e1e1e' : '#ffffff'}
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    formatter={(value) => (
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PortfolioChart;
