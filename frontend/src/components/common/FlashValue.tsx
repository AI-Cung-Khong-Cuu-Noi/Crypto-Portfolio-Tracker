import React, { useEffect, useState, useRef } from 'react';

interface FlashValueProps {
  value: number | string | null | undefined;
  children: React.ReactNode;
  className?: string;
}

export function FlashValue({ value, children, className = "" }: FlashValueProps) {
  const [flashClass, setFlashClass] = useState("");
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== undefined && value !== prevValue.current) {
      const isIncrease = Number(value) > Number(prevValue.current);
      const isDecrease = Number(value) < Number(prevValue.current);

      if (isIncrease) {
        setFlashClass("animate-flash-green");
      } else if (isDecrease) {
        setFlashClass("animate-flash-red");
      }

      const timer = setTimeout(() => setFlashClass(""), 700);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={`${className} ${flashClass} transition-colors duration-700 rounded px-1 -mx-1`}>
      {children}
    </span>
  );
}
