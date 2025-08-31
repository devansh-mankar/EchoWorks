import { useState } from "react";
import { toast } from "sonner";
import { analyze } from "../utils/analysis";
import { generateScript } from "../api/knowledge";
import { useWikipedia } from "./useWikipedia";

export function useGeneration() {
  const { get } = useWikipedia();
  const [generating, setGenerating] = useState(false);

  async function run({ mode, query, url, pasted, file, format }) {
    try {
      if (mode === "query" && !query.trim())
        return toast.error("Enter a search query.");
      if (mode === "url" && !url.trim())
        return toast.error("Enter a Wikipedia URL.");
      if (mode === "paste" && !pasted.trim())
        return toast.error("Paste some text or a link.");
      if (mode === "upload" && !file) return toast.error("Upload a document.");

      setGenerating(true);

      let base = null;
      if (mode === "url") {
        const m = url.match(/wiki\/(.+)$/);
        const titleOnly = m ? decodeURIComponent(m[1]) : url;
        base = await get(titleOnly);
      } else if (mode === "paste") {
        if (/wikipedia\.org\/wiki\//i.test(pasted)) {
          const m = pasted.match(/wiki\/(.+)$/);
          const titleOnly = m ? decodeURIComponent(m[1]) : pasted;
          base = await get(titleOnly);
        } else {
          base = { title: "Pasted content", url: "", content: pasted };
        }
      } else if (mode === "query") {
        base = await get(query);
      } else if (mode === "upload") {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/ingest/upload", {
          method: "POST",
          body: form,
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Upload failed.");
        base = payload;
      }

      if (!base) return { base: null, analysis: null, script: "" };
      if (!base?.content) {
        toast.error("No Wikipedia content found.");
        return { base: null, analysis: null, script: "" };
      }

      const a = analyze(base.content);
      const data = await generateScript({
        format,
        title: base.title,
        sourceUrl: base.url,
        content: base.content,
        analysis: a,
      });

      toast.success("Script generated!");
      return { base, analysis: a, script: data.script };
    } catch (e) {
      console.error(e);
      toast.error("Sorry, something went wrong while processing the article.");
      return { base: null, analysis: null, script: "" };
    } finally {
      setGenerating(false);
    }
  }

  return { generating, run };
}
