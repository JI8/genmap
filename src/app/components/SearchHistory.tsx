'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ExternalLink, ChevronDown, ChevronUp, Clock, Calendar, Globe } from 'lucide-react'
import { useEffect } from 'react'

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
  filter: string | null;
  locations: Location[];
}

interface SearchHistoryProps {
  searchHistory: SearchResult[];
  selectedLocation: Location | null;
  selectedQuery: string | null;
  lastClickedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  onQuerySelect: (query: string) => void;
}

function getGoogleMapsUrl(location: Location) {
  return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
}

function formatTimestamp(timestamp: number) {
  const now = new Date();
  const date = new Date(timestamp);
  
  if (now.toDateString() === date.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getRarityColor(rarity: number): string {
  if (rarity >= 90) return 'text-purple-600';
  if (rarity >= 70) return 'text-blue-600';
  if (rarity >= 50) return 'text-green-600';
  if (rarity >= 30) return 'text-yellow-600';
  return 'text-gray-600';
}

function getRarityLabel(rarity: number): string {
  if (rarity >= 90) return 'Hidden Gem';
  if (rarity >= 70) return 'Local Secret';
  if (rarity >= 50) return 'Off the Path';
  if (rarity >= 30) return 'Notable Spot';
  return 'Tourist Favorite';
}

export default function SearchHistory({
  searchHistory,
  selectedLocation,
  selectedQuery,
  lastClickedLocation,
  onLocationSelect,
  onQuerySelect,
}: SearchHistoryProps) {
  useEffect(() => {
    // This empty effect will cause a re-render when selectedLocation changes
  }, [selectedLocation]);

  // Group locations by country when a query is selected
  const groupedLocations = selectedQuery && searchHistory.find(result => result.query === selectedQuery)?.locations.reduce((acc, location) => {
    if (!acc[location.country]) {
      acc[location.country] = [];
    }
    acc[location.country].push(location);
    return acc;
  }, {} as Record<string, Location[]>);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {searchHistory.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            {/* Query Header */}
            <button
              onClick={() => onQuerySelect(result.query)}
              className={`w-full text-left p-4 transition-colors flex items-center justify-between ${
                selectedQuery === result.query
                  ? 'bg-blue-50 text-blue-800 border-b border-blue-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MapPin className={`w-5 h-5 ${selectedQuery === result.query ? 'text-blue-500' : 'text-gray-400'}`} />
                <div>
                  <h3 className="font-medium line-clamp-1">{result.query}</h3>
                  {result.filter && (
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <Globe className="w-3.5 h-3.5 mr-1" />
                      {result.filter}
                    </div>
                  )}
                </div>
              </div>
              {selectedQuery === result.query ? (
                <ChevronUp className="w-5 h-5 text-blue-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Location Results */}
            <AnimatePresence>
              {selectedQuery === result.query && groupedLocations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 divide-y divide-gray-100"
                >
                  {Object.entries(groupedLocations).map(([country, locations]) => (
                    <div key={country} className="divide-y divide-gray-100">
                      <div className="px-4 py-2 bg-gray-100/50 font-medium text-sm text-gray-600">
                        {country}
                      </div>
                      {locations.map((location, locIndex) => (
                        <motion.div
                          key={locIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: locIndex * 0.1 }}
                          className={`group transition-all ${
                            location === lastClickedLocation
                              ? 'bg-blue-50'
                              : location === selectedLocation
                              ? 'bg-gray-100'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => onLocationSelect(location)}
                          >
                            <div className="flex items-start">
                              <div className="text-4xl mr-3">{location.emoji}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900 truncate">{location.name}</h3>
                                  <a
                                    href={getGoogleMapsUrl(location)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {location.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  <span className={`px-2 py-1 bg-gray-100 rounded ${getRarityColor(location.rarity)}`}>
                                    {getRarityLabel(location.rarity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {searchHistory.length === 0 && (
        <div className="text-center py-12 px-4">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No searches yet</h3>
          <p className="text-gray-500">Try searching for places you'd like to visit</p>
        </div>
      )}
    </div>
  );
} 