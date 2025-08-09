import React, { useEffect, useState, useRef } from "react";
import { getMerchantsUnsettledBalances } from "../api";
import html2canvas from "html2canvas";
import { DownloadCloud, RefreshCcw } from "lucide-react";
import { Merchant } from "../types";
import { QRCodeSVG } from "qrcode.react";

export const MerchantQRCodeManager: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const qrRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const data: any = await getMerchantsUnsettledBalances();
      setMerchants(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load merchants");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  /**
   * Generates the dynamic link for a merchant
   */
  // in MerchantQRCodeManager
  const generateLink = (merchantId: string) => {
    const deep = `https://tiffinwala.services/open?merchantId=${encodeURIComponent(
      merchantId
    )}`;
    // efr=1 skips preview page; make sure your Firebase config allows this domain
    return `https://tiffinwala.page.link/?link=${encodeURIComponent(
      deep
    )}&apn=com.tiffinwala.app&ibi=com.tiffinwala.ios&ofl=${encodeURIComponent(
      "https://play.google.com/store/apps/details?id=com.tiffinwala.app"
    )}&efr=1`;
  };

  /**
   * Downloads the hidden QR div as PNG
   */
  const handleDownload = async (merchantId: string) => {
    const node = qrRefs.current[merchantId];
    if (!node) return;

    const canvas = await html2canvas(node, {
      useCORS: true,
      scale: 2,
      backgroundColor: null,
    });

    const link = document.createElement("a");
    link.download = `merchant-qr-${merchantId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Merchant QR Code Generator
        </h1>
        <button
          onClick={loadMerchants}
          disabled={loading}
          className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <p>Loading merchants...</p>
      ) : (
        <div className="space-y-6">
          {merchants.map((merchant) => {
            const deepLink = generateLink(merchant.merchantId);

            return (
              <div key={merchant._id} className="space-y-3">
                <div className="text-gray-900 font-bold">
                  {merchant.firstName} {merchant.lastName}
                </div>
                <div className="text-gray-500 text-sm">
                  Merchant ID:{" "}
                  <span className="font-mono">{merchant.merchantId}</span>
                </div>

                <button
                  onClick={() => handleDownload(merchant.merchantId)}
                  className="w-full flex justify-center items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Download QR Code</span>
                </button>

                {/* Hidden off-screen div for html2canvas */}
                <div
                  ref={(el) => (qrRefs.current[merchant.merchantId] = el)}
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                    width: "768px",
                    height: "1780px",
                  }}
                >
                  <div
                    style={{
                      width: "768px",
                      height: "1780px",
                      backgroundImage: `url("/tiffin-qr-bg.png")`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      position: "relative",
                    }}
                  >
                    {/* QR code placement */}
                    <div
                      style={{
                        position: "absolute",
                        top: "780px",
                        left: "128px",
                        width: "512px",
                        height: "512px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <QRCodeSVG
                        value={deepLink}
                        size={512}
                        bgColor="transparent"
                        fgColor="#000000"
                        level="H" // more error correction
                        includeMargin={true} // quiet zone helps scanning
                      />
                    </div>
                    {/* Merchant ID text under QR */}
                    <div
                      style={{
                        position: "absolute",
                        top: "1280px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "700px",
                        textAlign: "center",
                        color: "#000000",
                        fontWeight: "bold",
                        fontSize: "36px",
                        wordWrap: "break-word",
                      }}
                    >
                      {merchant.merchantId}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
