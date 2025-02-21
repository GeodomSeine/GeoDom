import React, { useState, useEffect } from "react";
import './DecadeRangeComponent.scss';

type DecadeRangeProps = {
  min: number;
  max: number;
  value: number[]; // Ajoutez cette ligne pour accepter la prop value
  onChange: (value: number[]) => void;
  leftLabel: string;
  rightLabel: string;
};

const DecadeRangeComponent: React.FC<DecadeRangeProps> = ({ min, max, value, onChange, leftLabel, rightLabel }) => {
  const [begin, setBegin] = useState<number>(value[0]);
  const [end, setEnd] = useState<number>(value[1]);

  useEffect(() => {
    setBegin(value[0]);
    setEnd(value[1]);
  }, [value]);

  const handleBeginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(min, Math.min(Number(e.target.value), end));
    setBegin(newValue);
    onChange([newValue, end]);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(max, Math.max(Number(e.target.value), begin));
    setEnd(newValue);
    onChange([begin, newValue]);
  };

  return (
    <div className="range_container">
        <div>{leftLabel}</div>
        <input
          type="number"
          value={begin}
          min={min}
          max={max}
          onChange={handleBeginChange}
          onFocus={(e) => e.target.select()}
          onMouseUp={(e) => { e.preventDefault(); return false; }}
        />
        <span> - </span>
        <input
          type="number"
          value={end}
          min={min}
          max={max}
          onChange={handleEndChange}
          onFocus={(e) => e.target.select()}
          onMouseUp={(e) => { e.preventDefault(); return false; }}
        />
        <div>{rightLabel}</div>
    </div>
  );
};

export default DecadeRangeComponent;
