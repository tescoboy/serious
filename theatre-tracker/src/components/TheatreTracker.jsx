import { useState, useEffect } from 'react';
import { Clock, Calendar, Save, Moon, Trash2, Edit2, X } from 'lucide-react';

const TheatreTracker = () => {
  const [plays, setPlays] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    score: ''
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const savedPlays = localStorage.getItem('theatrePlays');
    if (savedPlays) {
      setPlays(JSON.parse(savedPlays));
    } else {
      // Import historic data if no existing data
      const historicPlays = [
        {
          name: "The Crucible",
          date: "2022-11-04",
          score: 3.5,
          id: 1
        },
        {
          name: "Othello",
          date: "2022-12-19",
          score: 3.5,
          id: 2
        },
      ].map((play, index) => ({
        ...play,
        id: Date.now() - (index * 1000) // Create unique IDs
      }));
      
      setPlays(historicPlays);
      localStorage.setItem('theatrePlays', JSON.stringify(historicPlays));
    }
  }, []);

  useEffect(() => {
    if (plays.length > 0) {
      localStorage.setItem('theatrePlays', JSON.stringify(plays));
    }
  }, [plays]);

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedAndFilteredPlays = () => {
    return [...plays]
      .filter(play => 
        play.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(play.date).toLocaleDateString().includes(searchTerm)
      )
      .sort((a, b) => {
        if (sortConfig.field === 'date') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        if (sortConfig.field === 'name') {
          return sortConfig.direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sortConfig.field === 'rating') {
          return sortConfig.direction === 'asc'
            ? a.score - b.score
            : b.score - a.score;
        }
        return 0;
      });
  };

  const paginatedPlays = () => {
    const filtered = getSortedAndFilteredPlays();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const totalPages = Math.ceil(getSortedAndFilteredPlays().length / ITEMS_PER_PAGE);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (score) => {
    setFormData(prev => ({
      ...prev,
      score: score.toString()
    }));
  };

  const addPlay = () => {
    if (!formData.name || !formData.date || !formData.score) {
      alert('Please fill in all fields');
      return;
    }

    const newPlay = {
      ...formData,
      score: parseFloat(formData.score),
      id: editingId || Date.now()
    };

    if (editingId) {
      setPlays(prevPlays => 
        prevPlays.map(play => 
          play.id === editingId ? newPlay : play
        )
      );
      setEditingId(null);
    } else {
      setPlays(prevPlays => [...prevPlays, newPlay]);
    }
    
    setFormData({
      name: '',
      date: '',
      score: ''
    });
  };

  const deletePlay = (id) => {
    if (window.confirm('Are you sure you want to delete this play?')) {
      setPlays(prevPlays => prevPlays.filter(play => play.id !== id));
    }
  };

  const editPlay = (play) => {
    setFormData({
      name: play.name,
      date: play.date,
      score: play.score.toString()
    });
    setEditingId(play.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-950 p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-300 mb-2">Serious Theatre</h1>
          <div className="text-red-300/80">Your Personal Performance Archive</div>
        </div>

        {/* New Play Form */}
        <div className="mb-6 rounded-lg border border-red-900/20 shadow-lg bg-slate-900/90 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-red-900/20 p-4">
            <h2 className="text-lg text-amber-300">
              {editingId ? 'Edit Play' : 'Add New Play'}
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-red-300">Play Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-red-900/30 rounded-lg text-lg bg-slate-800/90 text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="Enter play name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-red-300">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-red-900/30 rounded-lg text-lg bg-slate-800/90 text-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-red-300">Rating (click moon for rating, 👤 for standing ovation)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(rating => {
                    const currentRating = parseFloat(formData.score) || 0;
                    const isFullMoon = currentRating >= rating;
                    const isHalfMoon = currentRating === rating - 0.5;
                    
                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => {
                          if (currentRating === rating) {
                            handleRatingClick(rating - 0.5);
                          } else {
                            handleRatingClick(rating);
                          }
                        }}
                        className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors relative"
                      >
                        {isHalfMoon ? (
                          <div className="relative">
                            <Moon size={24} className="text-slate-600" />
                            <div className="absolute inset-0 overflow-hidden w-1/2">
                              <Moon size={24} className="fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        ) : (
                          <Moon 
                            size={24} 
                            className={isFullMoon ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}
                          />
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleRatingClick(6)}
                    className={`p-2 hover:bg-slate-800/50 rounded-lg transition-colors ${
                      formData.score === '6' ? 'bg-slate-800/50' : ''
                    }`}
                  >
                    <span className="text-2xl">👤</span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={addPlay}
                className="w-full p-4 bg-amber-600 text-slate-900 rounded-lg text-lg font-medium hover:bg-amber-500 transition-colors"
              >
                {editingId ? 'Update Play' : 'Add Play'}
              </button>
            </div>
          </div>
        </div>

        {/* Import Data Section */}
        <div className="mb-6 rounded-lg border border-red-900/20 shadow-lg bg-slate-900/90 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-red-900/20 p-4">
            <h2 className="text-lg text-amber-300">Import Historic Data</h2>
          </div>
          <div className="p-4">
            <button
              onClick={() => {
                const historicPlays = [
                  { name: "The Crucible", date: "2022-11-04", score: 3.5 },
                  { name: "Othello", date: "2022-12-19", score: 3.5 },
                  { name: "Phaedra", date: "2023-03-29", score: 4 },
                  { name: "Dancing at Lughnasa", date: "2023-04-21", score: 3 },
                  { name: "Patriots", date: "2023-05-23", score: 4 },
                  { name: "Pillowman", date: "2023-06-12", score: 2 },
                  { name: "Accidental Death of an Anarchist", date: "2023-06-27", score: 1 },
                  { name: "The Effect", date: "2023-07-12", score: 3 },
                  { name: "Pygmalion", date: "2023-09-23", score: 2 },
                  { name: "The Father and The Assassin", date: "2023-10-14", score: 3.5 },
                  { name: "Rock n roll", date: "2023-08-12", score: 3 },
                  { name: "The flea", date: "2023-12-15", score: 5 },
                  { name: "This much I know", date: "2023-01-15", score: 3.5 },
                  { name: "The homecoming", date: "2024-01-26", score: 3 },
                  { name: "Nachtland", date: "2024-03-08", score: 3.5 },
                  { name: "Samuel takes a break", date: "2024-02-01", score: 5 },
                  { name: "Nye", date: "2024-02-15", score: 3.5 },
                  { name: "Hills of California", date: "2024-03-15", score: 4.5 },
                  { name: "A longs day Journey into Night", date: "2024-04-01", score: 4 },
                  { name: "Cherry Orchard", date: "2024-05-01", score: 3.5 },
                  { name: "Boys from the Black Stuff", date: "2024-06-01", score: 2.5 },
                  { name: "Mnemonic", date: "2024-07-19", score: 3.5 },
                  { name: "Hot King Wing", date: "2024-09-06", score: 4 },
                  { name: "Dr Strange love", date: "2024-10-11", score: 2.5 },
                  { name: "Roots", date: "2024-10-15", score: 3.5 },
                  { name: "Look back in Anger", date: "2024-09-04", score: 4 },
                  { name: "Grapes of Wrath", date: "2024-09-13", score: 3.5 },
                  { name: "The Importance of Being Earnest", date: "2025-01-24", score: 1 },
                  { name: "Coriolanus", date: "2024-11-08", score: 1 },
                  { name: "The Other Place", date: "2024-11-01", score: 2.5 },
                  { name: "The Real Thing", date: "2024-08-27", score: 3.5 },
                  { name: "The Constituent", date: "2024-12-01", score: 2 },
                  { name: "Oedipus", date: "2024-12-10", score: 5 },
                  { name: "The Invention of Love", date: "2025-02-01", score: 2 }
                ].map((play, index) => ({
                  ...play,
                  id: Date.now() - ((index + 1) * 1000) // Create unique IDs
                }));

                setPlays(historicPlays);
                localStorage.setItem('theatrePlays', JSON.stringify(historicPlays));
                alert('Historic data imported successfully!');
              }}
              className="w-full p-4 bg-amber-600 text-slate-900 rounded-lg text-lg font-medium hover:bg-amber-500 transition-colors"
            >
              Import Historic Theatre Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg border border-red-900/20 bg-slate-900/90 backdrop-blur-sm shadow-md p-3">
            <div className="text-2xl font-bold text-amber-300">{plays.length}</div>
            <div className="text-xs text-red-300">Total Shows</div>
          </div>
          <div className="rounded-lg border border-red-900/20 bg-slate-900/90 backdrop-blur-sm shadow-md p-3">
            <div className="text-2xl font-bold text-amber-300">
              {plays.filter(play => new Date(play.date).getFullYear() === new Date().getFullYear()).length}
            </div>
            <div className="text-xs text-red-300">This Year</div>
          </div>
          <div className="rounded-lg border border-red-900/20 bg-slate-900/90 backdrop-blur-sm shadow-md p-3">
            <div className="text-2xl font-bold text-amber-300">
              {plays.filter(play => new Date(play.date).getMonth() === new Date().getMonth()).length}
            </div>
            <div className="text-xs text-red-300">This Month</div>
          </div>
        </div>

        {/* Top Rated Section - Perfect Scores and Standing Ovations */}
        <div className="mb-6 rounded-lg border border-red-900/20 bg-slate-900/90 backdrop-blur-sm shadow-lg">
          <div className="border-b border-red-900/20 p-4">
            <h2 className="text-lg text-amber-300 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              Hall of Fame
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {[...plays]
              .filter(play => play.score === 5 || play.score === 6)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(play => (
                <div key={play.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="font-medium text-amber-100">{play.name}</div>
                    <div className="text-sm text-red-300">
                      {new Date(play.date).toLocaleDateString()}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {play.score === 6 ? (
                        <span className="text-xl">👤</span>
                      ) : (
                        Array.from({ length: 5 }).map((_, i) => (
                          <Moon key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editPlay(play)}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deletePlay(play.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Recent Plays Section */}
        <div className="mb-6 rounded-lg border border-red-900/20 bg-slate-900/90 backdrop-blur-sm shadow-lg">
          <div className="border-b border-red-900/20 p-4">
            <h2 className="text-lg text-amber-300 flex items-center gap-2">
              <Clock className="text-red-300" size={20} />
              Recent Plays
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {[...plays].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map(play => (
              <div key={play.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-amber-100">{play.name}</div>
                  <div className="text-sm text-red-300">
                    {new Date(play.date).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: Math.floor(play.score) }).map((_, i) => (
                      <Moon key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    {play.score % 1 === 0.5 && (
                      <div className="relative w-4 h-4">
                        <Moon size={16} className="text-slate-600" />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                          <Moon size={16} className="fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editPlay(play)} className="text-amber-400 hover:text-amber-300">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deletePlay(play.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Plays Section */}
        <div className="rounded-lg border border-red-900/20 bg-slate-900/90 backdrop-blur-sm shadow-lg">
          <div className="border-b border-red-900/20 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-amber-300">All Plays</h2>
              <span className="text-sm text-red-300">
                Total: {getSortedAndFilteredPlays().length}
              </span>
            </div>

            {/* Search */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search plays..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 bg-slate-800/50 border border-red-900/20 rounded-lg text-amber-100"
              />

              {/* Sort Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort('date')}
                  className={`px-3 py-1 rounded-lg ${
                    sortConfig.field === 'date' ? 'bg-amber-600 text-slate-900' : 'text-amber-300 border border-red-900/20'
                  }`}
                >
                  Date
                </button>
                <button
                  onClick={() => handleSort('name')}
                  className={`px-3 py-1 rounded-lg ${
                    sortConfig.field === 'name' ? 'bg-amber-600 text-slate-900' : 'text-amber-300 border border-red-900/20'
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => handleSort('rating')}
                  className={`px-3 py-1 rounded-lg ${
                    sortConfig.field === 'rating' ? 'bg-amber-600 text-slate-900' : 'text-amber-300 border border-red-900/20'
                  }`}
                >
                  Rating
                </button>
              </div>
            </div>
          </div>

          {/* Plays List */}
          <div className="p-4 space-y-3">
            {paginatedPlays().map(play => (
              <div key={play.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-amber-100">{play.name}</div>
                  <div className="text-sm text-red-300">
                    {new Date(play.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {Array.from({ length: Math.floor(play.score) }).map((_, i) => (
                      <Moon key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    {play.score % 1 === 0.5 && (
                      <div className="relative w-4 h-4">
                        <Moon size={16} className="text-slate-600" />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                          <Moon size={16} className="fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editPlay(play)}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deletePlay(play.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-red-900/20">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentPage === index + 1
                        ? 'bg-amber-600 text-slate-900'
                        : 'text-amber-300 border border-red-900/20 hover:bg-slate-800/50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {getSortedAndFilteredPlays().length === 0 && (
              <div className="text-center text-red-300 py-8">
                No plays found matching your search
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheatreTracker;
          
