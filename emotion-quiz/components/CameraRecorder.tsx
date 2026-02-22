'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CameraState } from '@/types';

interface CameraRecorderProps {
  onRecordingComplete: (blob: Blob, questionId: number) => void;
  isRecording: boolean; // Controlled from parent
  currentQuestionId: number; // Track which question
}

const CameraRecorder = ({ 
  onRecordingComplete, 
  isRecording, 
  currentQuestionId 
}: CameraRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingQuestionIdRef = useRef<number | null>(null);
  
  const [cameraState, setCameraState] = useState<CameraState>({
    isRecording: false,
    hasPermission: false,
    error: null,
    videoBlob: null,
  });

  // Initialize camera ONCE
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        streamRef.current = stream;
        setCameraState(prev => ({ ...prev, hasPermission: true, error: null }));
      } catch (error) {
        console.error('Camera error:', error);
        setCameraState(prev => ({
          ...prev,
          error: 'Không thể truy cập camera. Vui lòng cấp quyền.',
          hasPermission: false,
        }));
      }
    };

    initCamera();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle recording start/stop
  useEffect(() => {
    if (!cameraState.hasPermission || !streamRef.current) return;

    if (isRecording && !cameraState.isRecording) {
      // START RECORDING - Create NEW MediaRecorder for each question
      try {
        console.log(`[CameraRecorder] Creating NEW MediaRecorder for question ${currentQuestionId}`);
        
        // Clear previous chunks
        chunksRef.current = [];
        recordingQuestionIdRef.current = currentQuestionId;

        // Determine mime type
        let mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = '';
            }
          }
        }

        const options = mimeType ? { mimeType } : {};
        const mediaRecorder = new MediaRecorder(streamRef.current, options);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            console.log(`[CameraRecorder] Data chunk received: ${event.data.size} bytes for question ${recordingQuestionIdRef.current}`);
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const questionId = recordingQuestionIdRef.current!;
          const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
          console.log(`[CameraRecorder] Recording stopped for question ${questionId}, blob size: ${blob.size} bytes, chunks: ${chunksRef.current.length}`);
          
          setCameraState(prev => ({ ...prev, videoBlob: blob, isRecording: false }));
          onRecordingComplete(blob, questionId);
          
          // Clear chunks after callback
          chunksRef.current = [];
          recordingQuestionIdRef.current = null;
        };

        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          setCameraState(prev => ({
            ...prev,
            error: 'Lỗi khi ghi hình. Vui lòng thử lại.',
            isRecording: false,
          }));
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // Record in 1-second chunks
        setCameraState(prev => ({ ...prev, isRecording: true }));
        console.log(`[CameraRecorder] Started recording for question ${currentQuestionId}`);
        
      } catch (err) {
        console.error('Failed to start recording:', err);
        setCameraState(prev => ({ 
          ...prev, 
          error: 'Không thể bắt đầu ghi hình. Vui lòng thử lại.' 
        }));
      }
      
    } else if (!isRecording && cameraState.isRecording) {
      // STOP RECORDING
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        try {
          console.log(`[CameraRecorder] Stopping recording for question ${recordingQuestionIdRef.current}, state=${recorder.state}`);
          if (recorder.state === 'recording') {
            recorder.stop();
          } else if (recorder.state === 'paused') {
            recorder.resume();
            recorder.stop();
          }
        } catch (err) {
          console.error('Failed to stop recording:', err);
        }
      }
    }
  }, [isRecording, cameraState.hasPermission, cameraState.isRecording, currentQuestionId, onRecordingComplete]);

  if (cameraState.error) {
    return (
      <div className="bg-red-50 border-4 border-red-200 rounded-2xl p-4">
        <p className="text-red-700 font-semibold text-center">
          ⚠️ {cameraState.error}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ minHeight: '360px' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
        className="rounded-2xl overflow-hidden shadow-lg border-4 border-white w-full h-auto"
        style={{ maxWidth: '640px', margin: '0 auto', display: 'block' }}
      />
      
      {cameraState.isRecording && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
          <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
          REC
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent re-render when parent state changes (e.g., typing in textarea)
// Only re-render when isRecording or currentQuestionId changes
export default React.memo(CameraRecorder, (prevProps, nextProps) => {
  return (
    prevProps.isRecording === nextProps.isRecording &&
    prevProps.currentQuestionId === nextProps.currentQuestionId
  );
});
