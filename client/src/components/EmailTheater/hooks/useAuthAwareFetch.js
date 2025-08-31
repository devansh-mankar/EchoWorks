import { useCallback } from "react";
import { fetchJSON } from "../api/email";

export function useAuthAwareFetch() {
  const call = useCallback(
    (url, opts, tried) => fetchJSON(url, opts, tried),
    []
  );
  return { fetchJSON: call };
}
