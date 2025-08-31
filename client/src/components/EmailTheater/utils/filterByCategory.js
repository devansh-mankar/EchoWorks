export function filterByCategory(list, cat) {
  const hasCat = (m, name) => (m.labelIds || []).includes(name);
  return list.filter((m) => {
    switch (cat) {
      case "social":
        return hasCat(m, "CATEGORY_SOCIAL");
      case "updates":
        return hasCat(m, "CATEGORY_UPDATES");
      case "promotions":
        return hasCat(m, "CATEGORY_PROMOTIONS");
      case "spam":
        return hasCat(m, "SPAM");
      case "primary":
      default: {
        const lids = m.labelIds || [];
        const isSpam = lids.includes("SPAM");
        const isKnownCat =
          lids.includes("CATEGORY_SOCIAL") ||
          lids.includes("CATEGORY_UPDATES") ||
          lids.includes("CATEGORY_PROMOTIONS") ||
          lids.includes("CATEGORY_FORUMS");
        return !isSpam && (lids.includes("CATEGORY_PERSONAL") || !isKnownCat);
      }
    }
  });
}
