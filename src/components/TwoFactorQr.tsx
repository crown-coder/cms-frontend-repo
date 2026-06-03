interface Props {
  qrCode: string;
  manualKey: string;
}

const TwoFactorQr = ({ qrCode, manualKey }: Props) => {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <img src={qrCode} alt="2FA QR Code" className="mx-auto h-44 w-44" />
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-[11px] text-gray-500">Manual setup key</p>
        <p className="mt-1 text-sm font-semibold tracking-widest text-gray-800">
          {manualKey}
        </p>
      </div>
    </div>
  );
};

export default TwoFactorQr;
