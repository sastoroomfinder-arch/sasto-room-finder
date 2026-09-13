const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

let db;
let listings = [];

/* Load Supabase */
function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

/* Load properties from Supabase */
async function loadListings() {
  const grid = document.getElementById("listingGrid");
  if (!grid) return;

  grid.innerHTML = "<p>Loading properties...</p>";

  const { data, error } = await db
    .from("room")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    grid.innerHTML =
      "<p>Unable to load properties. Please try again later.</p>";
    return;
  }

  listings = data || [];

  renderListings(listings);
}

/* Render properties */
function renderListings(data = listings) {
  const grid = document.getElementById("listingGrid");
  if (!grid) return;

  if (!data.length) {
    grid.innerHTML = "<p>No available properties found.</p>";
    return;
  }

  grid.innerHTML = data.map((x) => {

    let photo = "";

    if (Array.isArray(x.photos) && x.photos.length) {
      photo = x.photos[0];
    } else if (typeof x.photos === "string" && x.photos.trim()) {
      try {
        const parsed = JSON.parse(x.photos);
        if (Array.isArray(parsed)) photo = parsed[0];
      } catch {
        photo = x.photos;
      }
    }

    const photoHTML = photo
      ? `<img src="${photo}" alt="${x.title || "Property"}" style="width:100%;height:220px;object-fit:cover;">`
      : `<div class="listing-photo">🏠</div>`;

    const price = x.price
      ? `Rs. ${Number(x.price).toLocaleString()} / month`
      : "Contact for current price";

    const roomType = x.room_type || "Property";
    const location = x.location || "";
    const title = x.title || roomType;

    const description = x.description || "Contact us for more details.";

    return `
      <article class="listing">

        <div class="listing-photo">
          ${photoHTML}
        </div>

        <div class="listing-body">

          <span class="eyebrow">${roomType}</span>

          <h3>${title}</h3>

          <p>📍 ${location}</p>

          <p>${description}</p>

          <div class="listing-price">${price}</div>

          <a
            class="btn btn-dark full"
            style="margin-top:14px"
            href="https://wa.me/9779818067008?text=${encodeURIComponent(
              "Hello Sasto Room Finder, I am interested in the " +
              roomType +
              " property at " +
              location +
              ". Please send current details."
            )}"
            target="_blank"
          >
            Enquire on WhatsApp
          </a>

        </div>

      </article>
    `;
  }).join("");
}

/* Search and filter */
function filterProperties() {

  const q =
    (document.getElementById("filterSearch")?.value || "")
      .toLowerCase();

  const t =
    (document.getElementById("filterType")?.value || "")
      .toLowerCase();

  const filtered = listings.filter((x) => {

    const text = [
      x.title,
      x.location,
      x.room_type,
      x.description
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!q || text.includes(q)) &&
      (!t || String(x.room_type || "").toLowerCase().includes(t))
    );
  });

  renderListings(filtered);
}

/* Home search */
function searchFromHome() {

  const l =
    document.getElementById("homeLocation")?.value || "";

  const b =
    document.getElementById("homeBudget")?.value || "";

  const msg =
    `Hello Sasto Room Finder. I need a property in ${
      l || "Kathmandu Valley"
    } with budget ${
      b || "to be discussed"
    }. Please send available options.`;

  window.open(
    "https://wa.me/9779818067008?text=" +
      encodeURIComponent(msg),
    "_blank"
  );
}

/* Inquiry form */
function sendInquiry(e) {

  e.preventDefault();

  const msg =
`Hello Sasto Room Finder Pvt. Ltd.
Name: ${document.getElementById("name")?.value || ""}
Phone: ${document.getElementById("phone")?.value || ""}
Need: ${document.getElementById("need")?.value || ""}
Location: ${document.getElementById("location")?.value || ""}
Details/Budget: ${document.getElementById("message")?.value || ""}`;

  window.open(
    "https://wa.me/9779818067008?text=" +
      encodeURIComponent(msg),
    "_blank"
  );
}

/* Mobile menu */
function setupMenu() {

  document.querySelector(".menu")?.addEventListener("click", () => {

    const n = document.querySelector("nav");

    if (!n) return;

    n.style.display =
      n.style.display === "flex" ? "none" : "flex";

    n.style.flexDirection = "column";
    n.style.position = "absolute";
    n.style.top = "68px";
    n.style.right = "4%";
    n.style.background = "#fff";
    n.style.padding = "18px";
    n.style.border = "1px solid #dfe4df";
    n.style.borderRadius = "12px";
  });
}

/* Start website */
document.addEventListener("DOMContentLoaded", async () => {

  setupMenu();

  if (document.getElementById("listingGrid")) {

    try {

      await loadSupabase();

      db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

      await loadListings();

    } catch (error) {

      console.error(error);

      document.getElementById("listingGrid").innerHTML =
        "<p>Unable to connect to the property database.</p>";
    }
  }
});
