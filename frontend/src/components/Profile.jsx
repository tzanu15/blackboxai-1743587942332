import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { historyAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { isAuthenticated, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await historyAPI.getHistory();
        setHistory(response.data);
      } catch (error) {
        setError('Failed to load history. Please try again later.');
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHistoryItem = (item) => {
    switch (item.action) {
      case 'wheel_spin':
        return (
          <motion.div
            className="flex items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-dharmachakra text-xl text-blue-600"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">
                Wheel Spin Result: <span className="text-blue-600">{item.details.result}</span>
              </p>
              <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
            </div>
          </motion.div>
        );

      case 'teams_generated':
        return (
          <motion.div
            className="flex items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-users text-xl text-green-600"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Teams Generated</p>
              <p className="text-sm text-gray-600">
                {item.details.num_teams} teams with {item.details.players_per_team} players each
              </p>
              <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <i className="fas fa-user text-2xl text-blue-600"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {user?.username}'s Profile
            </h2>
            <p className="text-gray-600">View your activity history</p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4"
          >
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {history.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 py-8"
                >
                  No activity history yet. Try spinning the wheel or generating teams!
                </motion.p>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {renderHistoryItem(item)}
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}

export default Profile;