import React, { useState, useEffect, useCallback } from 'react';

// Parse a CSV text string into an array of student objects
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''));
  // Normalize header names (case-insensitive)
  const normalize = h => h.toLowerCase().replace(/[\s_-]/g, '');
  const headers = rawHeaders.map(normalize);

  const field = (row, ...keys) => {
    for (const k of keys) {
      const idx = headers.indexOf(normalize(k));
      if (idx !== -1 && row[idx] !== undefined) return row[idx].trim().replace(/\r/g, '');
    }
    return '';
  };

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const row = line.split(',');
    return {
      matricNo: field(row, 'matricNo', 'matric_no', 'matric', 'matricnumber'),
      fullName: field(row, 'fullName', 'full_name', 'name', 'fullname'),
      email: field(row, 'email'),
      faculty: field(row, 'faculty'),
      department: field(row, 'department', 'dept'),
      level: field(row, 'level'),
      status: 'active',
    };
  }).filter(s => s.matricNo && s.fullName);
}

export default function VoterRegistry({ onNavigate }) {
  const [voters, setVoters] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filter states
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');

  // Academic session progression states
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [finalYearCheckboxes, setFinalYearCheckboxes] = useState({ '400': true, '500': true, '600': false });
  const [sessionLoading, setSessionLoading] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);     // DEV: manual add
  const [csvFile, setCsvFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // DEV: blank form state for manual add
  const blankStudent = { matricNo: '', fullName: '', email: '', faculty: '', department: '', level: '' };
  const [addForm, setAddForm] = useState(blankStudent);
  const [addLoading, setAddLoading] = useState(false);


  const fetchVoters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (levelFilter) params.append('level', levelFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (departmentFilter) params.append('department', departmentFilter);
      if (facultyFilter) params.append('faculty', facultyFilter);

      const url = `/api/admin/voters?${params.toString()}`;
      const r = await fetch(url, { credentials: 'include' });
      if (r.status === 401 && onNavigate) {
        onNavigate('logout');
        return;
      }
      const data = await r.json();
      setVoters(data.voters || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search, levelFilter, statusFilter, departmentFilter, facultyFilter, onNavigate]);

  useEffect(() => {
    const timer = setTimeout(fetchVoters, 300);
    return () => clearTimeout(timer);
  }, [fetchVoters]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setPreviewData(parsed);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;
    setUploadLoading(true);
    setError('');

    // Check for duplicate emails inside previewData (CSV duplicate check)
    const emailsInUpload = previewData.map(s => s.email?.trim().toLowerCase()).filter(Boolean);
    const uniqueEmailsInUpload = new Set(emailsInUpload);
    if (emailsInUpload.length !== uniqueEmailsInUpload.size) {
      setError('The uploaded CSV file contains duplicate email addresses. Please remove duplicates.');
      setUploadLoading(false);
      return;
    }

    // Check if any email inside previewData is already registered to a DIFFERENT student in the current voter list
    for (const s of previewData) {
      const email = s.email?.trim().toLowerCase();
      if (email) {
        const isDuplicate = voters.some(v => v.email?.trim().toLowerCase() === email && v.matricNo?.trim().toLowerCase() !== s.matricNo?.trim().toLowerCase());
        if (isDuplicate) {
          setError(`The email address '${s.email}' is already in use by another student in the registry.`);
          setUploadLoading(false);
          return;
        }
      }
    }

    try {
      const r = await fetch('/api/admin/voters/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ students: previewData }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setUploadResult(data);
      fetchVoters();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setCsvFile(null);
    setPreviewData([]);
    setUploadResult(null);
    setError('');
  };

  const handleToggleStatus = async (voter) => {
    const newStatus = voter.status === 'active' ? 'inactive' : 'active';
    setTogglingId(voter.matricNo);
    try {
      const r = await fetch(`/api/admin/voters/${encodeURIComponent(voter.matricNo)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!r.ok) throw new Error('Failed to update');
      setVoters(prev => prev.map(v => v.matricNo === voter.matricNo ? { ...v, status: newStatus } : v));
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setTogglingId(null);
    }
  };

  // DEV: manually add a single eligible student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');

    // Check if email already exists in the currently loaded voters list
    const emailToClean = addForm.email?.trim().toLowerCase();
    const matricToClean = addForm.matricNo?.trim().toLowerCase();
    if (emailToClean) {
      const isEmailDuplicate = voters.some(v => v.email?.trim().toLowerCase() === emailToClean && v.matricNo?.trim().toLowerCase() !== matricToClean);
      if (isEmailDuplicate) {
        setError(`Email address '${addForm.email}' is already in use by another student in the registry.`);
        setAddLoading(false);
        return;
      }
    }

    try {
      const r = await fetch('/api/admin/voters/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ students: [{ ...addForm, status: 'active' }] }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      if (data.failed > 0) {
        const errMsg = data.errors && data.errors[0] ? data.errors[0] : 'Student could not be saved — check all fields.';
        throw new Error(errMsg);
      }
      setSuccess(`${addForm.fullName} added successfully!`);
      setAddForm(blankStudent);
      setShowAddModal(false);
      fetchVoters();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleAdvanceSession = async () => {
    const selectedLevels = Object.keys(finalYearCheckboxes).filter(lvl => finalYearCheckboxes[lvl]);
    if (selectedLevels.length === 0) {
      setError('Please select at least one final year level to graduate.');
      return;
    }
    
    const confirmMsg = `WARNING: Are you sure you want to complete the current academic session?\n\nThis will:\n1. Graduate all active students in levels: ${selectedLevels.join(', ')} (status set to Alumni).\n2. Automatically increment the level of all other active students by 100.\n\nThis action CANNOT be undone. Proceed?`;
    if (!window.confirm(confirmMsg)) return;

    setSessionLoading(true);
    setError('');
    try {
      const r = await fetch('/api/admin/academic/advance-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ finalYearLevels: selectedLevels }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setSuccess('Academic session completed and student levels advanced successfully!');
      setShowSessionModal(false);
      fetchVoters();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Voter Registry</h2>
          <p className="text-sm text-outline">Manage eligible student voters. Upload CSV lists and control access.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* DEV ONLY — remove this button before production */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2.5 rounded-xl font-semibold hover:bg-secondary/20 transition-all flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Add Student
            <span className="text-[10px] font-bold bg-secondary text-white px-1.5 py-0.5 rounded-md ml-1">DEV</span>
          </button>
          <button
            onClick={() => setShowSessionModal(true)}
            className="bg-primary/10 text-primary border border-primary/20 px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/20 transition-all flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">update</span>
            Academic Session
          </button>
          <button onClick={() => setShowUploadModal(true)} className="bg-surface-container text-on-surface border border-outline/20 px-5 py-2.5 rounded-xl font-semibold hover:bg-surface-variant transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">upload_file</span> Upload CSV
          </button>
        </div>
      </div>

      {success && <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{success}</div>}
      {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{error}</div>}

      <div className="glass-card rounded-2xl overflow-hidden border border-outline/20 flex flex-col">
        <div className="p-4 border-b border-outline/20 bg-surface/50 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-grow max-w-xl">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="text"
                placeholder="Search by Matric No or Name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface-container border border-outline/20 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-outline font-medium whitespace-nowrap">
                Total Eligible: <span className="text-on-surface font-bold">{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-outline/10">
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Filter Level</label>
              <select
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
                className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">All Levels</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="600">600 Level</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Filter Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Filter Department</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Filter Faculty</label>
              <input
                type="text"
                placeholder="e.g. Science"
                value={facultyFilter}
                onChange={e => setFacultyFilter(e.target.value)}
                className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl bg-surface-container animate-pulse" />)}</div>
        ) : voters.length === 0 ? (
          <div className="p-12 text-center"><span className="material-symbols-outlined text-5xl text-outline/30">group_off</span><p className="text-outline mt-2 text-sm">{search ? 'No voters found matching your search.' : 'No voters uploaded yet. Upload a CSV to get started.'}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container/30 text-outline border-b border-outline/20">
                <tr>
                  <th className="px-6 py-4 font-semibold">Matric No</th>
                  <th className="px-6 py-4 font-semibold">Full Name</th>
                  <th className="px-6 py-4 font-semibold">Faculty / Dept</th>
                  <th className="px-6 py-4 font-semibold">Level</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {voters.map(voter => (
                  <tr key={voter.matricNo} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-on-surface">{voter.matricNo}</td>
                    <td className="px-6 py-4 font-medium text-on-surface">{voter.fullName}</td>
                    <td className="px-6 py-4 text-outline text-xs"><div>{voter.faculty}</div><div className="text-[11px]">{voter.department}</div></td>
                    <td className="px-6 py-4 text-outline">{voter.level}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${voter.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                        {voter.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(voter)}
                        disabled={togglingId === voter.matricNo}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50 ${voter.status === 'active' ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                      >
                        {togglingId === voter.matricNo ? '...' : voter.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline/20 rounded-3xl p-7 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-surface">Upload Voter Registry</h3>
              <button onClick={closeUploadModal} className="text-outline hover:text-on-surface p-1"><span className="material-symbols-outlined">close</span></button>
            </div>

            {uploadResult ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-5xl text-primary mb-4">check_circle</span>
                <h4 className="text-xl font-bold text-on-surface">Import Complete</h4>
                <p className="text-outline mt-2">{uploadResult.message}</p>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="bg-primary/10 text-primary px-6 py-3 rounded-xl text-center"><div className="text-2xl font-bold">{uploadResult.succeeded}</div><div className="text-xs">Imported</div></div>
                  {uploadResult.failed > 0 && <div className="bg-error/10 text-error px-6 py-3 rounded-xl text-center"><div className="text-2xl font-bold">{uploadResult.failed}</div><div className="text-xs">Failed</div></div>}
                </div>
                <button onClick={closeUploadModal} className="mt-6 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">Done</button>
              </div>
            ) : (
              <>
                <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl text-sm mb-6">
                  <strong>CSV Required Headers:</strong> matricNo, fullName, email, faculty, department, level
                  <div className="text-xs mt-1 text-primary/70">Column names are flexible — matric_no, name, dept, etc. are also recognised.</div>
                </div>

                <label className="border-2 border-dashed border-outline/30 rounded-2xl p-10 flex flex-col items-center justify-center bg-surface-container/30 mb-4 transition-colors hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                  <span className="material-symbols-outlined text-4xl text-outline mb-3">upload_file</span>
                  <p className="font-semibold text-on-surface">{csvFile ? csvFile.name : 'Click to select CSV file'}</p>
                  <p className="text-xs text-outline mt-1">Comma-separated values (.csv)</p>
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                </label>

                {previewData.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-on-surface">{previewData.length} students detected — preview (first 3):</p>
                    </div>
                    <div className="bg-surface-container/50 rounded-xl border border-outline/10 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-surface-container text-outline border-b border-outline/10">
                          <tr><th className="px-3 py-2 text-left">Matric</th><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Dept</th><th className="px-3 py-2 text-left">Level</th></tr>
                        </thead>
                        <tbody className="divide-y divide-outline/5">
                          {previewData.slice(0, 3).map((s, i) => (
                            <tr key={i} className="text-on-surface">
                              <td className="px-3 py-2 font-mono">{s.matricNo}</td>
                              <td className="px-3 py-2">{s.fullName}</td>
                              <td className="px-3 py-2 truncate max-w-[120px]">{s.email}</td>
                              <td className="px-3 py-2">{s.department}</td>
                              <td className="px-3 py-2">{s.level}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">error</span>{error}</div>}

                <div className="flex justify-end gap-3">
                  <button onClick={closeUploadModal} className="px-6 py-2.5 rounded-xl font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
                  <button
                    onClick={handleUpload}
                    disabled={previewData.length === 0 || uploadLoading}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploadLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                    {uploadLoading ? 'Importing...' : `Import ${previewData.length} Students`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* DEV ONLY — Manual Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline/20 rounded-3xl p-7 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-on-surface">Add Eligible Student</h3>
              <button onClick={() => { setShowAddModal(false); setError(''); }} className="text-outline hover:text-on-surface p-1"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full mb-5">
              <span className="material-symbols-outlined text-[14px]">construction</span> DEV ONLY — Remove before production
            </div>

            {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">error</span>{error}</div>}

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1">Matric No *</label>
                  <input className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.matricNo} onChange={e => setAddForm(p => ({...p, matricNo: e.target.value}))} placeholder="2021/12345" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1">Full Name *</label>
                  <input className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.fullName} onChange={e => setAddForm(p => ({...p, fullName: e.target.value}))} placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1">Email *</label>
                  <input type="email" className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.email} onChange={e => setAddForm(p => ({...p, email: e.target.value}))} placeholder="student@uni.edu" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1">Faculty *</label>
                  <input className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.faculty} onChange={e => setAddForm(p => ({...p, faculty: e.target.value}))} placeholder="Science" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1">Department *</label>
                  <input className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.department} onChange={e => setAddForm(p => ({...p, department: e.target.value}))} placeholder="Computer Science" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1">Level *</label>
                  <input className="w-full bg-surface-container border border-outline/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.level} onChange={e => setAddForm(p => ({...p, level: e.target.value}))} placeholder="400L" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setError(''); }} className="flex-1 py-3 rounded-xl font-semibold text-on-surface border border-outline/20 hover:bg-surface-container transition-colors">Cancel</button>
                <button type="submit" disabled={addLoading} className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {addLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : null}
                  {addLoading ? 'Saving...' : 'Add to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline/20 rounded-3xl p-7 w-full max-w-lg shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-on-surface">Manage Academic Session</h3>
              <button onClick={() => { setShowSessionModal(false); setError(''); }} className="text-outline hover:text-on-surface p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl text-xs mb-6 space-y-2">
              <p className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">info</span> About Session Progression:
              </p>
              <p className="leading-relaxed">
                Completing the academic session will automatically advance all active students by 100 level (e.g. 100 &rarr; 200, 300 Level &rarr; 400 Level).
              </p>
              <p className="leading-relaxed">
                Students currently in their final year will be updated to <strong>Alumni</strong> status, restricting them from voting in future elections.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">
                  Select Final Year Levels to Graduate (Alumni):
                </label>
                <div className="space-y-2">
                  {['400', '500', '600'].map(lvl => (
                    <label key={lvl} className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline/10 hover:border-primary/30 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={finalYearCheckboxes[lvl] || false}
                        onChange={e => setFinalYearCheckboxes(p => ({ ...p, [lvl]: e.target.checked }))}
                        className="rounded border-outline/30 text-primary focus:ring-primary w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-on-surface">{lvl} Level / {lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">error</span>{error}</div>}

              <div className="flex gap-3 pt-4 border-t border-outline/10">
                <button
                  type="button"
                  onClick={() => { setShowSessionModal(false); setError(''); }}
                  className="flex-1 py-3 rounded-xl font-semibold text-on-surface border border-outline/20 hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdvanceSession}
                  disabled={sessionLoading}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-75 flex items-center justify-center gap-2"
                >
                  {sessionLoading ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : <span className="material-symbols-outlined text-[18px]">update</span>}
                  {sessionLoading ? 'Advancing...' : 'Complete Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
