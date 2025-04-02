import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamsAPI, historyAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Teams() {
  const { isAuthenticated } = useAuth();
  const [players, setPlayers] = useState('');
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTeams(null);
    setError('');

    try {
      const playerList = players.split('\n').filter(player => player.trim());
      
      if (playerList.length < numTeams) {
        setError('Number of players must be greater than or equal to number of teams');
        setIsLoading(false);
        return;
      }

      const response = await teamsAPI.generate(playerList, numTeams);
      setTeams(response.data.teams);

      // Save to history if authenticated
      if (isAuthenticated) {
        try {
          await historyAPI.addHistory({
            action: 'teams_generated',
            details: {
              num_teams: numTeams,
              players_per_team: Math.floor(playerList.length / numTeams)
            }
          });
        } catch (error) {
          console.error('Failed to save to history:', error);
        }
      }
    } catch (error) {
      setError('Failed to generate teams. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Team Generator</h1>
        <p className="text-gray-600">Enter player names and generate random teams!</p>
      </motion.div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Players (one per line)
            </label>
            <textarea
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              className="input-field h-40 font-mono"
              placeholder="John Doe&#13;Jane Smith&#13;..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Teams
            </label>
            <input
              type="number"
              min="2"
              value={numTeams}
              onChange={(e) => setNumTeams(parseInt(e.target.value))}
              className="input-field"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className={`btn-primary w-full ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Teams...
              </div>
            ) : (
              'Generate Teams'
            )}
          </motion.button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {teams && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {teams.map((team, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
                  <i className="fas fa-users mr-2"></i>
                  Team {index + 1}
                </h3>
                <ul className="space-y-2">
                  {team.map((player, playerIndex) => (
                    <motion.li
                      key={playerIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * team.length + playerIndex) * 0.05 }}
                      className="text-gray-700 flex items-center"
                    >
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-sm text-blue-600">
                        {playerIndex + 1}
                      </span>
                      {player}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Teams;