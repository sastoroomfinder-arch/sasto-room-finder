// Sasto Room Finder - public property listings
const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFJ";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let listings = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(price) {
  if (price === null || price === undefined || price === "") {
    return "Contact for current price";
  }

  const n = Number(price);

  return Number.isNaN(n)
    ? String(price)
    : "Rs. " + n.toLocaleString("en-IN") + " / month";
}

function normalizePhotos(photos) {
  if (!photos) return [];

  if (Array.isArray(photos)) {
    return photos.filter(Boolean);
  }

  if (typeof photos === "string") {
    try {
      const parsed = JSON.parse(photos);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (_) {}

    return photos
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  return [];
}

function renderListings(data = listings) {
  const g = document.getElementById("listingGrid");

  if (!g) return;

  if (!data.length) {
    g.innerHTML =
      '<div class="listing-empty">No properties are currently available.</div>';
    return;
  }

  g.innerHTML = data.map(x => {
    const type = escapeHtml(x.room_type || "Property");
    const title = escapeHtml(x.title || x.location || "Property");
    const loc = escapeHtml(x.location || "Location not provided");
    const detail = escapeHtml(x.description || "");
    const price = escapeHtml(formatPrice(x.price));

    const photos = normalizePhotos(x.photos);

    const image = photos.length
      ? `<img src="${escapeHtml(photos[0])}" alt="${title}" class="listing-image" loading="lazy">`
      : "🏠";

    const text =
      `Hello Sasto Room Finder, I am interested in the ${x.room_type || "property"} at ${x.location || "the listed property"}. Please send current details.`;

    return `<article class="listing">
      <div class="listing-photo">${image}</div>

      <div class="listing-body">
        <span class="eyebrow">${type}</span>

        <h3>${title}</h3>

        <p>${loc}</p>

        ${detail ? `<p>${detail}</p>` : ""}

        <div class="listing-price">${price}</div>

        <a
          class="btn btn-dark full"
          style="margin-top:14px"
          href="https://wa.me/9779818067008?text=${encodeURIComponent(text)}"
          target="_blank"
          rel="noopener"
        >
          Enquire on WhatsApp
        </a>
      </div>
    </article>`;
  }).join("");
}

async function loadListings() {
  const g = document.getElementById("listingGrid");

  if (!g) return;

  g.innerHTML =
    '<div class="listing-empty">Loading properties...</div>';

  const { data, error } = await db
    .from("room")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase property loading error:", error);

    g.innerHTML =
      '<div class="listing-empty">Unable to load properties right now. Please try again later.</div>';

    return;
  }

  listings = data || [];

  renderListings();
}

function filterProperties() {
  const q =
    (document.getElementById("filterSearch")?.value || "")
      .toLowerCase()
      .trim();

  const t =
    (document.getElementById("filterType")?.value || "")
      .toLowerCase()
      .trim();

  renderListings(
    listings.filter(x => {
      const text = [
        x.title,
        x.location,
        x.room_type,
        x.description,
        x.price
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (!t ||
          String(x.room_type || "")
            .toLowerCase()
            .includes(t))
      );
    })
  );
}

function searchFromHome() {
  const l =
    document.getElementById("homeLocation")?.value || "";

  const b =
    document.getElementById("homeBudget")?.value || "";

  const msg =
    `Hello Sasto Room Finder. I need a property in ${l || "Kathmandu Valley"} with budget ${b || "to be discussed"}. Please send available options.`;

  window.open(
    "https://wa.me/9779818067008?text=" +
      encodeURIComponent(msg),
    "_blank"
  );
}

function sendInquiry(e) {
  e.preventDefault();

  const msg =
    `Hello Sasto Room Finder Pvt. Ltd.\n` +
    `Name: ${name.value}\n` +
    `Phone: ${phone.value}\n` +
    `Need: ${need.value}\n` +
    `Location: ${location.value}\n` +
    `Details/Budget: ${message.value}`;

  window.open(
    "https://wa.me/9779818067008?text=" +
      encodeURIComponent(msg),
    "_blank"
  );
}

document.addEventListener("DOMContentLoaded", () => {

  if (document.getElementById("listingGrid")) {
    loadListings();
  }

  document.querySelector(".menu")?.addEventListener("click", () => {

    const n = document.querySelector("nav");

    if (!n) return;

    n.style.display =
      n.style.display === "flex"
        ? "none"
        : "flex";

    n.style.flexDirection = "column";
    n.style.position = "absolute";
    n.style.top = "68px";
    n.style.right = "4%";
    n.style.background = "#fff";
    n.style.padding = "18px";
    n.style.border = "1px solid #dfe4df";
    n.style.borderRadius = "12px";
  });

  document
    .getElementById("filterSearch")
    ?.addEventListener("input", filterProperties);

  document
    .getElementById("filterType")
    ?.addEventListener("change", filterProperties);
});
