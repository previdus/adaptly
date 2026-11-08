'use client';

import type { LearningDiagram } from '../lib/curriculum-types';
import './question-diagram.css';

function GridDiagram({ diagram }: { diagram: Extract<LearningDiagram, {kind: 'grid'}> }) {
  const minX = Math.min(-2, ...diagram.points.map(point => point.x - 2));
  const maxX = Math.max(2, ...diagram.points.map(point => point.x + 2), diagram.mirror?.axis === 'x' ? diagram.mirror.value + 2 : 0);
  const minY = Math.min(-2, ...diagram.points.map(point => point.y - 2));
  const maxY = Math.max(2, ...diagram.points.map(point => point.y + 2), diagram.mirror?.axis === 'y' ? diagram.mirror.value + 2 : 0);
  const scale = Math.min(236 / (maxX - minX), 118 / (maxY - minY));
  const left = 150 - (maxX - minX) * scale / 2;
  const bottom = 84 + (maxY - minY) * scale / 2;
  const px = (x: number) => left + (x - minX) * scale;
  const py = (y: number) => bottom - (y - minY) * scale;
  return <svg viewBox="0 0 300 168" role="img" aria-label={'Coordinate diagram: ' + diagram.points.map(point => `${point.label} (${point.x}, ${point.y})`).join('; ')}>
    <line x1="24" y1={py(0)} x2="280" y2={py(0)} stroke="currentColor"/>
    <line x1={px(0)} y1="14" x2={px(0)} y2="148" stroke="currentColor"/>
    <text x="282" y={py(0) - 4}>x</text><text x={px(0) + 5} y="15">y</text>
    <text x={px(0) - 12} y={py(0) + 13}>0</text>
    {diagram.mirror && (diagram.mirror.axis === 'x'
      ? <line x1={px(diagram.mirror.value)} y1="20" x2={px(diagram.mirror.value)} y2="145" stroke="#c56a24" strokeDasharray="5 4"/>
      : <line x1="28" y1={py(diagram.mirror.value)} x2="275" y2={py(diagram.mirror.value)} stroke="#c56a24" strokeDasharray="5 4"/>)}
    {diagram.points.map(point => <g key={point.label}>
      <line x1={px(point.x)} x2={px(point.x)} y1={py(0)} y2={py(point.y)} stroke="#b8a8d2" strokeDasharray="3 3"/>
      <line x1={px(0)} x2={px(point.x)} y1={py(point.y)} y2={py(point.y)} stroke="#b8a8d2" strokeDasharray="3 3"/>
      <circle cx={px(point.x)} cy={py(point.y)} r="4" fill="#7850b9"/>
      <text x={Math.min(225, px(point.x) + 6)} y={py(point.y) - 7}>{point.label} ({point.x}, {point.y})</text>
    </g>)}
  </svg>;
}

export default function QuestionDiagram({ diagram }: { diagram: LearningDiagram }) {
  let figure;
  if (diagram.kind === 'grid') figure = <GridDiagram diagram={diagram}/>;
  if (diagram.kind === 'line-graph') {
    const max = Math.max(...diagram.values);
    const x = (i: number) => 45 + i * 100;
    const y = (value: number) => 130 - value / max * 102;
    figure = <svg viewBox="0 0 300 168" role="img" aria-label={diagram.labels.map((label, i) => `${label}: ${diagram.values[i]}`).join(', ')}>
      <path d="M35 15 V130 H265" fill="none" stroke="currentColor"/>
      <text x="19" y="134">0</text>
      <polyline points={diagram.values.map((value, i) => `${x(i)},${y(value)}`).join(' ')} fill="none" stroke="#7850b9" strokeWidth="3"/>
      {diagram.values.map((value, i) => <g key={diagram.labels[i]}>
        <line x1={x(i)} x2={x(i)} y1={y(value)} y2="130" stroke="#c8badc" strokeDasharray="3 3"/>
        <circle cx={x(i)} cy={y(value)} r="4" fill="#7850b9"/>
        <text x={x(i)} y={y(value) - 8} textAnchor="middle">{value}</text>
        <text x={x(i)} y="150" textAnchor="middle">{diagram.labels[i]}</text>
      </g>)}
    </svg>;
  }
  if (diagram.kind === 'pie') {
    const angle = diagram.numerator / diagram.denominator * Math.PI * 2;
    const endX = 150 + Math.sin(angle) * 62;
    const endY = 82 - Math.cos(angle) * 62;
    figure = <svg viewBox="0 0 300 168" role="img" aria-label={`Selected share ${diagram.numerator} out of ${diagram.denominator}`}>
      <circle cx="150" cy="82" r="62" fill="#e6dcf4"/>
      <path d={`M150 82 L150 20 A62 62 0 ${angle > Math.PI ? 1 : 0} 1 ${endX} ${endY} Z`} fill="#8862c6" stroke="white" strokeWidth="2"/>
      <text x="150" y="162" textAnchor="middle">Purple share: {diagram.numerator}/{diagram.denominator}</text>
    </svg>;
  }
  if (diagram.kind === 'number-line') {
    const min = Math.min(0, ...diagram.values) - 3;
    const max = Math.max(0, ...diagram.values) + 3;
    const px = (value: number) => 24 + (value - min) / (max - min) * 252;
    const ticks = [...new Set([min + 1, 0, max - 1, ...diagram.values])].sort((a, b) => a - b);
    figure = <svg viewBox="0 0 300 100" role="img" aria-label={`Number line showing ${diagram.values.join(' and ')}`}>
      <path d="M18 50 H282 M18 50 L24 46 M18 50 L24 54 M282 50 L276 46 M282 50 L276 54" fill="none" stroke="currentColor"/>
      {ticks.map(value => <g key={value}><line x1={px(value)} x2={px(value)} y1="46" y2="54" stroke="currentColor"/><text x={px(value)} y="72" textAnchor="middle">{value}</text></g>)}
      {diagram.values.map(value => <circle key={value} cx={px(value)} cy="50" r="5" fill="#7850b9"/>)}
    </svg>;
  }
  if (diagram.kind === 'polygon') {
    const points = Array.from({length: diagram.sides}, (_, i) => {
      const angle = i * Math.PI * 2 / diagram.sides - Math.PI / 2;
      return `${150 + Math.cos(angle) * 65},${82 + Math.sin(angle) * 65}`;
    });
    figure = <svg viewBox="0 0 300 168" role="img" aria-label={`Regular polygon with ${diagram.sides} sides`}>
      <polygon points={points.join(' ')} fill="#eee5fa" stroke="#7850b9" strokeWidth="3"/>
    </svg>;
  }
  return <div className="question-diagram">{figure}</div>;
}
