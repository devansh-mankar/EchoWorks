import React, { useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";

import { VOICES, LANGS } from "./constants";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { useEchoDubWS } from "./hooks/useEchoDubWS";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useCameraRecorder } from "./hooks/useCameraRecorder";

export default function EchoDubLive() {
  useAuth();

  // Tabs
  const [tab, setTab] = useState("audio");

  // Connection & UI state
  const [voice, setVoice] = useState("narrator_warm");
  const [targetLang, setTargetLang] = useState("auto");

  // audio engine
  const audio = useAudioEngine();

  // websocket
  const ws = useEchoDubWS({
    voice,
    targetLang,
    onAudioChunk: audio.handleMurfChunk,
    onDisconnect: () => {
      cam.stopRecording({ silent: true });
      cam.stopCamera({ silent: true });
    },
    clearRecentSigs: audio.clearRecentSigs,
  });

  // speech recognition
  const speech = useSpeechRecognition({
    targetLang,
    wsMode: ws.wsMode,
    connected: ws.connected,
    connectWS: ws.connectWS,
    setWsMode: ws.setWsMode,
    sendTextDelta: ws.sendTextDelta,
    resumeAudio: audio.resumeAudio,
    resetAudioState: audio.resetAudioState,
    clearRecentSigs: audio.clearRecentSigs,
  });

  // camera/recorder
  const cam = useCameraRecorder({
    getRecordTap: audio.getRecordTap,
    getTailMs: audio.getTailMs,
    resumeAudio: audio.resumeAudio,
  });

  useEffect(() => {
    if (tab !== "video") {
      cam.stopRecording({ silent: true });
      cam.stopCamera({ silent: true });
    }
  }, [tab]);

  useEffect(() => {
    return () => {
      cam.stopRecording({ silent: true });
      cam.stopCamera({ silent: true });
      cam.revokeRecUrl(cam.recUrl);
    };
  }, []);

  return (
    <div className="min-h-[100vh] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">EchoDub Live</h1>
            <p className="text-gray-600 mt-1">
              Speak → instant dub. Transcript + voice changer. (Audio & Video)
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border ${
              ws.connected
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                ws.connected ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {ws.connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Tabs */}
        <div className="mb-6 inline-flex rounded-xl border overflow-hidden text-sm">
          <button
            className={`px-4 py-2 ${
              tab === "audio" ? "bg-blue-600 text-white" : "bg-white"
            }`}
            onClick={() => setTab("audio")}
          >
            Audio
          </button>
          <button
            className={`px-4 py-2 border-l ${
              tab === "video" ? "bg-blue-600 text-white" : "bg-white"
            }`}
            onClick={() => setTab("video")}
          >
            Video
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left controls */}
          <div className="col-span-12 md:col-span-4">
            <div className="rounded-2xl border p-4 shadow-sm bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mode: <b>{ws.wsMode}</b>
                </div>
                {!ws.connected ? (
                  <button
                    onClick={ws.connectWS}
                    className="px-3 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl"
                  >
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={ws.disconnectWS}
                    className="px-3 py-2 rounded-xl font-semibold border border-gray-300 bg-white shadow-lg hover:shadow-xl"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Target Language</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  {LANGS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Voice</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mic */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  {!speech.recognizing ? (
                    <button
                      onClick={speech.startRecognition}
                      className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                    >
                      🎙️ Start Mic
                    </button>
                  ) : (
                    <button
                      onClick={speech.stopRecognition}
                      className="px-4 py-2 rounded-lg border"
                    >
                      ⏹ Stop
                    </button>
                  )}
                  <span className="text-sm text-gray-600">
                    {speech.recognizing ? "Listening…" : "Idle"}
                  </span>
                </div>
              </div>

              {tab === "video" && (
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cam.toggleCamera}
                      className="px-4 py-2 rounded-lg border"
                    >
                      {cam.videoOn ? "Turn Camera Off" : "Turn Camera On"}
                    </button>
                    {!cam.recOn ? (
                      <button
                        onClick={cam.startRecording}
                        className="px-4 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700"
                      >
                        ⏺ Start Recording
                      </button>
                    ) : (
                      <button
                        onClick={() => cam.stopRecording()}
                        className="px-4 py-2 rounded-lg border border-red-500 text-red-600"
                      >
                        ⏹ Stop Recording
                      </button>
                    )}
                  </div>

                  {cam.recUrl && (
                    <div className="text-sm">
                      <video
                        key={cam.recUrl}
                        ref={cam.recVideoRef}
                        className="mt-2 w-full rounded-lg border bg-black"
                        controls
                        playsInline
                        preload="metadata"
                      />
                      <div className="mt-2 flex flex-wrap gap-2 items-center">
                        <a
                          href={cam.recUrl}
                          download="echodub-recording.webm"
                          className="px-3 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          Download
                        </a>
                        <button
                          onClick={cam.deleteRecording}
                          className="px-3 py-2 rounded-lg border border-red-500 text-red-600"
                        >
                          Delete
                        </button>
                        {cam.savingRec && (
                          <span className="text-xs text-gray-500">Saving…</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: transcript  */}
          <div className="col-span-12 md:col-span-8">
            <div className="rounded-2xl border p-4 shadow-sm bg-white h-[70vh] overflow-auto">
              {tab === "video" && (
                <div className="mb-4">
                  <video
                    ref={cam.videoRef}
                    className="w-full aspect-video rounded-xl border bg-black"
                    playsInline
                    muted
                    autoPlay
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Live preview of your camera. Final recording includes the
                    dubbed audio.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Live Transcript</div>
                <button
                  onClick={speech.clearTranscript}
                  className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50"
                  title="Clear transcript"
                >
                  Clear
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {speech.finals.map((t, i) => (
                  <div key={i} className="text-gray-800">
                    {t}
                  </div>
                ))}
                {!!speech.interim && (
                  <div className="text-gray-500 italic">{speech.interim}</div>
                )}
              </div>

              {!speech.finals.length && !speech.interim && (
                <div className="h-full grid place-items-center text-gray-500">
                  Start talking to hear the live dub.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
