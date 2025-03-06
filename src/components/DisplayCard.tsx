import { motion } from "framer-motion";
import React from "react";

interface DisplayCardProps {
  image: string;
  title: string;
}

const DisplayCard: React.FC<DisplayCardProps> = ({ image, title }) => {
  return (
    <motion.div
      className="relative group perspective-1000"
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className="bg-gradient-to-b from-blue-300 to-blue-800 border border-blue-400 
        shadow-lg hover:shadow-2xl hover:shadow-blue-500/[0.2] 
        rounded-xl p-3 transition-all w-auto sm:w-[22rem] h-96 flex flex-col justify-between"
        whileHover={{
          rotateX: 10,
          rotateY: 10,
          boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.3)",
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Image Section */}
        <motion.div 
          className="relative rounded-xl w-full h-72 flex items-center justify-center overflow-hidden" // Centers the image properly
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={image}
            className="w-full h-full object-contain rounded-xl" // Full image visible
            alt={title}
          />
        </motion.div>

        {/* Title Section */}
        <motion.div 
          className="bg-black/40 backdrop-blur-md text-white text-center py-2 rounded-b-xl"
          whileHover={{ translateZ: 50 }}
        >
          <h3 className="font-medieval text-xl font-semibold">{title}</h3>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DisplayCard;
