import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ScoreChart({ keywordScore, semanticScore }) {
  const data = [
    {
      name: 'Keyword Match',
      score: keywordScore,
      description: 'Specific word matches'
    },
    {
      name: 'Context Match',
      score: semanticScore,
      description: 'Meaning similarity'
    }
  ];

  // Custom tooltip with glassmorphism styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-indigo-300 text-2xl font-bold mb-2">{data.score}%</p>
          <p className="text-white/70 text-xs">
            {data.name === 'Keyword Match' 
              ? 'How many specific words matched between resume and job description'
              : 'How well the overall meaning and context matches using AI'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Define colors for each bar
  const COLORS = ['#6366f1', '#ec4899']; // Indigo for Keyword, Pink for Semantic

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar 
            dataKey="score" 
            radius={[8, 8, 0, 0]}
            maxBarSize={80}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index]}
                opacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreChart;
