import React from 'react';

type HomeHeroProps = {
  title: React.ReactNode;
  subtitle: string;
};

export default function HomeHero({ title, subtitle }: HomeHeroProps) {
  return (
    <div className="header-section">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
