import React from 'react';

const MiniPieChart = ({ percent, color = '#2ecc71', size = 28, stroke = 5 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);
  return (
    <svg width={size} height={size} style={{ verticalAlign: 'middle' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e6f4ea"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default MiniPieChart;
