import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Save, 
  Lock, 
  AlertTriangle,
  Building2,
  Database
} from 'lucide-react';
import { FESTIVAL_TYPES } from '../utils/storage';

export default function ReportsSettings({ 
  group, 
  onUpdateGroup, 
  onDeleteGroup, 
  allGroupsMap, 
  onReplaceAllGroups,
  onRefreshCloudSync 
}) {
  const [name, setName] = useState(group?.name || '');
  const [festivalType, setFestivalType] = useState(group?.festivalType || 'vinayaka_chavithi');
  const [targetGoal, setTargetGoal] = useState(group?.targetGoal || 75000);
  const [upiId, setUpiId] = useState(group?.upiId || '');
  const [adminPasscode, setAdminPasscode] = useState(group?.adminPasscode || '1234');
  const [savedMsg, setSavedMsg] = useState('');

  // Delete Group Admin Passcode Verification State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passErr, setPassErr] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    onUpdateGroup({
      ...group,
      name: name.trim(),
      festivalType,
      targetGoal: Number(targetGoal) || 0,
      upiId: upiId.trim(),
      adminPasscode: adminPasscode.trim()
    });
    setSavedMsg("Group Settings & Admin Passcode Updated!");
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleExportCSV = () => {
    if (!group?.collections || group.collections.length === 0) {
      alert("No donation collections to export.");
      return;
    }

    const headers = ["Receipt No", "Donor Name", "Phone", "Address", "Amount (INR)", "Payment Mode", "Collected By", "Date", "Notes"];
    const rows = group.collections.map(c => [
      c.receiptNo,
      `"${c.donorName.replace(/"/g, '""')}"`,
      c.phone || '',
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.amount,
      c.paymentMode,
      `"${(c.collectedBy || '').replace(/"/g, '""')}"`,
      c.date,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${group.name.replace(/\s+/g, '_')}_Collections_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allGroupsMap, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `ChandaBook_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreJSON = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && typeof parsed === 'object') {
            onReplaceAllGroups(parsed);
            alert("Database Backup Restored Successfully!");
          } else {
            alert("Invalid backup file format.");
          }
        } catch (err) {
          alert("Error parsing JSON backup file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmDeleteGroup = (e) => {
    e.preventDefault();
    setPassErr('');
    if (passInput.trim() === (group?.adminPasscode || '1234')) {
      onDeleteGroup(group.id);
      setShowDeleteModal(false);
    } else {
      setPassErr('Incorrect Admin Passcode!');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800 }}>Group Settings & Data Export</h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Manage committee details, export reports to CSV/Excel, and control admin passcodes
        </p>
      </div>

      {/* EDIT GROUP DETAILS FORM */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} style={{ color: 'var(--primary-500)' }} /> Committee Group Profile
        </h3>

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Committee Name</label>
            <input 
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Festival Event Type</label>
              <select 
                className="form-input"
                value={festivalType}
                onChange={e => setFestivalType(e.target.value)}
              >
                {FESTIVAL_TYPES.map(f => (
                  <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Budget Goal (₹)</label>
              <input 
                type="number"
                className="form-input"
                value={targetGoal}
                onChange={e => setTargetGoal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Committee UPI ID (For GPay / PhonePe QR)</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. 9848022334@ybl"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Passcode (Security)</label>
              <input 
                type="password"
                className="form-input"
                value={adminPasscode}
                onChange={e => setAdminPasscode(e.target.value)}
                required
              />
            </div>
          </div>

          {savedMsg && (
            <p style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
              {savedMsg}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ gap: '6px', alignSelf: 'flex-start' }}>
            <Save size={16} /> Save Group Settings
          </button>
        </form>
      </div>

      {/* EXPORT & BACKUP */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} style={{ color: '#34d399' }} /> Data Export & Backup
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary" style={{ padding: '14px', gap: '8px' }}>
            <Download size={18} style={{ color: '#34d399' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Export Excel / CSV</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Download donor spreadsheet</div>
            </div>
          </button>

          <button onClick={handleBackupJSON} className="btn btn-secondary" style={{ padding: '14px', gap: '8px' }}>
            <Download size={18} style={{ color: 'var(--primary-500)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Backup Full Database</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>JSON backup file</div>
            </div>
          </button>

          <label className="btn btn-secondary" style={{ padding: '14px', gap: '8px', cursor: 'pointer' }}>
            <Upload size={18} style={{ color: '#06b6d4' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Restore Backup</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Upload JSON database</div>
            </div>
            <input type="file" accept=".json" onChange={handleRestoreJSON} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* DANGER ZONE: DELETE GROUP */}
      <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(248, 113, 113, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} /> Admin Danger Zone
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Permanently delete this festival group, all volunteer collection records, and daily expense logs.
        </p>

        <button 
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-danger"
          style={{ gap: '6px' }}
        >
          <Trash2 size={16} /> Delete Entire Group (Admin Only)
        </button>
      </div>

      {/* DELETE GROUP PASSCODE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container" style={{ maxWidth: '360px' }} onClick={e => e.stopPropagation()}>
            <h4 style={{ fontSize: '1.1rem', color: '#f87171', marginBottom: '6px' }}>
              Confirm Group Deletion
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Enter the Admin Passcode to permanently delete "{group.name}".
            </p>

            <form onSubmit={handleConfirmDeleteGroup}>
              <div className="form-group">
                <input 
                  type="password"
                  className="form-input"
                  placeholder="Enter Admin Passcode (Default: 1234)"
                  value={passInput}
                  onChange={e => setPassInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {passErr && (
                <p style={{ color: '#f87171', fontSize: '0.75rem', marginBottom: '10px' }}>
                  {passErr}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>
                  Delete Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
