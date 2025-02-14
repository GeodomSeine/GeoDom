import React, { useState } from "react";
import './DecadeRangeComponent.scss';

type DecadeRangeProps = {
  min: number;
  max: number;
  onChange: (value: number[]) => void;
  leftLabel: string;
  rightLabel: string;
};

const DecadeRangeComponent: React.FC<DecadeRangeProps> = ({ min, max, onChange, leftLabel, rightLabel }) => {
  const [begin, setBegin] = useState<number>(min);
  const [end, setEnd] = useState<number>(max);

  const handleBeginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(min, Math.min(Number(e.target.value), end));
    setBegin(value);
    onChange([value, end]);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(max, Math.max(Number(e.target.value), begin));
    setEnd(value);
    onChange([begin, value]);
  };

  return (
    <div className="range_container">
      <div className="range_text">
        <label>{leftLabel}</label>
        <input
          type="number"
          value={begin}
          min={min}
          max={max}
          onChange={handleBeginChange}
        />
        <span> - </span>
        <input
          type="number"
          value={end}
          min={min}
          max={max}
          onChange={handleEndChange}
        />
        <label>{rightLabel}</label>
      </div>
    </div>
  );
};

export default DecadeRangeComponent;
