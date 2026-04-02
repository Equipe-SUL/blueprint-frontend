import React from 'react';
import '../styles/app.css';

interface LogoProps {
  fontSize?: string;
  colorBluePart?: string;
  colorPrintPart?: string;
}

export default function Logo({ fontSize, colorBluePart = '#ffffff', colorPrintPart = '#3b82f6' }: LogoProps) {
  return (
    <span className="tipografia" style={{ fontSize, display: 'inline-block' }}>
      <span style={{ color: colorBluePart }}>blue</span>
      <span style={{ color: colorPrintPart }}>print</span>
    </span>
  );
}
