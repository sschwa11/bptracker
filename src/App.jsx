import React, { useState, useEffect } from 'react';
import BlueprintGrid from './components/BlueprintGrid';
import { fetchUsers, addUser, removeUser, updateBlueprintStatus, setAllBlueprintsStatus } from './services/api';
import blueprintsData from './data/blueprints.json';

function App() {
  // ... inside App component ...
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [filteredUser, setFilteredUser] = useState(null);
  const [overviewMode, setOverviewMode] = useState('missing');

  const handleUserFilter = (username) => {
    if (filteredUser === username) {
      setFilteredUser(null);
    } else {
      setFilteredUser(username);
    }
  };


  const displayedOverviewUsers = filteredUser
    ? users.filter(u => u.name === filteredUser)
    : users;

  // ... (existing render code) ...


  const [error, setError] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);

  // Distinct colors for raiders (up to 20)
  const RAIDER_COLORS = [
    '#EF4444',
    '#3B82F6',
    '#EAB308',
    '#10B981',
    '#8B5CF6',
    '#F97316',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#6366F1',
    '#D946EF',
    '#14B8A6',
  ];


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchUsers();


    const loadedUsers = (data.users || []).map((u, index) => ({
      ...u,
      color: RAIDER_COLORS[index % RAIDER_COLORS.length]
    }));

    setUsers(loadedUsers);


    if (currentUser && !loadedUsers.find(u => u.name === currentUser)) {
      setCurrentUser(null);
    } else if (!currentUser && loadedUsers.length > 0) {
      setCurrentUser(loadedUsers[0].name);
    }
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    setLoading(true);
    try {
      await addUser(newUserName);
      await loadData();
      setCurrentUser(newUserName);
      setNewUserName('');
      setIsManageMode(false);
    } catch (err) {
      setError('Failed to add user');
    }
    setLoading(false);
  };

  const handleRemoveUser = async (name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    setLoading(true);
    try {
      await removeUser(name);
      await loadData();
      if (currentUser === name) setCurrentUser(null);
    } catch (err) {
      setError('Failed to remove user');
    }
    setLoading(false);
  };

  const handleToggleBlueprint = async (bpId) => {
    if (viewMode === 'overview') return;

    if (!currentUser) return;

    const userObj = users.find(u => u.name === currentUser);
    const currentStatus = userObj?.blueprints?.[bpId] || 'unknown';

    let nextStatus = 'owned';
    if (currentStatus === 'owned') {
      nextStatus = 'unknown';
    } else {
      nextStatus = 'owned';
    }


    const updatedUsers = users.map(u => {
      if (u.name === currentUser) {
        return {
          ...u,
          blueprints: { ...u.blueprints, [bpId]: nextStatus }
        };
      }
      return u;
    });
    setUsers(updatedUsers);


    try {
      await updateBlueprintStatus(currentUser, bpId, nextStatus);
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const handleBulkAction = async (status) => {
    if (viewMode === 'overview') return;
    if (!currentUser) return;
    if (!confirm(status === 'owned' ? "Mark ALL blueprints as owned?" : "Clear ALL owned status?")) return;

    setLoading(true);

    const newBlueprints = {};
    if (status) {
      blueprintsData.forEach(bp => {
        if (!bp.isBlank) newBlueprints[bp.id] = status;
      });
    }

    const updatedUsers = users.map(u => {
      if (u.name === currentUser) {
        return { ...u, blueprints: newBlueprints };
      }
      return u;
    });
    setUsers(updatedUsers);

    try {
      await setAllBlueprintsStatus(currentUser, status);
    } catch (err) {
      console.error("Bulk action failed", err);
      setError("Bulk action failed to save");
    }
    setLoading(false);
  };

  const currentUserData = users.find(u => u.name === currentUser);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#111]">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-wider text-arc-red">BP<span className="text-white">TRACKER</span></h1>


          <div className="flex bg-gray-900 rounded p-1 gap-1">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'individual' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              RAIDER
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${viewMode === 'overview' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              OVERVIEW
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">

          <select
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-arc-red"
            value={currentUser || ''}
            onChange={(e) => {
              setCurrentUser(e.target.value);
              setViewMode('individual');
            }}
          >
            <option value="" disabled>Select Raider</option>
            {users.map(u => (
              <option key={u.name} value={u.name}>{u.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsManageMode(!isManageMode)}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            {isManageMode ? 'Done' : 'Manage'}
          </button>
        </div>
      </header>



      <main className="flex-1 p-4 overflow-y-auto">
        {error && <div className="bg-red-900/50 p-2 text-center text-red-200 mb-4 rounded">{error}</div>}

        {isManageMode && (
          <div className="mb-6 p-4 bg-gray-900 rounded border border-gray-800 max-w-md mx-auto">
            <h3 className="text-sm font-semibold mb-3 text-gray-400">Manage Raiders</h3>
            <ul className="space-y-2 mb-4">
              {users.map(u => (
                <li key={u.name} className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded">
                  <span>{u.name}</span>
                  <button onClick={() => handleRemoveUser(u.name)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddUser} className="flex gap-2">
              <input
                type="text"
                placeholder="New Raider Name"
                className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <button type="submit" disabled={loading} className="bg-arc-red text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-600 disabled:opacity-50">
                ADD
              </button>
            </form>
          </div>
        )}


        {viewMode === 'individual' && !currentUser ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
            <div className="text-4xl mb-4 opacity-20">⚠️</div>
            <p>Select a Raider to view blueprints</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">

            <div className="grid grid-cols-1 mb-4">


              <div
                className={`col-start-1 row-start-1 flex items-center justify-between px-4 align-top transition-opacity duration-200 ${viewMode === 'overview' ? 'opacity-100 relative z-10' : 'opacity-0 invisible pointer-events-none'}`}
              >
                <div className="flex items-baseline gap-4">
                  <h2 className="text-lg font-bold text-gray-300">
                    {overviewMode === 'missing' ? 'Missing Blueprints Overview' : 'Owned Blueprints Overview'}
                  </h2>
                  <div className="flex bg-gray-900 rounded p-0.5">
                    <button
                      onClick={() => setOverviewMode('missing')}
                      className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${overviewMode === 'missing' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                      MISSING
                    </button>
                    <button
                      onClick={() => setOverviewMode('owned')}
                      className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${overviewMode === 'owned' ? 'bg-arc-green text-black' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                      OWNED
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-sm flex-wrap max-w-xl justify-end items-center">
                  <button
                    onClick={() => setFilteredUser(null)}
                    className={`px-3 py-1.5 rounded transition-colors ${!filteredUser ? 'bg-gray-700 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Show All
                  </button>
                  <div className="h-4 w-px bg-gray-700 mx-2"></div>
                  {users.map(u => (
                    <button
                      key={u.name}
                      onClick={() => handleUserFilter(u.name)}
                      className={`flex items-center gap-2 font-mono hover:bg-gray-800 rounded px-2 py-1 transition-colors ${filteredUser === u.name ? 'ring-1 ring-white bg-gray-800' : 'opacity-80 hover:opacity-100'}`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: u.color }}></div>
                      <span className={filteredUser === u.name ? 'text-white font-bold' : 'text-gray-400'}>{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>


              <div
                className={`col-start-1 row-start-1 flex flex-col gap-2 transition-opacity duration-200 ${viewMode === 'individual' ? 'opacity-100 relative z-10' : 'opacity-0 invisible pointer-events-none'}`}
              >
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-bold text-gray-300">
                    {currentUser}'s Collection
                  </h2>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-arc-green"></div> Owned</span>
                  </div>
                </div>


                <div className="flex justify-end gap-2 px-4">
                  <button
                    onClick={() => handleBulkAction('owned')}
                    disabled={loading}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-arc-green uppercase tracking-wide transition-colors"
                    style={{ borderColor: '#22c55e', color: '#22c55e' }}
                  >
                    Mark All Owned
                  </button>
                  <button
                    onClick={() => handleBulkAction('')}
                    disabled={loading}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-400 hover:text-white uppercase tracking-wide transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

            </div>


            <BlueprintGrid
              isOverview={viewMode === 'overview'}
              users={users}
              userBlueprints={viewMode === 'individual' ? currentUserData?.blueprints : undefined}
              filteredUser={filteredUser}
              overviewMode={overviewMode}
              onToggleBlueprint={viewMode === 'individual' ? handleToggleBlueprint : () => { }}
            />
          </div>
        )}
      </main>

      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-transparent overflow-hidden z-50">
          <div className="h-full bg-arc-red animate-pulse w-1/3 mx-auto"></div>
        </div>
      )}
    </div>
  );
}

export default App;
