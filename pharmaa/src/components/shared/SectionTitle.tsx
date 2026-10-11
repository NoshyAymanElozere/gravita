import React from 'react';

interface SectionTitleProps {
  subtitle: string;
  title: string;
  description?: string;
}

export default function SectionTitle({ subtitle, title, description }: SectionTitleProps) {
  return (
    <div className="text-center space-y-3">
      <span className="text-[10px] tracking-[0.3em] font-semibold text-brand-sage-muted uppercase block">
        {subtitle}
      </span>
      <div className="inline-block relative pb-4">
        <h2 className="font-serif text-3xl font-bold text-brand-primary tracking-tight">
          {title}
        </h2>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-28">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
          <div className="absolute w-1.5 h-1.5 rotate-45 bg-brand-secondary border border-brand-primary/20 shadow-3xs" />
        </div>
      </div>
      {description && (
        <p className="text-sm text-zinc-650 font-sans max-w-lg mx-auto pt-1.5">
          {description}
        </p>
      )}
    </div>
  );
}
