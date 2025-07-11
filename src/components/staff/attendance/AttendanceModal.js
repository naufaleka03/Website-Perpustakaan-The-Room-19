'use client';
import React, { useState, useEffect, useRef } from 'react';

const AttendanceModal = ({ isOpen, onClose, onSubmit, attendanceInfo }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentTimestamp, setCurrentTimestamp] = useState('');

  useEffect(() => {
    if (isOpen) {
      startCamera();
      // Update time every second
      const timer = setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setCurrentTime(timeString);
        setCurrentTimestamp(now.toISOString());
      }, 1000);

      return () => {
        clearInterval(timer);
        stopCamera();
      };
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (error) {
      alert('Unable to access camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setImageSrc(imageData);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setImageSrc(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!imageSrc) {
      onSubmit({ error: 'Please take a photo first' });
      return;
    }
    onSubmit({ 
      imageSrc, 
      staffNo: attendanceInfo.staff.id, // Use staff.id instead of staff.no
      status: attendanceInfo.status,
      timestamp: currentTimestamp // Always send ISO string
    });
  };

  const statusMap = { 'P': 'Present', 'A': 'Absent', 'L': 'Late', 'CO': 'Clock-out', 'ECO': 'Early Clock-out' };
  const getActionDescription = () => {
    if (attendanceInfo.actionLabel) {
      return `Please take evidence for your ${attendanceInfo.actionLabel.toLowerCase()}.`;
    }
    return `Please take evidence for marking ${attendanceInfo.staff.name} as ${statusMap[attendanceInfo.status]}.`;
  };
  const getWarningText = () => {
    if (attendanceInfo.status === 'CO') {
      return '⚠️ This action will record your clock-out time for today\'s shift!';
    } else if (attendanceInfo.status === 'ECO') {
      return '⚠️ This action will record your early clock-out time for today\'s shift!';
    } else {
      return `⚠️ This action will record ${attendanceInfo.staff.name} as ${statusMap[attendanceInfo.status]} for today\'s shift.`;
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {attendanceInfo.actionLabel || `Mark ${attendanceInfo.staff.name} as ${statusMap[attendanceInfo.status]}`}
        </h2>
        <p className="mb-4 text-gray-700">{getActionDescription()}</p>
        <p className="mb-4 text-gray-600">
          Current Time: <span className="font-mono font-semibold">{currentTime}</span>
        </p>
        <p className="mb-6 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">{getWarningText()}</p>
        <div className="mb-4">
          {!imageSrc ? (
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(() => {});
                  }
                }}
              />
              {isCameraActive && (
                <button
                  onClick={captureImage}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img src={imageSrc} alt="Captured evidence" className="w-full h-full object-cover" />
              <button
                onClick={retakePhoto}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={handleSubmit} disabled={!imageSrc} className={`px-4 py-2 rounded-lg ${imageSrc ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal; 