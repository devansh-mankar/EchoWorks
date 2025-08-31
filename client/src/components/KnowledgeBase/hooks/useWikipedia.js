import { toast } from "sonner";
import { fetchWikipediaByQuery } from "../api/wiki";

export function useWikipedia() {
  async function get(title) {
    try {
      return await fetchWikipediaByQuery(title);
    } catch (e) {
      if (e.message === "EMPTY_TITLE")
        toast.error("Enter something to search on Wikipedia.");
      else if (e.message === "NO_CONTENT")
        toast.error(`"${title}" has no content available on Wikipedia.`);
      else if (e.status === 404)
        toast.error(`"${title}" is not available on Wikipedia.`);
      else toast.error(`Couldn't fetch "${title}" from Wikipedia.`);
      return null;
    }
  }
  return { get };
}
