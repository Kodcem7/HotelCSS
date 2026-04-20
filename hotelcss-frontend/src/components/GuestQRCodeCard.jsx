import { QRCodeSVG } from 'qrcode.react';

const GuestQRCodeCard = ({ roomNumber, currentToken }) => {
  // 1. Build the magic link
  // Use window.location.origin so it dynamically works on localhost AND production
  const loginUrl = `${window.location.origin}/room-login?room=${roomNumber}&token=${currentToken}`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md text-center max-w-sm mx-auto border border-[#E3DCD2]">
      <h3 className="text-xl font-bold text-[#4A3728] mb-1">Welcome to Room {roomNumber}</h3>
      <p className="text-sm text-[#8E735B] mb-6">Scan to access your digital concierge</p>
      
      {/* 2. Generate the QR Code SVG */}
      <div className="flex justify-center bg-white p-4 rounded-xl border-2 border-dashed border-[#E3DCD2] inline-block">
        <QRCodeSVG 
          value={loginUrl} 
          size={200} 
          level="H" // High error correction so it scans easily even if printed small
          fgColor="#2C241E" 
        />
      </div>

      <div className="mt-6 bg-[#F2EBE1] p-3 rounded-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#4A3728]">Manual Login Token</p>
        <p className="font-mono text-lg tracking-widest mt-1 text-[#D35400]">{currentToken}</p>
      </div>
    </div>
  );
};

export default GuestQRCodeCard;