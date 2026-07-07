import React, { useState, useEffect, useCallback } from 'react';

const STATUS_STYLES = {
  active: 'bg-primary/10 text-primary',
  draft: 'bg-outline/10 text-outline',
  closed: 'bg-secondary/20 text-secondary',
  cancelled: 'bg-error/10 text-error',
};

const STATUS_FLOW = { draft: 'active', active: 'closed' };
const STATUS_LABELS = { draft: 'Activate', active: 'Close', closed: null };

export default function ElectionsManagement({ onNavigate }) {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [managingElection, setManagingElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', description: '', electionType: 'school', scopeType: '', scopeValue: '', startsAt: '', endsAt: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [cForm, setCForm] = useState({ studentId: '', fullName: '', position: '', manifesto: '', manifestoSummary: '', photoUrl: '' });
  const [cLoading, setCLoading] = useState(false);

  const fetchElections = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/elections', { credentials: 'include' });
      if (r.status === 401 && onNavigate) {
        onNavigate('logout');
        return;
      }
      const data = await r.json();
      setElections(data.elections || []);
    } finally {
      setLoading(false);
    }
  }, [onNavigate]);

  useEffect(() => { fetchElections(); }, [fetchElections]);

  const openManage = async (election) => {
    setManagingElection(election);
    setCandidatesLoading(true);
    const r = await fetch(`/api/admin/elections/${election.id}/candidates`, { credentials: 'include' });
    const data = await r.json();
    setCandidates(data.candidates || []);
    setCandidatesLoading(false);
  };

  // Safe JSON parser — avoids "Unexpected end of JSON input" on empty bodies
  const safeJson = async (response) => {
    const text = await response.text();
    if (!text) return { message: `Server error: HTTP ${response.status}` };
    try { return JSON.parse(text); } catch { return { message: text }; }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      const r = await fetch('/api/admin/elections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await safeJson(r);
      if (!r.ok) throw new Error(data.message);
      setSuccess('Election created successfully!');
      setShowCreateModal(false);
      setForm({ title: '', description: '', electionType: 'school', scopeType: '', scopeValue: '', startsAt: '', endsAt: '' });
      fetchElections();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (electionId, newStatus) => {
    setStatusUpdating(electionId);
    try {
      const r = await fetch(`/api/admin/elections/${electionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setElections(prev => prev.map(e => e.id === electionId ? { ...e, status: newStatus } : e));
      if (managingElection?.id === electionId) setManagingElection(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCForm(p => ({ ...p, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setCLoading(true);
    try {
      const r = await fetch(`/api/admin/elections/${managingElection.id}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(cForm),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setCandidates(prev => [...prev, data.candidate]);
      setCForm({ studentId: '', fullName: '', position: '', manifesto: '', manifestoSummary: '', photoUrl: '' });
      setShowAddCandidate(false);
      fetchElections();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setCLoading(false);
    }
  };

  const handleDisqualify = async (candidateId) => {
    try {
      const r = await fetch(`/api/admin/candidates/${candidateId}/disqualify`, { method: 'PATCH', credentials: 'include' });
      if (!r.ok) throw new Error('Failed');
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isDisqualified: true } : c));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReinstate = async (candidateId) => {
    try {
      const r = await fetch(`/api/admin/candidates/${candidateId}/reinstate`, { method: 'PATCH', credentials: 'include' });
      if (!r.ok) throw new Error('Failed');
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isDisqualified: false } : c));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!confirm('Remove this candidate?')) return;
    try {
      await fetch(`/api/admin/candidates/${candidateId}`, { method: 'DELETE', credentials: 'include' });
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      fetchElections();
    } catch (err) {
      setError(err.message);
    }
  };

  const inputClass = 'w-full bg-surface-container border border-outline/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Elections Management</h2>
          <p className="text-sm text-outline">Create, configure, and monitor all elections from the database.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> Create Election
        </button>
      </div>

      {success && <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{success}</div>}
      {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}

      {/* Elections Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-outline/20">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-surface-container animate-pulse" />)}</div>
        ) : elections.length === 0 ? (
          <div className="p-12 text-center"><span className="material-symbols-outlined text-5xl text-outline/30">event_busy</span><p className="text-outline mt-2">No elections yet. Create your first one.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container/50 text-outline border-b border-outline/20">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Dates</th>
                  <th className="px-6 py-4 font-semibold">Candidates / Votes</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {elections.map(el => (
                  <tr key={el.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-on-surface max-w-[200px] truncate">{el.title}</td>
                    <td className="px-6 py-4 text-outline capitalize">{el.electionType}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[el.status] || 'bg-outline/10 text-outline'}`}>
                        {el.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                        {el.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-outline text-xs">
                      <div>{el.startsAt ? new Date(el.startsAt).toLocaleDateString() : '—'}</div>
                      <div>{el.endsAt ? `to ${new Date(el.endsAt).toLocaleDateString()}` : ''}</div>
                    </td>
                    <td className="px-6 py-4 text-outline text-xs">
                      <div>{el._count?.candidates ?? 0} candidates</div>
                      <div>{el.voterCount ?? 0} votes cast</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {STATUS_LABELS[el.status] && (
                          <button
                            onClick={() => handleStatusChange(el.id, STATUS_FLOW[el.status])}
                            disabled={statusUpdating === el.id}
                            className="text-xs px-3 py-1.5 rounded-lg border border-outline/20 hover:bg-surface-container text-on-surface font-medium transition-colors disabled:opacity-50"
                          >
                            {statusUpdating === el.id ? '...' : STATUS_LABELS[el.status]}
                          </button>
                        )}
                        <button onClick={() => openManage(el)} className="text-primary hover:text-primary/70 font-medium text-sm transition-colors px-2 py-1 bg-primary/5 rounded-lg">
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline/20 rounded-3xl p-7 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-surface">Create New Election</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-outline hover:text-on-surface p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">error</span>{error}</div>}
            <form onSubmit={handleCreateElection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-outline mb-1.5 uppercase tracking-wide">Election Title *</label>
                <input className={inputClass} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., 2024 SRC General Elections" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-outline mb-1.5 uppercase tracking-wide">Description</label>
                <textarea className={inputClass} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional details about this election" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-outline mb-1.5 uppercase tracking-wide">Scope (Who Can Vote) *</label>
                <select className={inputClass} value={form.electionType} onChange={e => setForm(p => ({ ...p, electionType: e.target.value, scopeValue: '' }))}>
                  <option value="school">All Students (School-Wide)</option>
                  <option value="faculty">By Faculty</option>
                  <option value="department">By Department</option>
                  <option value="level">By Level</option>
                </select>
              </div>
              {form.electionType !== 'school' && (
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1.5 uppercase tracking-wide">
                    {form.electionType === 'faculty' ? 'Faculty Name' : form.electionType === 'department' ? 'Department Name' : 'Level (e.g. 300L)'}
                  </label>
                  <input className={inputClass} value={form.scopeValue} onChange={e => setForm(p => ({ ...p, scopeValue: e.target.value }))} placeholder={`Enter ${form.electionType} value`} required />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1.5 uppercase tracking-wide">Start Date & Time</label>
                  <input type="datetime-local" className={inputClass} value={form.startsAt} onChange={e => setForm(p => ({ ...p, startsAt: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1.5 uppercase tracking-wide">End Date & Time</label>
                  <input type="datetime-local" className={inputClass} value={form.endsAt} onChange={e => setForm(p => ({ ...p, endsAt: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl font-semibold text-on-surface border border-outline/20 hover:bg-surface-container transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {formLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : null}
                  {formLoading ? 'Saving...' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Election Modal */}
      {managingElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline/20 rounded-3xl p-7 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-on-surface">{managingElection.title}</h3>
              <button onClick={() => { setManagingElection(null); setShowAddCandidate(false); }} className="text-outline hover:text-on-surface p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[managingElection.status]}`}>
                {managingElection.status.toUpperCase()}
              </span>
              {STATUS_LABELS[managingElection.status] && (
                <button
                  onClick={() => handleStatusChange(managingElection.id, STATUS_FLOW[managingElection.status])}
                  disabled={statusUpdating === managingElection.id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                >
                  {statusUpdating === managingElection.id ? 'Updating...' : `→ ${STATUS_LABELS[managingElection.status]}`}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-on-surface">Candidates</h4>
              <button onClick={() => setShowAddCandidate(p => !p)} className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">person_add</span> Add Candidate
              </button>
            </div>

            {showAddCandidate && (
              <form onSubmit={handleAddCandidate} className="bg-surface-container/50 border border-outline/10 rounded-2xl p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-outline mb-1">Matric / Student ID *</label><input className={inputClass} value={cForm.studentId} onChange={e => setCForm(p=>({...p,studentId:e.target.value}))} placeholder="2021/12345" required /></div>
                  <div><label className="block text-xs font-semibold text-outline mb-1">Full Name *</label><input className={inputClass} value={cForm.fullName} onChange={e => setCForm(p=>({...p,fullName:e.target.value}))} placeholder="John Doe" required /></div>
                  <div><label className="block text-xs font-semibold text-outline mb-1">Position *</label><input className={inputClass} value={cForm.position} onChange={e => setCForm(p=>({...p,position:e.target.value}))} placeholder="e.g. President" required /></div>
                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1">Manifesto Summary (Max 150 chars)</label>
                    <input 
                      className={inputClass} 
                      value={cForm.manifestoSummary || ''} 
                      onChange={e => setCForm(p=>({...p,manifestoSummary:e.target.value}))} 
                      placeholder="Short candidate summary" 
                      maxLength={150}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-outline mb-1">Full Manifesto</label>
                    <textarea 
                      className={inputClass} 
                      rows={3}
                      value={cForm.manifesto || ''} 
                      onChange={e => setCForm(p=>({...p,manifesto:e.target.value}))} 
                      placeholder="Detailed candidate manifesto (will only display on candidate profile)" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-outline mb-1">Candidate Profile Image</label>
                    <div className="flex items-center gap-3">
                      {cForm.photoUrl && (
                        <img src={cForm.photoUrl} className="w-12 h-12 rounded-xl object-cover border border-outline/10 shrink-0" alt="Preview" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="text-xs text-outline file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                      {cForm.photoUrl && (
                        <button type="button" onClick={() => setCForm(p=>({...p,photoUrl:''}))} className="text-xs text-error hover:underline font-semibold">Remove</button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddCandidate(false)} className="px-4 py-2 rounded-xl text-sm text-outline border border-outline/20 hover:bg-surface-container transition-colors">Cancel</button>
                  <button type="submit" disabled={cLoading} className="px-4 py-2 rounded-xl text-sm bg-primary text-on-primary font-semibold disabled:opacity-70">{cLoading ? 'Adding...' : 'Add Candidate'}</button>
                </div>
              </form>
            )}

            {candidatesLoading ? (
              <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-12 rounded-xl bg-surface-container animate-pulse"/>)}</div>
            ) : candidates.length === 0 ? (
              <div className="py-8 text-center text-outline text-sm">No candidates added yet.</div>
            ) : (
              <div className="space-y-2">
                {candidates.map(c => (
                  <div key={c.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${c.isDisqualified ? 'border-error/20 bg-error/5' : 'border-outline/10 bg-surface-container/30'}`}>
                    {c.photoUrl ? (
                      <img src={c.photoUrl} className="w-8 h-8 rounded-xl object-cover shrink-0" alt={c.fullName} />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">{c.fullName[0]}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{c.fullName} {c.isDisqualified && <span className="text-error text-xs ml-1">(Disqualified)</span>}</p>
                      <p className="text-xs text-outline">{c.position} · {c.studentId}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {c.isDisqualified ? (
                        <button onClick={() => handleReinstate(c.id)} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Reinstate</button>
                      ) : (
                        <button onClick={() => handleDisqualify(c.id)} className="text-xs px-2 py-1 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors">Disqualify</button>
                      )}
                      <button onClick={() => handleDeleteCandidate(c.id)} className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
