import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Reports() {
    const { user } = useAuth();
    const [downloadingCsv, setDownloadingCsv] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);

    const handleDownload = async (format: 'csv' | 'excel') => {
        const isCsv = format === 'csv';
        if (isCsv) setDownloadingCsv(true);
        else setDownloadingExcel(true);

        try {
            const response = await axiosClient.get(`/reports/export-attendance/?file_format=${format}`, {
                responseType: 'blob'
            });

            // Extract filename from headers if possible, otherwise use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `attendance_export.${isCsv ? 'csv' : 'xlsx'}`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            // Create a download link and click it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success(`Successfully downloaded ${format.toUpperCase()} report.`);
        } catch (error) {
            console.error("Failed to download report", error);
            toast.error(`Failed to download ${format.toUpperCase()} report.`);
        } finally {
            if (isCsv) setDownloadingCsv(false);
            else setDownloadingExcel(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Export attendance and system data</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                        <FileText size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Export to CSV</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Download a comma-separated values file of {user?.role === 'Admin' ? 'all student' : 'your class'} attendance records. Perfect for importing into other databases.
                    </p>
                    <button 
                        onClick={() => handleDownload('csv')}
                        disabled={downloadingCsv}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70"
                    >
                        {downloadingCsv ? 'Downloading...' : <><Download size={18} /> Download CSV</>}
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                        <FileSpreadsheet size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Export to Excel</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Download a formatted Microsoft Excel spreadsheet of {user?.role === 'Admin' ? 'all student' : 'your class'} attendance. Best for viewing and analysis.
                    </p>
                    <button 
                        onClick={() => handleDownload('excel')}
                        disabled={downloadingExcel}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-70"
                    >
                        {downloadingExcel ? 'Downloading...' : <><Download size={18} /> Download Excel</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
