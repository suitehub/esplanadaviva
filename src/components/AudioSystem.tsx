import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, AlertCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioRecorderProps {
  onAudioReady: (base64Audio: string, duration: number) => void;
  onClear?: () => void;
  maxDurationSeconds?: number;
}

export function AudioRecorder({
  onAudioReady,
  onClear,
  maxDurationSeconds = 60
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Request/Check permission on mount
  const checkPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop stream tracks immediately, we just wanted to check/trigger prompt
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setErrorMsg(null);
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      setHasPermission(false);
      setErrorMsg(
        'Acesso ao microfone recusado ou indisponível. Para gravar, permita o microfone nas configurações do seu navegador.'
      );
    }
  };

  const startRecording = async () => {
    chunksRef.current = [];
    setErrorMsg(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setLocalAudioUrl(localUrl);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          onAudioReady(base64Data, recordingTime || 1);
        };
        reader.readAsDataURL(audioBlob);

        // Cleanup stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      setRecordingTime(0);
      setIsRecording(true);
      mediaRecorder.start(250); // Capture chunk every 250ms

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDurationSeconds - 1) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);

      setHasPermission(true);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setHasPermission(false);
      setErrorMsg('Não foi possível acessar seu microfone. Verifique as permissões de áudio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const clearAudio = () => {
    setLocalAudioUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];
    if (onClear) onClear();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#e5e0d5] rounded-2xl p-4 space-y-3 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-black uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-[#004b87]" />
          Anotação por Áudio
        </span>
        {localAudioUrl && (
          <button
            type="button"
            onClick={clearAudio}
            className="text-[10px] text-red-500 hover:text-red-700 font-extrabold flex items-center gap-1 uppercase tracking-wider font-mono cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Descartar
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="font-medium text-left leading-normal">{errorMsg}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-2">
        <AnimatePresence mode="wait">
          {!localAudioUrl ? (
            <div className="flex flex-col items-center gap-3 w-full">
              {isRecording ? (
                <div className="flex flex-col items-center gap-3">
                  {/* Glowing Pulse Recording Circle */}
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="absolute w-16 h-16 bg-red-500/20 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                      className="absolute w-12 h-12 bg-red-500/40 rounded-full"
                    />
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="relative z-10 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all scale-105 cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-white text-white" />
                    </button>
                  </div>

                  <div className="text-center">
                    <span className="text-red-600 font-mono font-black text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse inline-block" />
                      GRAVANDO {formatTime(recordingTime)} / {formatTime(maxDurationSeconds)}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Clique no botão para concluir o áudio</p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider cursor-pointer font-mono"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (hasPermission === null) {
                        await checkPermission();
                      }
                      startRecording();
                    }}
                    className="w-11 h-11 rounded-full bg-[#004b87] hover:bg-[#003b6d] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer"
                    title="Iniciar gravação"
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                  <div className="text-center">
                    <span className="text-slate-600 font-extrabold text-[11px] block">Toque para Gravar sua Resposta</span>
                    <p className="text-[9.5px] text-slate-400 font-medium">Você poderá ouvir e revisar antes de enviar (máx. {maxDurationSeconds}s)</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-white border border-[#e5e0d5] rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[9px] font-black text-emerald-600 font-mono uppercase text-left">
                  ✓ Áudio Gravado ({formatTime(recordingTime)})
                </span>
                <AudioPlayer audioUrl={localAudioUrl} duration={recordingTime} />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  onDelete?: () => void;
}

export function AudioPlayer({ audioUrl, duration, onDelete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset player on URL change
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setTotalDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Audio playback failed:', err);
      });
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progress = progressRef.current;
    const audio = audioRef.current;
    if (!progress || !audio || !totalDuration) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const targetTime = percentage * totalDuration;

    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const percentCompleted = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-2.5">
      <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />

      {/* Play / Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-[#004b87] hover:bg-[#003b6d] text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer transition-all hover:scale-105"
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-white text-white" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.5" />
        )}
      </button>

      {/* Timeline/Controls */}
      <div className="flex-1 flex flex-col gap-1 select-none text-left">
        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500">
          <span className="flex items-center gap-0.5">
            <Volume2 className="w-3 h-3 text-[#004b87]" />
            {formatTime(currentTime)}
          </span>
          <span>{formatTime(totalDuration)}</span>
        </div>

        {/* Custom Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleProgressBarClick}
          className="h-2 bg-slate-200 rounded-full cursor-pointer relative overflow-hidden"
        >
          <div
            className="h-full bg-[#004b87] rounded-full transition-all duration-100"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Optional Delete Button */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-slate-400 hover:text-red-500 transition-all p-1.5 cursor-pointer shrink-0"
          title="Excluir áudio"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
