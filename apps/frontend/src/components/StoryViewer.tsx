import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Story {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    createdAt: string;
}

interface StoryViewerProps {
    stories: Story[];
    initialIndex?: number;
    onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex = 0, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    const currentStory = stories[currentIndex];
    const DURATION = 5000; // 5 seconds for images

    useEffect(() => {
        startTimer();
        return () => stopTimer();
    }, [currentIndex]);

    const startTimer = () => {
        stopTimer();
        setProgress(0);
        startTimeRef.current = Date.now();

        if (currentStory.mediaType === 'image') {
            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const newProgress = (elapsed / DURATION) * 100;

                if (newProgress >= 100) {
                    handleNext();
                } else {
                    setProgress(newProgress);
                }
            }, 50);
        }
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    };

    const handleVideoEnded = () => {
        handleNext();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-white p-2 hover:bg-white/10 rounded-full"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Navigation Areas */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={handlePrev} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={handleNext} />

            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 z-20 flex gap-2">
                {stories.map((story, index) => (
                    <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100 ease-linear"
                            style={{
                                width: index === currentIndex ? `${progress}%` :
                                    index < currentIndex ? '100%' : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative w-full h-full max-w-2xl mx-auto flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStory.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {currentStory.mediaType === 'video' ? (
                            <video
                                ref={videoRef}
                                src={currentStory.mediaUrl}
                                autoPlay
                                playsInline
                                className="max-w-full max-h-full object-contain"
                                onTimeUpdate={handleVideoTimeUpdate}
                                onEnded={handleVideoEnded}
                                onError={(e) => {
                                    console.error('Video load error:', e);
                                    alert('Video yüklenirken bir hata oluştu.');
                                }}
                            />
                        ) : (
                            <img
                                src={currentStory.mediaUrl}
                                alt="Story"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    console.error('Image load error:', e);
                                    // alert('Resim yüklenirken bir hata oluştu.');
                                }}
                            />
                        )}

                        {currentStory.caption && (
                            <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                                <p className="text-white text-lg font-medium drop-shadow-md bg-black/30 inline-block px-4 py-2 rounded-xl backdrop-blur-sm">
                                    {currentStory.caption}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
