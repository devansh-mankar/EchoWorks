import * as React from "react";
import { toast } from "sonner";

export function useCameraRecorder({ getRecordTap, getTailMs, resumeAudio }) {
  const [videoOn, setVideoOn] = React.useState(false);
  const videoRef = React.useRef(null);
  const camStreamRef = React.useRef(null);

  const [recOn, setRecOn] = React.useState(false);
  const [savingRec, setSavingRec] = React.useState(false);
  const recorderRef = React.useRef(null);
  const recChunksRef = React.useRef([]);

  const [recUrl, setRecUrl] = React.useState("");
  const recVideoRef = React.useRef(null);

  React.useEffect(() => {
    if (recUrl && recVideoRef.current) {
      try {
        recVideoRef.current.pause();
        recVideoRef.current.src = recUrl;
        recVideoRef.current.load();
      } catch {}
    }
  }, [recUrl]);

  function revokeRecUrl(url) {
    try {
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
    } catch {}
  }

  async function startCamera() {
    if (camStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      camStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play().catch(() => {});
      }
      setVideoOn(true);
      await resumeAudio?.();
    } catch {
      setVideoOn(false);
      toast.error("Failed to access camera");
    }
  }

  function stopCamera(opts = { silent: false }) {
    try {
      videoRef.current?.srcObject?.getTracks?.().forEach((t) => t.stop());
    } catch {}
    try {
      camStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    } catch {}
    try {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;

        videoRef.current.offsetHeight;
      }
    } catch {}
    camStreamRef.current = null;
    setVideoOn(false);
    if (!opts?.silent) toast.message("Camera off");
  }

  async function toggleCamera() {
    if (!videoOn) await startCamera();
    else {
      if (recOn) {
        toast.message("Stop recording before turning camera off.");
        return;
      }
      stopCamera();
    }
  }

  function startRecording() {
    if (recOn) return;
    if (!camStreamRef.current) {
      toast.error("Turn on camera first.");
      return;
    }

    const aTrack = getRecordTap?.();
    if (!aTrack || aTrack.readyState !== "live") {
      toast.error("Dubbed audio not ready yet. Speak once, then record.");
      return;
    }

    const mixed = new MediaStream();
    const v = camStreamRef.current.getVideoTracks()[0];
    if (v) mixed.addTrack(v);
    mixed.addTrack(aTrack);

    let mime = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mime))
      mime = "video/webm;codecs=vp8,opus";
    if (!MediaRecorder.isTypeSupported(mime)) mime = "video/webm";

    try {
      revokeRecUrl(recUrl);
      setRecUrl("");
      recChunksRef.current = [];

      const rec = new MediaRecorder(mixed, {
        mimeType: mime,
        videoBitsPerSecond: 4_000_000,
        audioBitsPerSecond: 160_000,
      });
      rec.ondataavailable = (e) =>
        e.data && e.data.size && recChunksRef.current.push(e.data);
      rec.onstop = () => {
        try {
          const blob = new Blob(recChunksRef.current, { type: mime });
          const url = URL.createObjectURL(blob);
          setRecUrl(url);
        } catch {
          toast.error("Failed to finalize recording.");
        } finally {
          setSavingRec(false);
          setRecOn(false);
        }
      };

      recorderRef.current = rec;
      setRecOn(true);
      setSavingRec(false);
      rec.start();
      toast.message("Recording started…");
    } catch {
      toast.error("Recording not supported in this browser.");
    }
  }

  function stopRecording(opts = { silent: false }) {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;

    const tailMs = getTailMs?.() ?? 0;

    setSavingRec(true);
    if (!opts?.silent) toast.message("Finishing recording…");

    setTimeout(() => {
      try {
        rec.stop();
      } catch {}
      recorderRef.current = null;
    }, tailMs);
  }

  function deleteRecording() {
    if (recOn) stopRecording({ silent: true });
    revokeRecUrl(recUrl);
    setRecUrl("");
    setSavingRec(false);
    toast.message("Recording deleted.");
  }

  return {
    videoOn,
    videoRef,
    startCamera,
    stopCamera,
    toggleCamera,
    recOn,
    savingRec,
    recUrl,
    recVideoRef,
    startRecording,
    stopRecording,
    deleteRecording,
    revokeRecUrl,
  };
}
