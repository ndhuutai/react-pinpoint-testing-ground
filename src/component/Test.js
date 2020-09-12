import React, { useState } from "react";

const Test = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div style={{ backgroundColor: "white" }}>
      my count: {count}
      <button onClick={handleClick}>increment</button>
    </div>
  );
};

export default Test;
