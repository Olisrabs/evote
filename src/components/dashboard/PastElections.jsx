import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const PastElections = ({ user, onNavigate, onSelectElection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPastElections = async () => {
      try {
        const r = await fetch('/api/elections/past/all', { credentials: 'include' });
        if (r.status === 401 && onNavigate) {
          onNavigate('logout');
          return;
        }
        if (!r.ok) throw new Error('Failed to load past elections');
        const data = await r.json();
        setElections(data.elections || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPastElections();
  }, [onNavigate]);

  const formattedElections = elections.map(e => {
    const dateObj = new Date(e.endsAt);
    return {
      ...e,
      date: dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      year: dateObj.getFullYear().toString(),
      description: e.description || 'No description provided.'
    };
  });

  const uniqueYears = ['All', ...new Set(formattedElections.map(e => e.year))];

  const filteredElections = formattedElections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'All' || election.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="past-elections">
      <div className="w-full">
        {/* Page Header & Search Section */}
        <div className="mb-lg space-y-md">
          <div className="text-center md:text-left">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Past Elections</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Review your historical participation and verified digital receipts.</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-base md:items-center bg-surface-container-low p-sm rounded-xl border border-outline-variant">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                placeholder="Search by election name..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-base">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface-variant focus:ring-2 focus:ring-primary outline-none"
              >
                {uniqueYears.map(yr => (
                  <option key={yr} value={yr}>{yr === 'All' ? 'Year: All' : yr}</option>
                ))}
              </select>
              
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedYear('All');
                }}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-xs hover:shadow-md transition-all active:scale-95 font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-outline-variant rounded-xl p-md shadow-sm animate-pulse min-h-[140px]">
                <div className="h-4 w-20 bg-surface-container rounded mb-3" />
                <div className="h-6 w-3/4 bg-surface-container rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-md rounded-xl bg-error/10 text-error border border-error/20 text-center font-medium">
            {error}
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="p-xl rounded-xl bg-surface-container/30 border border-outline/10 text-center text-outline">
            <span className="material-symbols-outlined text-[48px] mb-2">history</span>
            <p className="text-sm font-semibold">No past elections found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredElections.map((election) => (
              <div 
                key={election.id} 
                onClick={() => {
                  onSelectElection(election);
                  onNavigate('past-election-results');
                }}
                className="bg-white border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-sm">
                    <span className="text-on-surface-variant font-label-sm text-label-sm font-medium">{election.date}</span>
                  </div>
                  
                  <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors font-bold leading-tight truncate" title={election.title}>
                    {election.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-xs line-clamp-2 leading-relaxed">
                    {election.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Transparency Banner */}
        <div className="mt-xl bg-surface-container-high border border-outline-variant rounded-2xl p-lg flex flex-col md:flex-row items-center gap-lg">
          <div className="w-full md:w-1/3">
            <div className="aspect-video bg-white rounded-xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <img 
                alt="Secure Voting" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY8U9922Qbxkgiz-qNkHWY37Z9z5nzA7l4scUyRFNFJpMOgilbDRNcEtrwblMT7l_X3Pv3eawNUuJOZdreN0XVFU4b9s__ubcSd4zjM_ZCEIkrkZLoJXG8-moGW6vf9eGaaxeaH-ymypeTSqFPICuSo6BY7d9Tgrfcd6rX_Ry4wiDMXvFNXKH0kZ5Z93fxRTxEM0rzHbQxoN7G66VOQppGf0yXE1Q3rY9XPXe-3vg07XJSOd0yJXO2EiY8k7_sYvmoaepAHA8T6xjJ"
              />
            </div>
          </div>
          
          <div className="w-full md:w-2/3 space-y-base">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Immutable Verification</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              All historical records are stored on a private, audited ledger. This ensures that while your vote remains anonymous, your participation is permanently recorded and cryptographically verifiable. Any tampering attempts would be immediately detected by the distributed audit nodes.
            </p>
            
            <div className="flex flex-wrap gap-md pt-sm">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>gpp_good</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>public</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">Public Node Verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PastElections;
