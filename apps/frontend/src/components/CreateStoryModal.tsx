import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface CreateStoryModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateStoryModal({ onClose, onSuccess }: CreateStoryModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 50 * 1024 * 1024) {
                setError('Dosya boyutu 50MB\'dan küçük olmalıdır.');
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        if (caption) {
            formData.append('caption', caption);
        }

        try {
            await api.post('/stories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Hikaye yüklenirken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Yeni Hikaye Paylaş</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-medium text-slate-700 mb-2">Medyayı buraya sürükleyin</p>
                            <p className="text-sm text-slate-500">veya seçmek için tıklayın</p>
                            <div className="flex gap-4 mt-6 text-sm text-slate-400">
                                <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> Resim</span>
                                <span className="flex items-center gap-1"><Video className="w-4 h-4" /> Video</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[60vh] mx-auto">
                                {file.type.startsWith('video/') ? (
                                    <video src={previewUrl!} controls className="w-full h-full object-contain" />
                                ) : (
                                    <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain" />
                                )}
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setPreviewUrl(null);
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Bir açıklama ekleyin..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,video/*"
                        className="hidden"
                    />

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor
                                </>
                            ) : (
                                'Paylaş'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
