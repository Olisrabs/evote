import React, { useState, useEffect, useCallback } from 'react';

function exportToPDF(election, results) {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const positionsHTML = results.map(pos => `
    <div style="margin-bottom:28px;">
      <h3 style="font-size:16px;color:#4f46e5;margin-bottom:12px;border-bottom:2px solid #e8e8ff;padding-bottom:6px;">${pos.position}</h3>
      <p style="font-size:12px;color:#888;margin-bottom:10px;">Total votes cast: ${pos.totalVotes.toLocaleString()}</p>
      ${pos.candidates.map((c, i) => `
        <div style="margin-bottom:10px;padding:12px;background:${i===0?'#f0f0ff':'#f9f9f9'};border-radius:8px;border-left:3px solid ${i===0?'#4f46e5':'#ccc'};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-weight:bold;font-size:14px;">${c.fullName} ${i===0?'<span style="color:#10b981;font-size:11px;"> ✓ WINNER</span>':''}</span>
            <span style="font-weight:bold;font-size:14px;color:#4f46e5;">${c.percentage}%</span>
          </div>
          <div style="height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${c.percentage}%;background:${i===0?'#4f46e5':'#a5b4fc'};border-radius:4px;"></div>
          </div>
          <div style="font-size:12px;color:#666;margin-top:4px;">${c.voteCount.toLocaleString()} votes</div>
        </div>
      `).join('')}
    </div>
  `).join('');

  const html = `<!DOCTYPE html><html>
<head><meta charset="UTF-8"><title>${election.title} - Official Results</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#222;}</style></head>
<body>
  <div style="text-align:center;margin-bottom:36px;padding:24px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;color:white;">
    <div style="font-size:12px;opacity:0.8;margin-bottom:4px;">OFFICIAL ELECTION RESULTS</div>
    <h1 style="font-size:24px;margin:0 0 6px;">${election.title}</h1>
    <div style="font-size:13px;opacity:0.8;">Generated on ${dateStr} by the Electoral Commission</div>
  </div>
  <div style="background:#f0f0ff;padding:12px 20px;border-radius:8px;margin-bottom:28px;font-size:13px;">
    <strong>Election Type:</strong> ${election.electionType} &nbsp;|&nbsp;
    <strong>Status:</strong> ${election.status.toUpperCase()} &nbsp;|&nbsp;
    <strong>Total Positions:</strong> ${results.length}
  </div>
  ${positionsHTML}
  <div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#999;">
    This document is an official record of the Electoral Commission. Results are final and binding.
  </div>
</body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.onload = () => { w.print(); };
}

export default function Results({ onNavigate }) {
  const [elections, setElections] = useState([]);
  const [electionsLoading, setElectionsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [results, setResults] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all elections on mount
  useEffect(() => {
    fetch('/api/admin/elections', { credentials: 'include' })
      .then(r => {
        if (r.status === 401 && onNavigate) {
          onNavigate('logout');
          throw new Error('Unauthorized');
        }
        return r.json();
      })
      .then(data => {
        const all = data.elections || [];
        setElections(all);
        // Auto-select first closed election
        const first = all.find(e => e.status === 'closed');
        if (first) setSelectedId(first.id);
        setElectionsLoading(false);
      })
      .catch(() => setElectionsLoading(false));
  }, [onNavigate]);

  const fetchResults = useCallback(async (id) => {
    if (!id) return;
    setResultsLoading(true);
    setResults(null);
    setError('');
    try {
      const r = await fetch(`/api/admin/elections/${id}/results`, { credentials: 'include' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setResults(data.results || []);
      setSelectedElection(data.election);
    } catch (err) {
      setError(err.message);
    } finally {
      setResultsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) fetchResults(selectedId);
  }, [selectedId, fetchResults]);

  const closedElections = elections.filter(e => e.status === 'closed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Election Results</h2>
          <p className="text-sm text-outline">View per-position vote breakdowns from closed elections.</p>
        </div>
        <button
          onClick={() => results && selectedElection && exportToPDF(selectedElection, results)}
          disabled={!results || results.length === 0}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">print</span> Export as PDF
        </button>
      </div>

      {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}

      <div className="glass-card rounded-2xl p-6 border border-outline/20">
        <label className="block text-sm font-semibold text-on-surface mb-2">Select Election</label>
        {electionsLoading ? (
          <div className="h-10 rounded-xl bg-surface-container animate-pulse w-full max-w-md" />
        ) : closedElections.length === 0 ? (
          <div className="bg-outline/10 text-outline px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            No closed elections yet. Only closed elections display results.
          </div>
        ) : (
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full max-w-md bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-on-surface font-medium cursor-pointer"
          >
            {closedElections.map(el => (
              <option key={el.id} value={el.id}>{el.title}</option>
            ))}
          </select>
        )}
      </div>

      {resultsLoading && (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-40 rounded-3xl bg-surface-container animate-pulse" />)}
        </div>
      )}

      {!resultsLoading && results !== null && results.length === 0 && (
        <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-outline/30 mb-4">how_to_vote</span>
          <h3 className="text-xl font-bold text-on-surface">No Votes Recorded</h3>
          <p className="text-outline mt-2 max-w-sm">This election has no vote data yet, or no candidates were added before it was closed.</p>
        </div>
      )}

      {!resultsLoading && results && results.length > 0 && (
        <div className="space-y-6">
          {results.map((pos, idx) => (
            <div key={idx} className="glass-card rounded-3xl p-6 sm:p-8 border border-outline/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <h3 className="text-xl font-bold text-on-surface">{pos.position}</h3>
                <span className="text-sm font-semibold px-3 py-1 bg-surface-container rounded-full text-outline border border-outline/10">
                  {pos.totalVotes.toLocaleString()} total votes
                </span>
              </div>
              {pos.candidates.length === 0 ? (
                <p className="text-outline text-sm">No candidates for this position.</p>
              ) : (
                <div className="space-y-5">
                  {pos.candidates.map((c, cIdx) => {
                    const isWinner = cIdx === 0 && pos.totalVotes > 0;
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{c.fullName[0]}</div>
                            <span className="font-semibold text-on-surface">{c.fullName}</span>
                            {isWinner && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary">
                                <span className="material-symbols-outlined text-[12px]">verified</span> WINNER
                              </span>
                            )}
                            {c.isDisqualified && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-error/10 text-error">DQ</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lg text-on-surface">{c.percentage}%</span>
                            <span className="text-xs text-outline ml-2">({c.voteCount.toLocaleString()} votes)</span>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${isWinner ? 'bg-secondary' : 'bg-primary/60'}`}
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
