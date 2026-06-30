import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';

export default function QRScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [cameras, setCameras] = useState<any[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                setCameras(devices);
                setSelectedCamera(devices[0].id);
            }
        }).catch(err => {
            console.error("Error getting cameras", err);
            toast.error("Could not access camera. Please check permissions.");
        });

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const startScanner = async () => {
        if (!selectedCamera) {
            toast.error("No camera selected");
            return;
        }

        try {
            const scanner = new Html5Qrcode("reader");
            scannerRef.current = scanner;
            await scanner.start(
                selectedCamera,
                { fps: 10, qrbox: { width: 250, height: 250 } },
                handleScanSuccess,
                () => {}
            );
            setIsScanning(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to start scanner.");
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            await scannerRef.current.stop();
            setIsScanning(false);
        }
    };

    // Cooldown state to prevent rapid multiple scans
    const processingRef = useRef(false);

    const handleScanSuccess = async (decodedText: string) => {
        if (processingRef.current) return;
        
        try {
            processingRef.current = true;
            toast.loading("Marking attendance...", { id: 'scan-toast' });
            
            const payload = { qr_data: decodedText };
            const res = await axiosClient.post('/attendance/scan-qr/', payload);
            
            toast.success(res.data.message || "Attendance marked successfully!", { id: 'scan-toast' });
            
            // Wait a moment before accepting next scan
            setTimeout(() => {
                processingRef.current = false;
            }, 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to mark attendance.", { id: 'scan-toast' });
            setTimeout(() => {
                processingRef.current = false;
            }, 3000);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Scan Student QR Code</h2>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Camera</label>
                    <select 
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        disabled={isScanning}
                        className="w-full md:w-1/2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary"
                    >
                        {cameras.map(camera => (
                            <option key={camera.id} value={camera.id}>
                                {camera.label || `Camera ${camera.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-center mb-6">
                    <div id="reader" className="w-full max-w-sm rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900"></div>
                </div>

                <div className="flex justify-center gap-4">
                    {!isScanning ? (
                        <button 
                            onClick={startScanner}
                            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                        >
                            Start Scanner
                        </button>
                    ) : (
                        <button 
                            onClick={stopScanner}
                            className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-md"
                        >
                            Stop Scanner
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
