import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Button } from '@/components/ui/button';
import { uploadDocumentAndAnalyze } from '../api/documentApi';
import { useNavigate } from 'react-router-dom';
export function DocumentUpload() {
    const [files, setFiles] = React.useState(null);
    const [uploading, setUploading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();
    const onFileChange = (e) => {
        setFiles(e.target.files);
    };
    const onDrop = (e) => {
        e.preventDefault();
        setFiles(e.dataTransfer.files);
    };
    const onUpload = async () => {
        if (!files || files.length === 0)
            return;
        setUploading(true);
        setError(null);
        try {
            const file = files.item(0);
            if (!file) {
                setError('No file selected.');
                return;
            }
            // Gate OCR for paid plans only
            const { subscriptionService } = await import('@schwalbe/shared');
            const canOCR = await subscriptionService.hasEntitlement('ocr');
            if (!canOCR) {
                setError('OCR is available on paid plans. Please upgrade to continue.');
                return;
            }
            const { document } = await uploadDocumentAndAnalyze(file);
            navigate(`/documents/${document.id}`);
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            setError('Upload failed. Please try again.');
        }
        finally {
            setUploading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto p-6 text-white", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Upload Document" }), _jsxs("div", { className: "border-2 border-dashed border-slate-600 rounded p-8 text-center bg-slate-900 hover:bg-slate-800", onDragOver: (e) => e.preventDefault(), onDrop: onDrop, children: [_jsx("p", { className: "mb-2", children: "Drag and drop a PDF or image here" }), _jsx("p", { className: "text-sm text-slate-300 mb-4", children: "Supported: PDF, JPG, PNG, TIFF" }), _jsx("input", { type: "file", accept: "application/pdf,image/*", onChange: onFileChange })] }), files && files.length > 0 ? ((() => {
                const f = files?.item(0);
                return f ? (_jsxs("div", { className: "mt-4 text-sm text-slate-300", children: ["Selected: ", f.name, " (", Math.round(f.size / 1024), " KB)"] })) : null;
            })()) : null, error ? _jsx("div", { className: "mt-3 text-red-400 text-sm", role: "alert", children: error }) : null, _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx(Button, { onClick: onUpload, disabled: uploading || !files, children: uploading ? 'Uploading…' : 'Upload & Analyze (Paid)' }), _jsx(Button, { onClick: () => navigate('/documents'), children: "Cancel" }), _jsx(Button, { variant: "outline", onClick: () => (window.location.href = '/#pricing'), children: "Upgrade" })] }), _jsx("div", { className: "mt-6 text-xs text-slate-400", children: "Note: OCR is a paid feature in the MVP. Documents are stored in your private storage folder. OCR and analysis run via an Edge Function; secrets are managed via environment variables." })] }));
}
