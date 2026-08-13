import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Upload, Camera, ShieldCheck, Lock, Trash2 } from 'lucide-react';

export default function UpiQrModal({ group, onUpdateGroup, onClose }) {
  const [customQrImage, setCustomQrImage] = useState(group?.customQrImage || '');
  const [upiId, setUpiId] = useState(group?.upiId || '');
  const [copied, setCopied] = useState(false);

  // Admin authentication state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showAdminPassModal, setShowAdminPassModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [passError, setPassError] = useState('');

  const adminPasscode = group?.adminPasscode || '1234';

  const handleVerifyAdminPass = (e) => {
    e.preventDefault();
    setPassError('');
    if (adminPassInput.trim() === adminPasscode.trim()) {
      setIsAdminUnlocked(true);
      setShowAdminPassModal(false);
      setAdminPassInput('');
    } else {
      setPassError('Incorrect Admin Passcode. Only committee admins can update QR.');
    }
  };

  // Custom QR Code Screenshot Upload
  const handleQrUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Please select a QR image smaller than 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const uploadedDataUrl = uploadEvent.target.result;
        setCustomQrImage(uploadedDataUrl);
        onUpdateGroup({
          ...group,
          customQrImage: uploadedDataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomQr = () => {
    setCustomQrImage('');
    onUpdateGroup({
      ...group,
      customQrImage: ''
    });
  };

  const handleSaveUpiId = (e) => {
    e.preventDefault();
    onUpdateGroup({
      ...group,
      upiId: upiId.trim()
    });
    alert("UPI ID saved!");
  };

  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span className="badge-pill badge-saffron">
            <QrCode size={14} /> Official Committee UPI QR
          </span>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>
          {group?.name || 'Festival Committee'}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Scan official QR Code using GPay, PhonePe, or Paytm
        </p>

        {/* DISPLAY CUSTOM UPLOADED QR IMAGE */}
        {customQrImage ? (
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            display: 'inline-block',
            border: '3px solid var(--primary-500)',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '16px'
          }}>
            <img 
              src={customQrImage} 
              alt="Official Committee PhonePe/GPay QR" 
              style={{ width: '250px', maxHeight: '280px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
            {upiId && (
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                {upiId}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-input)',
            padding: '30px 20px',
            borderRadius: '16px',
            border: '2px dashed var(--border-color)',
            marginBottom: '16px'
          }}>
            <QrCode size={48} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>No Official QR Uploaded Yet</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Group Admin must unlock and upload the committee PhonePe/GPay QR screenshot.
            </p>
          </div>
        )}

        {/* COPY UPI ID BUTTON */}
        {upiId && (
          <button onClick={handleCopyUpi} className="btn btn-secondary" style={{ width: '100%', marginBottom: '14px', fontSize: '0.8rem' }}>
            {copied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
            {copied ? 'UPI ID Copied!' : `Copy UPI ID: ${upiId}`}
          </button>
        )}

        {/* ADMIN ONLY CONTROLS */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '6px' }}>
          {!isAdminUnlocked ? (
            <button 
              onClick={() => setShowAdminPassModal(true)} 
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.8rem', gap: '6px' }}
            >
              <Lock size={14} style={{ color: 'var(--primary-500)' }} />
              <span>Admin: Upload / Change QR Photo</span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span className="badge-pill badge-green" style={{ fontSize: '0.7rem' }}>
                  <ShieldCheck size={12} /> Admin Mode Unlocked
                </span>
              </div>

              {/* Upload QR File Input */}
              <label className="btn btn-primary" style={{ padding: '10px', fontSize: '0.825rem', gap: '6px', cursor: 'pointer' }}>
                <Camera size={16} />
                <span>{customQrImage ? 'Upload New QR Photo' : 'Upload PhonePe / GPay QR Photo'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleQrUpload} 
                  style={{ display: 'none' }} 
                />
              </label>

              {/* Save UPI ID input */}
              <form onSubmit={handleSaveUpiId} style={{ display: 'flex', gap: '6px' }}>
                <input 
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.8rem' }}
                  placeholder="Committee UPI ID (e.g. 9848022334@ybl)"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.75rem', flexShrink: 0 }}>
                  Save UPI
                </button>
              </form>

              {customQrImage && (
                <button 
                  onClick={handleRemoveCustomQr}
                  className="btn btn-danger"
                  style={{ fontSize: '0.75rem', padding: '6px', gap: '4px' }}
                >
                  <Trash2 size={13} /> Remove QR Image
                </button>
              )}
            </div>
          )}
        </div>

        {/* ADMIN PASSCODE VERIFICATION MODAL */}
        {showAdminPassModal && (
          <div className="modal-overlay" onClick={() => setShowAdminPassModal(false)}>
            <div className="modal-container" style={{ maxWidth: '340px' }} onClick={e => e.stopPropagation()}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                Enter Admin Passcode
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Only committee admins can upload or edit the QR code.
              </p>

              <form onSubmit={handleVerifyAdminPass}>
                <div className="form-group">
                  <input 
                    type="password"
                    className="form-input"
                    placeholder="Enter Admin Passcode (Default: 1234)"
                    value={adminPassInput}
                    onChange={e => setAdminPassInput(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {passError && (
                  <p style={{ color: '#f87171', fontSize: '0.75rem', marginBottom: '10px' }}>
                    {passError}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowAdminPassModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
