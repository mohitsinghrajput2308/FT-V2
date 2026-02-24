import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const TrendLineChart = ({ data = [], dataKey = 'value', color = '#3b82f6', height = 300, currency = '$' }) => {
    const { isDark } = useTheme();

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No trend data available
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`px-3 py-2 rounded-lg shadow-lg border ${isDark ? 'bg-dark-200 border-dark-400 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm" style={{ color }}>
                        {currency}{payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#3d3d3d' : '#e5e7eb'}
                />
                <XAxis
                    dataKey="name"
                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                    axisLine={{ stroke: isDark ? '#4d4d4d' : '#d1d5db' }}
                />
                <YAxis
                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                    axisLine={{ stroke: isDark ? '#4d4d4d' : '#d1d5db' }}
                    tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={3}
                    dot={{ fill: color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default TrendLineChart;
