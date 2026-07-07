import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon, subtitle, colorClass, loading }) => (
  <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-lg">
    <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      {loading ? (
        <div className="h-8 w-16 bg-surface-container animate-pulse rounded-lg mb-1" />
      ) : (
        <p className="text-2xl font-bold text-on-surface">{value}</p>
      )}
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xs text-outline font-medium">{title}</p>
        {subtitle && <span className="text-xs font-semibold text-primary flex items-center gap-1">{subtitle}</span>}
      </div>
    </div>
  </div>
);

export default function Overview({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loading} title="Active Elections" value={stats?.activeElections ?? 0} icon="event_available" colorClass="bg-primary/10 text-primary"
          subtitle={stats?.activeElections > 0 ? <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span> Live</> : null}
        />
        <StatCard loading={loading} title="Total Registered Voters" value={stats?.totalVoters?.toLocaleString() ?? 0} icon="group" colorClass="bg-secondary/20 text-secondary" />
        <StatCard loading={loading} title="Votes Cast Today" value={stats?.votesToday?.toLocaleString() ?? 0} icon="how_to_vote" colorClass="bg-tertiary/10 text-tertiary" />
        <StatCard loading={loading} title="Upcoming Elections" value={stats?.upcomingElections ?? 0} icon="calendar_month" colorClass="bg-outline/10 text-outline" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-on-surface mb-6">Commission Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: 'add_circle', color: 'bg-primary/10 text-primary', label: 'New Election', desc: 'Draft a new school or faculty election.', tab: 'elections' },
              { icon: 'upload_file', color: 'bg-secondary/10 text-secondary', label: 'Upload Registry', desc: 'Import new student voters via CSV.', tab: 'voters' },
              { icon: 'gavel', color: 'bg-error/10 text-error', label: 'Manage Candidates', desc: 'Review or disqualify candidates.', tab: 'elections' },
              { icon: 'print', color: 'bg-tertiary/10 text-tertiary', label: 'View Results', desc: 'View and export official results.', tab: 'results' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.tab)}
                className="flex items-start gap-4 p-4 rounded-xl border border-outline/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <div className={`${action.color} p-2 rounded-lg`}>
                  <span className="material-symbols-outlined">{action.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">{action.label}</p>
                  <p className="text-xs text-outline mt-1">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <div className="relative flex items-center justify-center w-24 h-24 mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="material-symbols-outlined text-4xl text-primary">cloud_done</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">System Healthy</h3>
          <p className="text-sm text-outline mt-2">Server connection and database are fully operational.</p>
        </div>
      </div>
    </div>
  );
}
