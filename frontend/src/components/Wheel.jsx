import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { wheelAPI, historyAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Wheel() {
  const { isAuthenticated } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const spinWheel = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setError('');

    try {
      const response = await wheelAPI.spin();
      
      // Simulate spinning animation before showing result
      setTimeout(async () => {
        setResult(response.data.result);
        setIsSpinning(false);

        // Save to history if authenticated
        if (isAuthenticated) {
          try {
            await historyAPI.addHistory({
              action: 'wheel_spin',
              details: { result: response.data.result }
            });
          } catch (error) {
            console.error('Failed to save to history:', error);
          }
        }
      }, 2000);
    } catch (error) {
      setError('Failed to spin the wheel. Please try again.');
      setIsSpinning(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Spin the Wheel</h1>
        <p className="text-gray-600">Click the wheel to get a random number!</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 w-full max-w-md"
        >
          {error}
        </motion.div>
      )}

      <div className="relative w-64 h-64 mb-8">
        <motion.div
          className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg cursor-pointer"
          animate={{
            rotate: isSpinning ? 360 * 5 : 0,
            scale: isSpinning ? 1.05 : 1
          }}
          transition={{
            duration: isSpinning ? 2 : 0.3,
            ease: isSpinning ? "easeOut" : "spring",
          }}
          whileHover={!isSpinning ? { scale: 1.05 } : {}}
          whileTap={!isSpinning ? { scale: 0.95 } : {}}
          onClick={spinWheel}
        >
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <AnimatePresence mode="wait">
              {result !== null ? (
                <motion.span
                  key="result"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="text-4xl font-bold text-blue-600"
                >
                  {result}
                </motion.span>
              ) : (
                <motion.span
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl text-gray-400"
                >
                  {isSpinning ? 'Spinning...' : 'Click to Spin!'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Pointer triangle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
          <motion.div
            animate={{ y: isSpinning ? [0, -5, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="w-4 h-8 bg-red-500"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
        </div>
      </div>

      <motion.button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`btn-primary text-lg ${
          isSpinning ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        whileHover={!isSpinning ? { scale: 1.05 } : {}}
        whileTap={!isSpinning ? { scale: 0.95 } : {}}
      >
        {isSpinning ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Spinning...
          </div>
        ) : (
          'Spin the Wheel!'
        )}
      </motion.button>
    </div>
  );
}

export default Wheel;