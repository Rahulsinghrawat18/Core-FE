import { useState } from "react";

const TiltButton = ({ handleCreateRoom }: { handleCreateRoom: () => void }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / width * 20; // Adjust tilt intensity
    const y = (e.clientY - top - height / 2) / height * 20;
    setRotateX(y);
    setRotateY(x);
  };

  const resetTilt = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <button
      className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 
      hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 
      dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg 
      dark:shadow-purple-800/80 font-medium rounded-lg text-2xl px-6 py-2.5 text-center 
      me-2 mb-2 transition-all duration-200 ease-in-out transform-gpu scale-100"
      style={{
        transform: `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      onClick={handleCreateRoom}
    >
      Create a Room
    </button>
  );
};

export default TiltButton;
