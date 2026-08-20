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
  Database,
  FileText,
  Globe,
  Copy,
  Check,
  Share2,
  Camera,
  Bell,
  BellOff
} from 'lucide-react';
import { FESTIVAL_TYPES } from '../utils/storage';
import { generateFinancialStatementPDF } from '../utils/pdfStatement';
import {
  syncGroupToFirestoreResult,
  registerPushToken,
  unregisterPushToken,
  getStoredPushToken,
  isPushConfigured
} from '../firebase';
import { downscaleImageFile, downscaleDataUrl, dataUrlBytes } from '../utils/image';

export default function ReportsSettings({
  group,
  onUpdateGroup,
  onDeleteGroup,
  allGroupsMap,
  onReplaceAllGroups,
  onRefreshCloudSync,
  currentUser,
  isAdmin
}) {
  const [name, setName] = useState(group?.name || '');
  const [address, setAddress] = useState(group?.address || '');
  const [profilePic, setProfilePic] = useState(group?.profilePic || '');
  const [festivalType, setFestivalType] = useState(group?.festivalType || 'vinayaka_chavithi');
  const [targetGoal, setTargetGoal] = useState(group?.targetGoal || 75000);
  const [upiId, setUpiId] = useState(group?.upiId || '');
  const [adminPasscode, setAdminPasscode] = useState(group?.adminPasscode || '1234');
  const [savedMsg, setSavedMsg] = useState('');
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Please select an image smaller than 8MB.");
      return;
    }
    try {
      setProfilePic(await downscaleImageFile(file));
    } catch (err) {
      alert(err.message);
    }
  };

  const publicTransparencyUrl = `${window.location.origin}/?public=${group?.code}`;

  // The public link only works for other people if the group has actually
  // reached the cloud — a locally-only group renders as "Report Not Found" on
  // every device but this one. So publish first, then hand out the link.
  const [publishState, setPublishState] = useState(null); // null | 'publishing' | 'ok' | 'failed'
  const [publishError, setPublishError] = useState(null);
  const [logoRepaired, setLogoRepaired] = useState(false);
  const isLocalhostLink = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$)/i.test(window.location.origin);
  const hasCode = !!group?.code;
  const logoKB = Math.round(dataUrlBytes(group?.profilePic) / 1024);

  // Per-device push notification opt-in
  const [pushEnabled, setPushEnabled] = useState(!!getStoredPushToken());
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState(null);
  // The Web Push key is a build constant, so there is nothing to configure
  // here — members only ever tap Enable.
  const pushConfigured = isPushConfigured();

  const handleEnablePush = async () => {
    setPushBusy(true);
    setPushError(null);
    const { ok, error } = await registerPushToken(group, currentUser?.displayName || '');
    setPushEnabled(ok);
    setPushError(ok ? null : error);
    setPushBusy(false);
  };

  const handleDisablePush = async () => {
    setPushBusy(true);
    await unregisterPushToken();
    setPushEnabled(false);
    setPushError(null);
    setPushBusy(false);
  };


  const publishReport = async () => {
    if (!group?.id) return false;
    setPublishState('publishing');

    let result = await syncGroupToFirestoreResult(group);

    // Groups saved before logo uploads were downscaled carry a multi-MB logo
    // that blocks every sync. Repair it in place rather than asking the admin
    // to hunt down and re-upload the image themselves.
    if (!result.ok && result.error === 'too-large' && group.profilePic) {
      try {
        const shrunk = await downscaleDataUrl(group.profilePic);
        if (shrunk && shrunk.length < group.profilePic.length) {
          const repaired = { ...group, profilePic: shrunk };
          const retry = await syncGroupToFirestoreResult(repaired);
          if (retry.ok) {
            // Only persist once we know it actually resolved the problem.
            onUpdateGroup(repaired);
            setProfilePic(shrunk);
            setLogoRepaired(true);
          }
          result = retry;
        }
      } catch (err) {
        console.warn('Could not shrink the stored logo:', err);
      }
    }

    setPublishError(result.ok ? null : { error: result.error, detail: result.detail });
    setPublishState(result.ok ? 'ok' : 'failed');
    return result.ok;
  };

  const handleCopyPublicLink = async () => {
    await publishReport();
    navigator.clipboard.writeText(publicTransparencyUrl);
    setPublicLinkCopied(true);
    setTimeout(() => setPublicLinkCopied(false), 2500);
  };

  const handleSharePublicLink = async () => {
    await publishReport();
    const text = encodeURIComponent(
      `🚩 *${group?.name || 'ChandaBook'} - Public Chanda Report* 🚩\n` +
      `View live donation totals & expenses (no login needed):\n${publicTransparencyUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateFinancialStatementPDF(group);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Delete Group Admin Passcode Verification State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passErr, setPassErr] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    onUpdateGroup({
      ...group,
      name: name.trim(),
      address: address.trim(),
      profilePic,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <label style={{ position: 'relative', display: 'block', width: '64px', height: '64px', cursor: 'pointer', flexShrink: 0 }}>
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Committee Logo"
                  style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--primary-500)' }}
                />
              ) : (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'var(--bg-input)',
                  border: '2px dashed var(--primary-500)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-500)'
                }}>
                  <Camera size={20} />
                </div>
              )}
              {isAdmin && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              )}
            </label>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Committee Logo</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'Tap to upload. Shown on official PDF statements.' : 'Shown on official PDF statements.'}
              </p>
            </div>
          </div>

          {!isAdmin && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '8px',
              color: '#eab308',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Lock size={15} /> Only Group Admins can edit committee settings and details.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Committee Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={!isAdmin}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Committee / Pandal Address</label>
            <textarea
              rows="2"
              className="form-textarea"
              placeholder="e.g. Lotus Apartments, MG Road, Hyderabad - 500081"
              value={address}
              onChange={e => setAddress(e.target.value)}
              disabled={!isAdmin}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Festival Event Type</label>
              <select 
                className="form-input"
                value={festivalType}
                onChange={e => setFestivalType(e.target.value)}
                disabled={!isAdmin}
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
                disabled={!isAdmin}
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
                disabled={!isAdmin}
              />
            </div>

            {isAdmin && (
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
            )}
          </div>

          {savedMsg && (
            <p style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
              {savedMsg}
            </p>
          )}

          {isAdmin && (
            <button type="submit" className="btn btn-primary" style={{ gap: '6px', alignSelf: 'flex-start' }}>
              <Save size={16} /> Save Group Settings
            </button>
          )}
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

          <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="btn btn-secondary" style={{ padding: '14px', gap: '8px' }}>
            <FileText size={18} style={{ color: '#f59e0b' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{isGeneratingPdf ? 'Generating...' : 'Official PDF Statement'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Signed handover-ready report</div>
            </div>
          </button>

          <button onClick={handleBackupJSON} className="btn btn-secondary" style={{ padding: '14px', gap: '8px' }}>
            <Download size={18} style={{ color: 'var(--primary-500)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Backup Full Database</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>JSON backup file</div>
            </div>
          </button>

          {isAdmin && (
            <label className="btn btn-secondary" style={{ padding: '14px', gap: '8px', cursor: 'pointer' }}>
              <Upload size={18} style={{ color: '#06b6d4' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Restore Backup</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Upload JSON database</div>
              </div>
              <input type="file" accept=".json" onChange={handleRestoreJSON} style={{ display: 'none' }} />
            </label>
          )}
        </div>
      </div>

      {/* COMMITTEE ACTIVITY NOTIFICATIONS */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: '#a78bfa' }} /> Committee Activity Alerts
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Push a notification to every opted-in member's phone whenever a new chanda or expense is recorded — even when the app is closed. Each member enables this on their own device.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {pushEnabled ? (
            <button onClick={handleDisablePush} disabled={pushBusy} className="btn btn-secondary" style={{ gap: '6px' }}>
              <BellOff size={16} /> {pushBusy ? 'Working...' : 'Turn Off On This Device'}
            </button>
          ) : (
            <button onClick={handleEnablePush} disabled={pushBusy || !pushConfigured} className="btn btn-primary" style={{ gap: '6px' }}>
              <Bell size={16} /> {pushBusy ? 'Enabling...' : 'Enable On This Device'}
            </button>
          )}
          {pushEnabled && (
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
              ✅ This device will receive alerts
            </span>
          )}
        </div>

        {pushError && (
          <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '12px' }}>
            {{
              'no-vapid-key': 'Push notifications are not configured in this build of the app. This is a deployment setting, not something you can fix here — contact whoever manages the app.',
              'denied': 'Your browser blocked notifications. Allow them for this site in the browser address-bar settings, then try again.',
              'unsupported': 'This browser does not support push notifications. On iPhone, add the app to your Home Screen first — iOS only allows push for installed web apps.',
              'no-token': 'Could not obtain a device token from Google. Try again in a moment.',
              'permission-denied': 'The database rejected the device registration — deploy the updated Firestore rules (firebase deploy --only firestore:rules).',
              'offline': 'Could not reach the server. Check your connection and try again.',
              'not-configured': 'No cloud database is configured for this build.',
              'unknown': 'Could not enable notifications. Check the browser console for details.'
            }[pushError] || 'Could not enable notifications.'}
          </p>
        )}

      </div>

      {/* PUBLIC TRANSPARENCY REPORT */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} style={{ color: '#06b6d4' }} /> Public Transparency Report
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Share this read-only link with the whole colony. It shows totals, expenses & top contributor amounts — never donor phone numbers or addresses. No login required to view.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleCopyPublicLink} disabled={!hasCode || publishState === 'publishing'} className="btn btn-secondary" style={{ gap: '6px' }}>
            {publicLinkCopied ? <Check size={16} style={{ color: '#34d399' }} /> : <Copy size={16} />}
            {publishState === 'publishing' ? 'Publishing...' : publicLinkCopied ? 'Link Copied!' : 'Copy Public Link'}
          </button>
          <button onClick={handleSharePublicLink} disabled={!hasCode || publishState === 'publishing'} className="btn btn-whatsapp" style={{ gap: '6px' }}>
            <Share2 size={16} /> Share on WhatsApp
          </button>
        </div>

        {!hasCode && (
          <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '12px' }}>
            This group has no 6-digit code yet, so a public report link can't be created. Re-create the group, or restore it from a backup that includes its code.
          </p>
        )}

        {publishState === 'failed' && (
          <div style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '12px' }}>
            <p style={{ fontWeight: 700 }}>
              ⚠️ Could not publish this report — the link will show “Couldn't Load Report” for everyone else.
            </p>
            <p style={{ marginTop: '6px' }}>
              {{
                'too-large': logoKB > 200
                  ? `This group's data is ${publishError?.detail || 'too big'}, over Firestore's 1 MB per-group limit, and the committee logo accounts for ~${logoKB} KB of it. Automatic compression didn't bring it under — remove the logo above, then save and try again.`
                  : `This group's data is ${publishError?.detail || 'too big'}, over Firestore's 1 MB per-group limit. The logo is only ~${logoKB} KB, so the donation and expense records are the bulk — export a CSV backup, then delete some older records to publish again.`,
                'permission-denied': 'The cloud database is rejecting the write. The Firestore security rules likely have not been deployed yet — run: npx firebase-tools deploy --only firestore:rules',
                'offline': 'Could not reach the server. Check your internet connection, then press Refresh Cloud Sync above.',
                'not-configured': 'No cloud database is configured for this app build, so reports cannot be published.',
                'unknown': 'An unexpected error occurred while publishing. Check the browser console for details.'
              }[publishError?.error] || 'An unexpected error occurred while publishing.'}
            </p>
          </div>
        )}

        {publishState === 'ok' && (
          <p style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '12px' }}>
            ✅ Report published to the cloud — this link now works on any device.
            {logoRepaired && ' Your oversized committee logo was compressed automatically to fit.'}
          </p>
        )}

        {isLocalhostLink && (
          <p style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '12px' }}>
            ⚠️ You're viewing the app on <strong>{window.location.origin}</strong>, so the copied link points at this computer only and won't open for anyone else. Share links from your deployed site instead.
          </p>
        )}
      </div>

      {/* DANGER ZONE: DELETE GROUP */}
      {isAdmin && (
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
      )}

      {/* DELETE GROUP PASSCODE MODAL */}
      {isAdmin && showDeleteModal && (
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
