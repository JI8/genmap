'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import SearchHistory from './components/SearchHistory'
import ExplorerProfile from './components/ExplorerProfile'
import { Search, MapPin, User, X, Info, Globe, Sparkles } from 'lucide-react'
import { Button } from './components/ui/Button'
import { Input } from './components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'

// Import Map component dynamically with no SSR
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  )
})

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

interface CountryOption {
  name: string;
  code: string; // ISO 3166-1 alpha-2 code
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [lastClickedLocation, setLastClickedLocation] = useState<Location | null>(null)
  const [key, setKey] = useState(0)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [showCountryFilter, setShowCountryFilter] = useState(false)
  const [countryFocus, setCountryFocus] = useState<string>('')
  const [showRandomIdea, setShowRandomIdea] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const countryInputRef = useRef<HTMLDivElement>(null)
  const [currentSuggestion, setCurrentSuggestion] = useState<string>('');

  // Reset map on unmount
  useEffect(() => {
    return () => {
      setKey(prev => prev + 1)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryInputRef.current && !countryInputRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // List of countries with their codes
  const countries: CountryOption[] = [
    { name: "Afghanistan", code: "AF" },
    { name: "Albania", code: "AL" },
    { name: "Algeria", code: "DZ" },
    { name: "Andorra", code: "AD" },
    { name: "Angola", code: "AO" },
    { name: "Antigua and Barbuda", code: "AG" },
    { name: "Argentina", code: "AR" },
    { name: "Armenia", code: "AM" },
    { name: "Australia", code: "AU" },
    { name: "Austria", code: "AT" },
    { name: "Azerbaijan", code: "AZ" },
    { name: "Bahamas", code: "BS" },
    { name: "Bahrain", code: "BH" },
    { name: "Bangladesh", code: "BD" },
    { name: "Barbados", code: "BB" },
    { name: "Belarus", code: "BY" },
    { name: "Belgium", code: "BE" },
    { name: "Belize", code: "BZ" },
    { name: "Benin", code: "BJ" },
    { name: "Bhutan", code: "BT" },
    { name: "Bolivia", code: "BO" },
    { name: "Bosnia and Herzegovina", code: "BA" },
    { name: "Botswana", code: "BW" },
    { name: "Brazil", code: "BR" },
    { name: "Brunei", code: "BN" },
    { name: "Bulgaria", code: "BG" },
    { name: "Burkina Faso", code: "BF" },
    { name: "Burundi", code: "BI" },
    { name: "Cambodia", code: "KH" },
    { name: "Cameroon", code: "CM" },
    { name: "Canada", code: "CA" },
    { name: "Cape Verde", code: "CV" },
    { name: "Central African Republic", code: "CF" },
    { name: "Chad", code: "TD" },
    { name: "Chile", code: "CL" },
    { name: "China", code: "CN" },
    { name: "Colombia", code: "CO" },
    { name: "Comoros", code: "KM" },
    { name: "Congo", code: "CG" },
    { name: "Costa Rica", code: "CR" },
    { name: "Croatia", code: "HR" },
    { name: "Cuba", code: "CU" },
    { name: "Cyprus", code: "CY" },
    { name: "Czech Republic", code: "CZ" },
    { name: "Denmark", code: "DK" },
    { name: "Djibouti", code: "DJ" },
    { name: "Dominica", code: "DM" },
    { name: "Dominican Republic", code: "DO" },
    { name: "East Timor", code: "TL" },
    { name: "Ecuador", code: "EC" },
    { name: "Egypt", code: "EG" },
    { name: "El Salvador", code: "SV" },
    { name: "Equatorial Guinea", code: "GQ" },
    { name: "Eritrea", code: "ER" },
    { name: "Estonia", code: "EE" },
    { name: "Ethiopia", code: "ET" },
    { name: "Fiji", code: "FJ" },
    { name: "Finland", code: "FI" },
    { name: "France", code: "FR" },
    { name: "Gabon", code: "GA" },
    { name: "Gambia", code: "GM" },
    { name: "Georgia", code: "GE" },
    { name: "Germany", code: "DE" },
    { name: "Ghana", code: "GH" },
    { name: "Greece", code: "GR" },
    { name: "Grenada", code: "GD" },
    { name: "Guatemala", code: "GT" },
    { name: "Guinea", code: "GN" },
    { name: "Guinea-Bissau", code: "GW" },
    { name: "Guyana", code: "GY" },
    { name: "Haiti", code: "HT" },
    { name: "Honduras", code: "HN" },
    { name: "Hungary", code: "HU" },
    { name: "Iceland", code: "IS" },
    { name: "India", code: "IN" },
    { name: "Indonesia", code: "ID" },
    { name: "Iran", code: "IR" },
    { name: "Iraq", code: "IQ" },
    { name: "Ireland", code: "IE" },
    { name: "Israel", code: "IL" },
    { name: "Italy", code: "IT" },
    { name: "Jamaica", code: "JM" },
    { name: "Japan", code: "JP" },
    { name: "Jordan", code: "JO" },
    { name: "Kazakhstan", code: "KZ" },
    { name: "Kenya", code: "KE" },
    { name: "Kiribati", code: "KI" },
    { name: "North Korea", code: "KP" },
    { name: "South Korea", code: "KR" },
    { name: "Kuwait", code: "KW" },
    { name: "Kyrgyzstan", code: "KG" },
    { name: "Laos", code: "LA" },
    { name: "Latvia", code: "LV" },
    { name: "Lebanon", code: "LB" },
    { name: "Lesotho", code: "LS" },
    { name: "Liberia", code: "LR" },
    { name: "Libya", code: "LY" },
    { name: "Liechtenstein", code: "LI" },
    { name: "Lithuania", code: "LT" },
    { name: "Luxembourg", code: "LU" },
    { name: "Madagascar", code: "MG" },
    { name: "Malawi", code: "MW" },
    { name: "Malaysia", code: "MY" },
    { name: "Maldives", code: "MV" },
    { name: "Mali", code: "ML" },
    { name: "Malta", code: "MT" },
    { name: "Marshall Islands", code: "MH" },
    { name: "Mauritania", code: "MR" },
    { name: "Mauritius", code: "MU" },
    { name: "Mexico", code: "MX" },
    { name: "Micronesia", code: "FM" },
    { name: "Moldova", code: "MD" },
    { name: "Monaco", code: "MC" },
    { name: "Mongolia", code: "MN" },
    { name: "Montenegro", code: "ME" },
    { name: "Morocco", code: "MA" },
    { name: "Mozambique", code: "MZ" },
    { name: "Myanmar", code: "MM" },
    { name: "Namibia", code: "NA" },
    { name: "Nauru", code: "NR" },
    { name: "Nepal", code: "NP" },
    { name: "Netherlands", code: "NL" },
    { name: "New Zealand", code: "NZ" },
    { name: "Nicaragua", code: "NI" },
    { name: "Niger", code: "NE" },
    { name: "Nigeria", code: "NG" },
    { name: "Norway", code: "NO" },
    { name: "Oman", code: "OM" },
    { name: "Pakistan", code: "PK" },
    { name: "Palau", code: "PW" },
    { name: "Panama", code: "PA" },
    { name: "Papua New Guinea", code: "PG" },
    { name: "Paraguay", code: "PY" },
    { name: "Peru", code: "PE" },
    { name: "Philippines", code: "PH" },
    { name: "Poland", code: "PL" },
    { name: "Portugal", code: "PT" },
    { name: "Qatar", code: "QA" },
    { name: "Romania", code: "RO" },
    { name: "Russia", code: "RU" },
    { name: "Rwanda", code: "RW" },
    { name: "Saint Kitts and Nevis", code: "KN" },
    { name: "Saint Lucia", code: "LC" },
    { name: "Saint Vincent and the Grenadines", code: "VC" },
    { name: "Samoa", code: "WS" },
    { name: "San Marino", code: "SM" },
    { name: "Sao Tome and Principe", code: "ST" },
    { name: "Saudi Arabia", code: "SA" },
    { name: "Senegal", code: "SN" },
    { name: "Serbia", code: "RS" },
    { name: "Seychelles", code: "SC" },
    { name: "Sierra Leone", code: "SL" },
    { name: "Singapore", code: "SG" },
    { name: "Slovakia", code: "SK" },
    { name: "Slovenia", code: "SI" },
    { name: "Solomon Islands", code: "SB" },
    { name: "Somalia", code: "SO" },
    { name: "South Africa", code: "ZA" },
    { name: "South Sudan", code: "SS" },
    { name: "Spain", code: "ES" },
    { name: "Sri Lanka", code: "LK" },
    { name: "Sudan", code: "SD" },
    { name: "Suriname", code: "SR" },
    { name: "Swaziland", code: "SZ" },
    { name: "Sweden", code: "SE" },
    { name: "Switzerland", code: "CH" },
    { name: "Syria", code: "SY" },
    { name: "Taiwan", code: "TW" },
    { name: "Tajikistan", code: "TJ" },
    { name: "Tanzania", code: "TZ" },
    { name: "Thailand", code: "TH" },
    { name: "Togo", code: "TG" },
    { name: "Tonga", code: "TO" },
    { name: "Trinidad and Tobago", code: "TT" },
    { name: "Tunisia", code: "TN" },
    { name: "Turkey", code: "TR" },
    { name: "Turkmenistan", code: "TM" },
    { name: "Tuvalu", code: "TV" },
    { name: "Uganda", code: "UG" },
    { name: "Ukraine", code: "UA" },
    { name: "United Arab Emirates", code: "AE" },
    { name: "United Kingdom", code: "GB" },
    { name: "United States", code: "US" },
    { name: "Uruguay", code: "UY" },
    { name: "Uzbekistan", code: "UZ" },
    { name: "Vanuatu", code: "VU" },
    { name: "Vatican City", code: "VA" },
    { name: "Venezuela", code: "VE" },
    { name: "Vietnam", code: "VN" },
    { name: "Yemen", code: "YE" },
    { name: "Zambia", code: "ZM" },
    { name: "Zimbabwe", code: "ZW" }
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Filtered countries based on search
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Much more travel ideas for inspiration
  const travelIdeas = [
    "🌺 Find the most colorful gardens",
    "🌊 Discover hidden beaches with crystal clear water",
    "🏰 Explore castles with mysterious legends",
    "🍜 Hunt for the best street food spots",
    "🎨 Find cities with amazing street art",
    "🌿 Search for treehouses in the jungle",
    "🎭 Look for cities with unique festivals",
    "⛰️ Find the most scenic mountain villages",
    "🎪 Discover quirky local markets",
    "🌅 Find the best sunset viewing spots",
    "🎵 Where can I find traditional music venues",
    "🌸 Most beautiful cherry blossom spots",
    "🏺 Ancient ruins with fascinating stories",
    "🚂 Most scenic train journeys",
    "🎪 Unique circus and performance venues",
    "🌴 Remote island paradise getaways",
    "⛷️ Best powder snow destinations",
    "🎭 Cities with underground art scenes",
    "🍷 Hidden vineyard gems",
    "🎪 Magical winter festivals",
    "🏮 Most atmospheric night markets",
    "🗿 Mysterious archaeological sites",
    "🎨 Cities with the best modern art",
    "🌺 Most beautiful botanical gardens",
    "🏔️ Epic mountain monasteries",
    "🎭 Underground jazz clubs",
    "🏖️ Secluded beach camping spots",
    "🎪 Coolest rooftop bars",
    "🌿 Hidden waterfall hikes",
    "🏰 Abandoned places with stories",
    "🎭 Traditional puppet theaters",
    "🌅 Best spots for northern lights",
    "🎪 Floating markets worth visiting",
    "🏺 Ancient libraries and bookshops",
    "🚂 Historic cafes with character"
  ]

  // Get unique countries from search history
  const uniqueCountries = Array.from(new Set(
    searchHistory.flatMap(result => 
      result.locations.map(loc => loc.country)
    )
  )).sort();

  // Filter locations based on selected country and query
  const displayedLocations = selectedQuery
    ? searchHistory
        .find(result => result.query === selectedQuery)
        ?.locations.filter(loc => !countryFocus || loc.country === countryFocus) || []
    : selectedLocation
    ? [selectedLocation]
    : [];

  const getRandomIdea = () => {
    const randomIndex = Math.floor(Math.random() * travelIdeas.length)
    return travelIdeas[randomIndex]
  }

  const handleNewSuggestion = () => {
    const newIdea = getRandomIdea();
    setCurrentSuggestion(newIdea);
    setShowRandomIdea(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Add country focus to the query if selected
      const finalQuery = countryFocus 
        ? `${searchQuery} in ${countryFocus}`
        : searchQuery;

      const response = await fetch('/api/generate-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: finalQuery }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate locations');
      }

      if (data.locations && Array.isArray(data.locations)) {
        const newResult: SearchResult = {
          query: searchQuery,
          timestamp: Date.now(),
          filter: countryFocus || null,
          locations: data.locations,
        };
        
        setSearchHistory(prev => [newResult, ...prev]);
        setSelectedQuery(searchQuery);
        setSelectedLocation(null);
        setLastClickedLocation(null);
        setSearchQuery(''); // Clear search input
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate locations');
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySelect = (query: string) => {
    setSelectedQuery(selectedQuery === query ? null : query);
    setSelectedLocation(null);
    setLastClickedLocation(null);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setLastClickedLocation(location);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-10">
        <div className="flex justify-between items-center h-[57px]">
          <div className="w-96 border-r border-gray-200 px-4 py-3">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Genmap.ai
            </h1>
          </div>
          <div className="flex-1 flex items-center justify-end gap-2 px-4">
            <Button
              variant="secondary"
              size="sm"
              icon={<User className="w-4 h-4" />}
              className="rounded-full"
              onClick={() => setShowProfile(true)}
            >
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex pt-[57px]">
        {/* Sidebar */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-57px)]">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              {/* Country Selection and Random Idea */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1" ref={countryInputRef}>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center gap-2 z-10">
                    {countryFocus ? (
                      countries.find(c => c.name === countryFocus) ? (
                        <span className="text-base leading-none flex items-center">
                          {getFlagEmoji(countries.find(c => c.name === countryFocus)?.code || '')}
                        </span>
                      ) : countryFocus.trim() ? (
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Custom</span>
                      ) : (
                        <Globe className="w-4 h-4" />
                      )
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                  </div>
                  <Input
                    placeholder="Anywhere"
                    value={countryFocus}
                    onChange={(e) => {
                      setCountryFocus(e.target.value)
                      setCountrySearch(e.target.value)
                      setShowCountryDropdown(true)
                    }}
                    onClick={() => setShowCountryDropdown(true)}
                    className="rounded-full py-2 text-sm"
                    style={{ 
                      paddingLeft: countryFocus && countries.find(c => c.name === countryFocus) 
                        ? '42px' 
                        : countryFocus.trim() 
                        ? '68px' 
                        : '32px' 
                    }}
                  />
                  <AnimatePresence>
                    {showCountryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-auto"
                      >
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setCountryFocus('')
                            setShowCountryDropdown(false)
                          }}
                        >
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span>Anywhere</span>
                        </button>
                        {countrySearch && !filteredCountries.some(c => 
                          c.name.toLowerCase() === countrySearch.toLowerCase()
                        ) && (
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 flex items-center gap-2"
                            onClick={() => {
                              setCountryFocus(countrySearch)
                              setShowCountryDropdown(false)
                            }}
                          >
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Custom</span>
                            <span>{countrySearch}</span>
                          </button>
                        )}
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
                            onClick={() => {
                              setCountryFocus(country.name)
                              setShowCountryDropdown(false)
                            }}
                          >
                            <span className="w-6 text-base leading-none">{getFlagEmoji(country.code)}</span>
                            <span>{country.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleNewSuggestion}
                  className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                >
                  <div className="animate-bounce-subtle">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </Button>
              </div>

              {/* Random Idea Suggestion */}
              <AnimatePresence>
                {showRandomIdea && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg text-sm flex items-center gap-2 hover:bg-purple-100 transition-colors text-left"
                    onClick={() => {
                      const searchText = currentSuggestion.split(' ').slice(1).join(' ');
                      setSearchQuery(searchText);
                      setShowRandomIdea(false);
                    }}
                  >
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <p>{currentSuggestion}</p>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Search Input */}
              <div>
                <Input
                  placeholder="What would you like to discover?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  icon={<Search className="w-4 h-4" />}
                  className="rounded-full py-2.5"
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={loading}
                loading={loading}
                className="w-full rounded-full py-2.5"
              >
                {loading ? 'Searching...' : 'Discover Places'}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Search History */}
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {searchHistory.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-700 font-medium mb-2">Start Your Adventure</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter any travel-related query to discover unique places around the world. From hidden gems to popular destinations, let AI guide your exploration.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setSearchQuery("Where can I find the most magical treehouse hotels?")}
                    className="text-sm text-blue-600 hover:text-blue-700 block w-full"
                  >
                    Try "magical treehouse hotels" →
                  </button>
                  <button
                    onClick={() => setSearchQuery("Show me the most colorful street art neighborhoods")}
                    className="text-sm text-blue-600 hover:text-blue-700 block w-full"
                  >
                    Try "colorful street art neighborhoods" →
                  </button>
                  <button
                    onClick={() => setSearchQuery("Where are the world's most unique food markets?")}
                    className="text-sm text-blue-600 hover:text-blue-700 block w-full"
                  >
                    Try "world's most unique food markets" →
                  </button>
                </div>
              </div>
            ) : (
              <SearchHistory
                searchHistory={searchHistory}
                selectedLocation={selectedLocation}
                selectedQuery={selectedQuery}
                lastClickedLocation={lastClickedLocation}
                onLocationSelect={handleLocationSelect}
                onQuerySelect={handleQuerySelect}
              />
            )}
          </div>

          {/* Disclaimer moved to bottom */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                AI-powered playful suggestions for your next adventure. Results are for inspiration only - always verify details before planning your trip! ✨
              </p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <Map 
            key={key}
            locations={displayedLocations}
            selectedLocation={selectedLocation}
            countryFilter={countryFocus}
          />
        </div>

        {/* Country Filter Dialog */}
        {showCountryFilter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto relative p-6">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setShowCountryFilter(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold mb-4">Filter by Country</h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCountry(null);
                    setShowCountryFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    !selectedCountry ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  All Countries
                </button>
                {uniqueCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowCountryFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCountry === country ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Dialog */}
        {showProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setShowProfile(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <ExplorerProfile searchHistory={searchHistory} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
