'use client'

import { motion } from 'framer-motion'
import { Trophy, Map, Compass, Flag, Award } from 'lucide-react'

interface Location {
  name: string;
  country: string;
  emoji: string;
  description: string;
  rarity: number;
  latitude: number;
  longitude: number;
}

interface SearchResult {
  query: string;
  timestamp: number;
  locations: Location[];
}

interface ExplorerProfileProps {
  searchHistory: SearchResult[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  condition: (history: SearchResult[]) => boolean;
  points: number;
}

const achievements: Achievement[] = [
  {
    id: 'first_search',
    name: 'First Steps',
    description: 'Made your first location search',
    icon: <Compass className="w-6 h-6" />,
    condition: (history) => history.length >= 1,
    points: 50,
  },
  {
    id: 'hidden_gem',
    name: 'Hidden Gem Hunter',
    description: 'Found a location with 90+ rarity',
    icon: <Trophy className="w-6 h-6" />,
    condition: (history) => history.some(result => 
      result.locations.some(loc => loc.rarity >= 90)
    ),
    points: 100,
  },
  {
    id: 'explorer',
    name: 'World Explorer',
    description: 'Discovered locations in 3+ different countries',
    icon: <Map className="w-6 h-6" />,
    condition: (history) => {
      const countries = new Set(
        history.flatMap(result => 
          result.locations.map(loc => loc.country)
        )
      );
      return countries.size >= 3;
    },
    points: 150,
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    description: 'Made 5+ different searches',
    icon: <Flag className="w-6 h-6" />,
    condition: (history) => history.length >= 5,
    points: 200,
  },
];

function calculateTotalPoints(history: SearchResult[]): number {
  // Points from locations
  const locationPoints = history.reduce((total, result) => 
    total + result.locations.reduce((sum, loc) => 
      sum + Math.round(loc.rarity * 1.5), 0
    ), 0
  );

  // Points from achievements
  const achievementPoints = achievements
    .filter(a => a.condition(history))
    .reduce((sum, a) => sum + a.points, 0);

  return locationPoints + achievementPoints;
}

function getExplorerRank(points: number): string {
  if (points >= 1000) return '🎖️ Master Explorer';
  if (points >= 500) return '🌟 Seasoned Traveler';
  if (points >= 250) return '🧭 Adventurer';
  if (points >= 100) return '🌱 Wanderer';
  return '🌍 Novice Explorer';
}

export default function ExplorerProfile({ searchHistory }: ExplorerProfileProps) {
  const totalPoints = calculateTotalPoints(searchHistory);
  const rank = getExplorerRank(totalPoints);
  const unlockedAchievements = achievements.filter(a => a.condition(searchHistory));
  const nextAchievements = achievements.filter(a => !a.condition(searchHistory));

  return (
    <div className="p-4 space-y-6">
      {/* Explorer Stats */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{rank}</h2>
        <div className="text-4xl font-bold text-blue-600 mb-1">
          {totalPoints}
        </div>
        <div className="text-sm text-gray-500">Explorer Points</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {searchHistory.length}
          </div>
          <div className="text-sm text-gray-600">Searches</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {searchHistory.reduce((sum, result) => sum + result.locations.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Places Found</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Achievements
        </h3>
        
        <div className="space-y-3">
          {/* Unlocked Achievements */}
          {unlockedAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 rounded-lg p-3 flex items-center gap-3"
            >
              <div className="text-green-600">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{achievement.name}</div>
                <div className="text-sm text-gray-600">{achievement.description}</div>
              </div>
              <div className="text-green-600 font-medium">+{achievement.points}</div>
            </motion.div>
          ))}

          {/* Locked Achievements */}
          {nextAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 opacity-60"
            >
              <div className="text-gray-400">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{achievement.name}</div>
                <div className="text-sm text-gray-600">{achievement.description}</div>
              </div>
              <div className="text-gray-400 font-medium">+{achievement.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 