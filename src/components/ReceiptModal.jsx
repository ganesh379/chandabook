import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ImageIcon,
  ShieldCheck
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { FESTIVAL_TYPES } from '../utils/storage';

export default function ReceiptModal({ collection, group, onClose }) {
  const receiptRef = useRef(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [objectUrl, setObjectUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [copiedImage, setCopiedImage] = useState(false);
  const [shareErrorMsg, setShareErrorMsg] = useState('');

  if (!collection) return null;

  const activeFestival = FESTIVAL_TYPES.find(f => f.id === group?.festivalType) || FESTIVAL_TYPES[0];

  // Number to Words converter
  const numberToWords = (price) => {
    const num = Number(price);
    if (!num || isNaN(num)) return 'Zero Rupees Only';
    const sgl = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const dbl = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const inWords = (n) => {
      if (n < 20) return sgl[n];
      if (n < 100) return dbl[Math.floor(n / 10)] + (n % 10 ? ' ' + sgl[n % 10] : '');
      if (n < 1000) return sgl[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    };

    return inWords(num) + ' Rupees Only';
  };

  const formattedWords = numberToWords(collection.amount);

  // Memory-safe canvas rendering using Object URLs
  useEffect(() => {
    let isMounted = true;
    let createdUrl = '';

    const renderReceiptImage = async () => {
      if (!receiptRef.current) return;
      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 1.5, // Lightweight high-quality scale (prevents memory crash)
          useCORS: true,
          backgroundColor: '#0f172a',
          logging: false
        });

        if (!isMounted) return;

        canvas.toBlob((blob) => {
          if (isMounted && blob) {
            createdUrl = URL.createObjectURL(blob);
            setObjectUrl(createdUrl);
            setImageBlob(blob);
            setIsGenerating(false);
          }
        }, 'image/png', 0.92);
      } catch (err) {
        console.error("Receipt Image render note:", err);
        if (isMounted) setIsGenerating(false);
      }
    };

    const timer = setTimeout(renderReceiptImage, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [collection]);

  // Instant Native File Share
  const handleSharePhoto = async () => {
    setShareErrorMsg('');
    if (!imageBlob) {
      alert("Receipt photo is generating, please wait a second...");
      return;
    }

    try {
      const fileName = `Receipt_${collection.receiptNo}_${(collection.donorName || 'Donor').replace(/\s+/g, '_')}.png`;
      const file = new File([imageBlob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Receipt #${collection.receiptNo} - ${group?.name || 'ChandaBook'}`,
          text: `Official Chanda Receipt for ${collection.donorName} (${group?.currency || '₹'}${Number(collection.amount).toLocaleString('en-IN')})`,
          files: [file]
        });
      } else {
        handleDownloadPhoto();
        setShareErrorMsg('Photo saved to downloads! You can attach it in WhatsApp.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        handleDownloadPhoto();
        setShareErrorMsg('Receipt photo downloaded!');
      }
    }
  };

  // Download PNG Photo
  const handleDownloadPhoto = () => {
    if (!objectUrl && !imageBlob) return;
    const url = objectUrl || URL.createObjectURL(imageBlob);
    const link = document.createElement('a');
    link.download = `Chanda_Receipt_${collection.receiptNo}_${(collection.donorName || 'Donor').replace(/\s+/g, '_')}.png`;
    link.href = url;
    link.click();
  };

  // Copy PNG Photo
  const handleCopyPhoto = async () => {
    if (!imageBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': imageBlob })
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 3000);
    } catch (err) {
      handleDownloadPhoto();
      alert("Photo downloaded to device!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: '8px' }}>
      <div className="modal-container" style={{ maxWidth: '480px', padding: '16px 14px' }} onClick={e => e.stopPropagation()}>
        {/* Header Controls */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="badge-pill badge-saffron" style={{ fontSize: '0.7rem' }}>
              <ImageIcon size={13} /> Official Photo Receipt
            </span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}><X size={16} /></button>
        </div>

        {/* RECEIPT CARD CONTAINER */}
        <div 
          ref={receiptRef}
          className="printable-area"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            padding: '16px 14px',
            color: '#ffffff',
            position: 'relative',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
            boxSizing: 'border-box',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Verified Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '3px 8px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#0f172a',
            fontSize: '0.6rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            <ShieldCheck size={11} /> VERIFIED
          </div>

          {/* Title & Branding */}
          <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(245, 158, 11, 0.4)', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '2px' }}>
              {activeFestival.icon}
            </div>
            <h2 style={{ 
              fontSize: '1.15rem', 
              fontFamily: 'var(--font-heading)',
              color: '#fbbf24', 
              textTransform: 'uppercase', 
              fontWeight: 800,
              padding: '0 40px'
            }}>
              {group?.name || 'Festival Committee'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
              {activeFestival.name} • Official Chanda Receipt
            </p>
          </div>

          {/* Receipt No & Date Row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '0.78rem', 
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '12px'
          }}>
            <div>
              Receipt No: <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>#{collection.receiptNo}</strong>
            </div>
            <div>
              Date: <strong style={{ color: '#ffffff' }}>{collection.date}</strong>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Donor Name:</span>
              <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{collection.donorName}</strong>
            </div>

            {collection.address && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Address / Flat:</span>
                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{collection.address}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Payment Mode:</span>
              <span className="badge-pill badge-saffron" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                {collection.paymentMode}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8', flexShrink: 0 }}>Amount in Words:</span>
              <span style={{ fontStyle: 'italic', fontSize: '0.78rem', color: '#fbbf24', textAlign: 'right', fontWeight: 600 }}>
                {formattedWords}
              </span>
            </div>

            {/* Total Amount Box */}
            <div style={{
              marginTop: '8px',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.15))',
              border: '1.5px solid #f59e0b',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.78rem', color: '#fbbf24' }}>
                AMOUNT RECEIVED
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399' }}>
                {group?.currency || '₹'}{Number(collection.amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Footer Signature */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginTop: '16px', 
            paddingTop: '10px', 
            borderTop: '1px dashed rgba(255, 255, 255, 0.15)', 
            fontSize: '0.725rem', 
            color: '#94a3b8' 
          }}>
            <div>
              <p style={{ color: '#fbbf24', fontWeight: 600 }}>🙏 May Lord Ganesha bless your family!</p>
              <p style={{ fontSize: '0.65rem', marginTop: '2px', color: '#64748b' }}>Digital Verification • ChandaBook</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.8rem' }}>{collection.collectedBy}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Authorized Collector</div>
            </div>
          </div>
        </div>

        {shareErrorMsg && (
          <p style={{ fontSize: '0.78rem', color: '#fbbf24', textAlign: 'center', marginTop: '8px' }}>
            {shareErrorMsg}
          </p>
        )}

        {/* SHARE CONTROLS */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
          <button 
            onClick={handleSharePhoto}
            disabled={isGenerating}
            className="btn btn-whatsapp"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            <Share2 size={18} />
            {isGenerating ? 'Preparing Photo Receipt...' : 'Share Receipt Photo on WhatsApp'}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            <button 
              onClick={handleDownloadPhoto}
              disabled={isGenerating}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '8px 4px' }}
            >
              <Download size={14} /> Download
            </button>

            <button 
              onClick={handleCopyPhoto}
              disabled={isGenerating}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '8px 4px' }}
            >
              {copiedImage ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
              {copiedImage ? 'Copied!' : 'Copy Photo'}
            </button>

            <button 
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '8px 4px' }}
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
