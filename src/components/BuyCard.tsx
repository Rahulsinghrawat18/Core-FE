import { motion } from "framer-motion";
import React from "react";

interface BuyCardProps {
  image: string;
  title: string;
  onAction: () => void;
  buttonText: string;
}

const BuyCard: React.FC<BuyCardProps> = ({ image, title, onAction, buttonText }) => {
  return (
    <motion.div
      className="relative group perspective-1000"
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className="bg-gradient-to-b from-blue-300 to-blue-700 border border-blue-400 
        shadow-lg hover:shadow-2xl hover:shadow-blue-500/[0.2] 
        rounded-xl p-4 transition-all w-auto sm:w-[22rem] h-[28rem] flex flex-col justify-between"
        whileHover={{
          rotateX: 10,
          rotateY: 10,
          boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.3)",
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Image Section - Increased Height */}
        <motion.div 
          className="relative rounded-xl w-full h-[100%] flex items-center justify-center overflow-hidden" 
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={image}
            className="w-full h-full object-contain rounded-xl" // Ensures full image visibility
            alt={title}
          />
        </motion.div>

        {/* Title Section - Smaller */}
        <motion.h3 
          className="merienda-regular text-white text-center text-lg font-semibold mt-2"
          whileHover={{ translateZ: 50 }}
        >
          {title}
        </motion.h3>

        {/* Button Section - Smaller & Compact */}
        <motion.button
          onClick={onAction}
          className="merienda-regular bg-gray-900 text-white py-2 px-4 rounded-lg 
          hover:bg-gray-700 transition-all w-full text-base mt-2"
          whileHover={{ scale: 1.1 }}
        >
          {buttonText}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BuyCard;
