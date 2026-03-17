'use client';

import { useState, useEffect } from 'react';
import type { CountdownBlock } from '@lp/shared';

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function getTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownRenderer({ block }: { block: CountdownBlock }) {
  const { props } = block;
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(props.targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(props.targetDate)), 1000);
    return () => clearInterval(id);
  }, [props.targetDate]);

  if (!timeLeft) {
    return (
      <div className="py-12 px-6 text-center" style={{ backgroundColor: block.styles.backgroundColor }}>
        <p className="text-lg font-semibold text-gray-600">{props.expiredMessage || 'This offer has expired.'}</p>
      </div>
    );
  }

  const units = [
    { show: props.showDays !== false, label: 'Days', value: timeLeft.days },
    { show: props.showHours !== false, label: 'Hours', value: timeLeft.hours },
    { show: props.showMinutes !== false, label: 'Minutes', value: timeLeft.minutes },
    { show: props.showSeconds !== false, label: 'Seconds', value: timeLeft.seconds },
  ].filter((u) => u.show);

  return (
    <div className="py-16 px-6 text-center" style={{ backgroundColor: block.styles.backgroundColor }}>
      <div className="mx-auto max-w-2xl">
        {props.heading && <h2 className="text-3xl font-bold text-gray-900 mb-8">{props.heading}</h2>}
        <div className="flex justify-center gap-4">
          {units.map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div className="rounded-xl bg-gray-900 text-white font-mono text-4xl font-bold px-5 py-4 min-w-20 text-center">
                {String(unit.value).padStart(2, '0')}
              </div>
              <span className="text-xs font-medium text-gray-500 mt-2 uppercase tracking-wider">{unit.label}</span>
            </div>
          ))}
        </div>
        {props.ctaLabel && (
          <a href={props.ctaHref || '#'} className="btn-primary mt-8 text-base px-8 py-3">
            {props.ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
}
