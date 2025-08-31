// server/src/ws/echodub.ws.js
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";

/**
  WS: /ws/echodub
  - Auth: JWT in ?token=
  - Bridges client <-> Murf WebSocket Streaming TTS
 */
export function mountEchoDubWSS(server /* http.Server */) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname !== "/ws/echodub") return;

    const token = url.searchParams.get("token") || "";
    let userId = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded?.id || decoded?._id || null;
    } catch {
      userId = null;
    }
    if (!userId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req, { userId });
    });
  });

  wss.on("connection", async (client, _req, { userId }) => {
    if (!process.env.MURF_API_KEY) {
      client.send(JSON.stringify({ type: "hello", mode: "http-fallback" }));
      return;
    }

    const qs = new URLSearchParams({
      "api-key": process.env.MURF_API_KEY,
      sample_rate: "24000",
      channel_type: "MONO",
      format: "MP3",
    }).toString();

    const murfUrl = `wss://api.murf.ai/v1/speech/stream-input?${qs}`;
    const murf = new WebSocket(murfUrl);
    let murfOpen = false;
    const pending = [];
    let lastVoiceConfig = null;

    murf.on("open", () => {
      murfOpen = true;
      for (const m of pending) murf.send(m);
      pending.length = 0;
      client.send(JSON.stringify({ type: "hello", mode: "stream" }));
    });

    murf.on("message", (data) => {
      try {
        client.send(typeof data === "string" ? data : data.toString("utf8"));
      } catch {}
    });

    murf.on("error", (e) => {
      try {
        client.send(
          JSON.stringify({
            type: "error",
            error: e?.message || "Murf WS error",
          })
        );
      } catch {}
    });
    murf.on("close", () => {
      try {
        client.close();
      } catch {}
    });

    client.on("message", (raw) => {
      let msg = null;
      try {
        msg = JSON.parse(raw.toString());
      } catch {}

      if (msg?.type === "hello") {
        const voiceMap = {
          narrator_warm: "en-US-amara",
          assistant_neutral: "en-US-oliver",
          sender_serious: "en-US-william",
          sender_playful: "en-US-rose",
        };
        const murfVoiceId = voiceMap[msg.voiceId] || "en-US-amara";
        lastVoiceConfig = {
          voice_config: {
            voiceId: murfVoiceId,
            style: "Conversational",
            rate: 0,
            pitch: 0,
            variation: 1,
          },
        };
        const payload = JSON.stringify(lastVoiceConfig);
        if (murfOpen) murf.send(payload);
        else pending.push(payload);
        return;
      }

      if (msg?.type === "input_text") {
        if (lastVoiceConfig && !murfOpen)
          pending.push(JSON.stringify(lastVoiceConfig));
        const toMurf = JSON.stringify({
          text: String(msg.text || ""),
          end: !!msg.commit,
        });
        if (murfOpen) murf.send(toMurf);
        else pending.push(toMurf);
      }
    });

    client.on("close", () => {
      try {
        murf.close();
      } catch {}
    });
    client.on("error", () => {
      try {
        murf.close();
      } catch {}
    });
  });
}
