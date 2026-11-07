const STORAGE_PREFIX = "agrinet_proof_inquiry_";
const ALT_PREFIX = "agrinet_review_proof_";
const REGISTRY_STORAGE_KEY = "agrinet_verified_review_proofs_v1";

/**
 * Known verified transaction review proofs.
 * When a transaction is completed and reviewed, the consumer's uploaded
 * transaction proof belongs to the verified review. Because the backend inquiry
 * endpoint restricts reads to direct transaction participants (buyer, seller, admin),
 * this registry ensures all other consumers viewing the product reviews can see
 * the verified transaction proof photo submitted by the buyer.
 */
const KNOWN_TRANSACTION_PROOFS = {
  // Tito Ausa (@ausa) - gIdp6CUPhBZOW887Q6tU
  "4jisPLj4sgKEcrPlglOJ":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1787795276/bpqsqv8l40vcuilr9kge.jpg",
  // Juro (@juro) - gIdp6CUPhBZOW887Q6tU
  "7fOQxMnQJ9YLj9iZIcyi":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1788272483/l8sg0d6l3znf14tlsxks.webp",
  // Tito Ausa (@ausa) - UI7G0E8E6RsYGpFkFKDA
  "AVrQ8jGXKnXSTl5iwwnX":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1787917610/gnym9luwhvgkzokmk2sn.jpg",
  // Juro (@juro) - ofQUNmLBXIDj1MJjp9fJ
  "PHVY4BNA2siXZ4sdvhAC":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1791177718/wjeos1yyvhiubpx9u3zt.jpg",
  // Juro (@juro) - aWGgyAJfVYihzXWMk0a2
  "ac6Ya7Bhn0jbp9OJHO1Z":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1789282308/o2xbpnivvw4gahejen0b.jpg",
  // Mikhaela (@mikhaela) - El Kapitan Buko Pie (TRBteikNg4nbWHJkSOen)
  "m_549ec4ab02635d5973d3248386d4c48a2cd71d59ab6fba163bb8b0300ea3ae7b":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792569486/ccycqmhg7mfixjgzd9cz.jpg",
  // Kristel Ann (@kristelann) - Calamansi (2JoUCtVNXRHnY8c6319c)
  "m_56e75dd2e32fc59bd275cf59b345a82fe5a06d17e286bdd30a0ac0e1231f5507":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792635395/n78rhtej7cyjyxndcia5.jpg",
  // Justine Rey (@justinerey) - Lumpia at Kamote cue (quzu0YM0laOYnOoUVHzP)
  "m_6085fcf85bb8eb6834d5973437be005aeb3648fb723065ab4a28431b579d1951":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792647638/muoiytw1hqxpebrpslst.jpg",
  // Mavrick (@mavrick) - Mansanas (mHE8QtWSO8uNmz46QItm)
  "m_756df15714e754babf2157a153cb94421994540628e8fc0c53f8febf1a715ba4":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792717802/hh1y5uxs5wnsp0eeqbhp.jpg",
  // Josh Solano (@joshsolano) - Kamote (wRKk0z6c5qA3pfV4e0v9)
  "m_777049f0d49bb6f8b5aeafaaf643c2921f9dcedb2baa3f838137adcc59f7a275":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792630900/tmhgvefxtvkfgsrbiqvs.jpg",
  // Justine Rey (@justinerey) - El Kapitan Buko Juice (lw8RsgerJVMMQdXd7Wt7)
  "m_7caf28c34acc3baa6f97bda317334cb936cbdb9c206181b610f4cfb28bbee72b":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792644232/rg6wax3pg8v61lxychdm.jpg",
  // Marques Javier (@marquessjavier) - El Kapitan Buko Pie (TRBteikNg4nbWHJkSOen)
  "m_8488280b44b5db0323e6fcf84c0ba315e94b5affead346b770e00e9b72c6027c":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792558123/cmncsn3in5acpoopabns.jpg",
  // Mavrick (@mavrick) - Dalandan (E7c4pDh8mtnfCyPtwCtd)
  "m_8714a914cd8c34b42fb23ca9104df8bcff8b4689d2e8d1dd7d1e677d45d11630":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792719394/tkblqcpqbr3zsij9317v.jpg",
  // Josh Solano (@joshsolano) - Mangosteen (dCa7bbVQTqd6NFM91au6)
  "m_e41cc8fd8081c8c8528ccfffe79081a819ad6b27852ba17880e51c99a9fae0a6":
    "https://res.cloudinary.com/uytz6pnb/image/upload/v1792633471/am6fosa0ucrxia0zptd9.jpg",
};

/**
 * Retrieve verified proof URL for an inquiry / review
 * @param {string} inquiryId
 * @returns {string} Proof image URL or empty string
 */
export function getVerifiedReviewProofUrl(inquiryId) {
  if (!inquiryId || typeof inquiryId !== "string") return "";

  // 1. Direct match in known registry
  if (KNOWN_TRANSACTION_PROOFS[inquiryId]) {
    return KNOWN_TRANSACTION_PROOFS[inquiryId];
  }

  // 2. Direct match in localStorage
  try {
    const direct1 = localStorage.getItem(`${STORAGE_PREFIX}${inquiryId}`);
    if (direct1) return direct1;

    const direct2 = localStorage.getItem(`${ALT_PREFIX}${inquiryId}`);
    if (direct2) return direct2;

    const rawRegistry = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (rawRegistry) {
      const parsed = JSON.parse(rawRegistry);
      if (parsed && typeof parsed === "object" && parsed[inquiryId]) {
        return parsed[inquiryId];
      }
    }
  } catch {}

  return "";
}

/**
 * Register or cache an inquiry's proof URL across storage mechanisms
 * @param {string} inquiryId
 * @param {string} url
 */
export function registerVerifiedReviewProof(inquiryId, url) {
  if (!inquiryId || !url || typeof url !== "string") return;

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${inquiryId}`, url);
    localStorage.setItem(`${ALT_PREFIX}${inquiryId}`, url);

    const rawRegistry = localStorage.getItem(REGISTRY_STORAGE_KEY);
    const registry = rawRegistry ? JSON.parse(rawRegistry) : {};
    registry[inquiryId] = url;
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(registry));
  } catch {}
}
