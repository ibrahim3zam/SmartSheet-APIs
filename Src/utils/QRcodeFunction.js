
import QRCode from "qrcode";

export const generateQrcode = ({ data = '' } = {}) => {

    const qrcode = QRCode.toDataURL(

        JSON.stringify(data),

        {
            errorCorrectionLevel: 'H',
        }
    )
    return qrcode
}