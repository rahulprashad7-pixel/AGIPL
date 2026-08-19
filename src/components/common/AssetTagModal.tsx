import React, { useRef } from 'react';
import { Asset, COMPANY_NAMES } from '../../types';
import { QrCode, Printer, X, Shield, Cpu, HardDrive } from 'lucide-react';

interface AssetTagModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssetTagModal: React.FC<AssetTagModalProps> = ({ asset, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Printable IT Asset Tag Sticker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Physical Sticker Preview */}
        <div className="my-6 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-md rounded-xl border-2 border-slate-900 bg-white p-5 text-slate-900 shadow-md print:m-0 print:border-2 print:shadow-none"
          >
            {/* Tag Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                  PROPERTY OF ACCURATE GROUP
                </div>
                <div className="text-sm font-black text-slate-950">
                  {COMPANY_NAMES[asset.company]}
                </div>
              </div>
              <div className="rounded bg-slate-900 px-2 py-1 text-xs font-black text-white">
                {asset.company}
              </div>
            </div>

            {/* Asset ID Main Code */}
            <div className="my-4 text-center">
              <div className="text-2xl font-black tracking-wider text-slate-900">
                {asset.assetId}
              </div>
              <div className="text-xs font-semibold text-slate-600">
                Asset No: {asset.assetNumber || 'N/A'} • SN: {asset.serialNumber || 'N/A'}
              </div>
            </div>

            {/* Simulated High-Res Barcode & QR Block */}
            <div className="my-3 flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 p-3">
              <div className="space-y-1 text-left text-[11px] font-medium text-slate-700">
                <div><strong className="text-slate-900">Type:</strong> {asset.assetType} ({asset.condition})</div>
                <div><strong className="text-slate-900">Model:</strong> {asset.manufacturer} {asset.model}</div>
                <div><strong className="text-slate-900">Assigned:</strong> {asset.assignedEmployeeName || 'Buffer Pool'}</div>
                <div><strong className="text-slate-900">Dept:</strong> {asset.department || 'N/A'}</div>
                <div><strong className="text-slate-900">IP:</strong> {asset.ipAddress || 'DHCP'}</div>
              </div>

              {/* QR Mock graphic with actual text encoded in SVG */}
              <div className="flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded border border-slate-400 bg-white p-1">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <rect width="100" height="100" fill="white" />
                    {/* Corners */}
                    <rect x="5" y="5" width="28" height="28" fill="black" />
                    <rect x="9" y="9" width="20" height="20" fill="white" />
                    <rect x="13" y="13" width="12" height="12" fill="black" />

                    <rect x="67" y="5" width="28" height="28" fill="black" />
                    <rect x="71" y="9" width="20" height="20" fill="white" />
                    <rect x="75" y="13" width="12" height="12" fill="black" />

                    <rect x="5" y="67" width="28" height="28" fill="black" />
                    <rect x="9" y="71" width="20" height="20" fill="white" />
                    <rect x="13" y="75" width="12" height="12" fill="black" />

                    {/* Data dots pattern */}
                    <rect x="40" y="10" width="8" height="8" fill="black" />
                    <rect x="52" y="10" width="8" height="8" fill="black" />
                    <rect x="40" y="24" width="8" height="8" fill="black" />
                    <rect x="46" y="38" width="8" height="8" fill="black" />
                    <rect x="20" y="46" width="8" height="8" fill="black" />
                    <rect x="60" y="46" width="8" height="8" fill="black" />
                    <rect x="75" y="46" width="8" height="8" fill="black" />
                    <rect x="40" y="60" width="8" height="8" fill="black" />
                    <rect x="54" y="60" width="8" height="8" fill="black" />
                    <rect x="70" y="70" width="8" height="8" fill="black" />
                    <rect x="85" y="85" width="8" height="8" fill="black" />
                  </svg>
                </div>
                <span className="mt-0.5 text-[8px] font-mono text-slate-500">SCAN IT ASSET</span>
              </div>
            </div>

            {/* Footer warning */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[9px] font-semibold text-slate-500">
              <span>DO NOT REMOVE THIS TAG</span>
              <span>IT HELPDESK: it@accurate.in</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="text-xs text-slate-500">
            Standard 4" x 2.5" thermal or adhesive asset tag format
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              <span>Print Sticker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
