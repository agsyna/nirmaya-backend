import QRCode from 'qrcode';

/**
 * Generate a QR code from a token
 * Returns base64 encoded data URL
 */
export const generateQRCode = async (token: string, baseUrl: string = 'https://health-app.com'): Promise<string> => {
  const shareUrl = `${baseUrl}/share/${token}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      width: 300,
    });
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};

/**
 * Generate QR code as buffer (for file storage)
 */
export const generateQRCodeBuffer = async (token: string, baseUrl: string = 'https://health-app.com'): Promise<Buffer> => {
  const shareUrl = `${baseUrl}/share/${token}`;
  try {
    const qrCodeBuffer = await QRCode.toBuffer(shareUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 1,
      width: 300,
    });
    return qrCodeBuffer;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};
