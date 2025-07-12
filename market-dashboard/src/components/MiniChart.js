import React from 'react';

const MiniChart = ({ data, color = '#2ecc71', height = 32 }) => {
  // Simple SVG bar chart
  const max = Math.max(...data, 1);
  const width = 60;
  const barWidth = width / data.length;
  return (
    <svg width={width} height={height} style={{ verticalAlign: 'middle' }}>
      {data.map((v, i) => (
        <rect
          key={i}
          x={i * barWidth + 2}
          y={height - (v / max) * (height - 6) - 2}
          width={barWidth - 4}
          height={(v / max) * (height - 6)}
          fill={color}
          rx={2}
        />
      ))}
    </svg>
  );
};

export default MiniChart;
