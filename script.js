// Sasto Room Finder - public website
// Clean replacement for the broken public script.js

const SUPABASE_URL =
  "https://amhrnahjshsgelacqzyl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFJ";

const ADMIN_WHATSAPP = "9779818067008";

let listings = [];

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function photosOf(v) {

  if (!v) return [];

  if (Array.isArray(v)) {
    return v.filter(Boolean);
  }

  if (typeof v === "string") {

    try {
      const x = JSON.parse(v);

      if (Array.isArray(x)) {
        return x.filter(Boolean);
      }

    } catch (_) {}

    return v
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  return [];
}

function priceOf(room) {

  const p =
    room.price ??
    room.rent ??
    room.monthly_rent;

  if (
    p === null ||
    p === undefined ||
    p === ""
  ) {
    return "Contact for price";
  }

  const n = Number(p);

  return Number.isFinite(n)
    ? `Rs. ${n.toLocaleString("en-IN")} / month`
    : esc(p);
}

function typeOf(room) {

  return (
    room.room_type ||
    room.property_type ||
    room.type ||
    "Property"
  );
}

function locationOf(room) {

  return (
    room.location ||
    room.address ||
    room.area ||
    room.city ||
    "Kathmandu Valley"
  );
}

function titleOf(room) {

  return (
    room.title ||
    room.name ||
    "Room / Property"
  );
}

function phoneOf(room) {

  let p = String(
    room.phone ||
    room.whatsapp ||
    ADMIN_WHATSAPP
  ).replace(/[^\d]/g, "");

  if (p.startsWith("0")) {
    p = "977" + p.slice(1);
  }

  if (!p.startsWith("977") && p.length === 10) {
    p = "977" + p;
  }

  return p || ADMIN_WHATSAPP;
}

function whatsapp(room) {

  const text =
    `Hello Sasto Room Finder, I am interested in ${titleOf(room)} ` +
    `at ${locationOf(room)}. Please send current details.`;

  return (
    `https://wa.me/${phoneOf(room)}` +
    `?text=${encodeURIComponent(text)}`
  );
}

function renderListings(rows = listings) {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  if (!rows.length) {

    grid.innerHTML =
      '<div class="listing-empty">No properties found.</div>';

    return;
  }

  grid.innerHTML = rows.map(room => {

    const pics =
      photosOf(
        room.photos ||
        room.images ||
        room.image_urls
      );

    const image = pics[0]
      ? `<img
          src="${esc(pics[0])}"
          alt="${esc(titleOf(room))}"
          loading="lazy"
        >`
      : '<div class="listing-no-photo">No photo</div>';

    return `
      <article class="listing">

        <div class="listing-photo">
          ${image}
        </div>

        <div class="listing-body">

          <span class="eyebrow">
            ${esc(typeOf(room))}
          </span>

          <h3>
            ${esc(titleOf(room))}
          </h3>

          <p>
            ${esc(locationOf(room))}
          </p>

          ${
            room.description
              ? `<p>${esc(room.description)}</p>`
              : ""
          }

          <div class="listing-price">
            ${priceOf(room)}
          </div>

          <a
            class="btn btn-dark full"
            style="margin-top:14px"
            href="${whatsapp(room)}"
            target="_blank"
            rel="noopener"
          >
            Enquire on WhatsApp
          </a>

        </div>

      </article>
    `;

  }).join("");
}

async function loadListings() {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  grid.innerHTML =
    '<div class="listing-empty">Loading properties...</div>';

  const url =
    `${SUPABASE_URL}/rest/v1/room` +
    `?select=*` +
    `&status=eq.available` +
    `&approval_status=eq.approved` +
    `&order=created_at.desc`;

  try {

    const response =
      await fetch(url, {

        method: "GET",

        headers: {

          apikey: SUPABASE_KEY,

          Authorization:
            `Bearer ${SUPABASE_KEY}`,

          Accept: "application/json"

        },

        cache: "no-store"

      });

    if (!response.ok) {

      const message =
        await response.text();

      throw new Error(
        `Supabase ${response.status}: ${message}`
      );
    }

    listings =
      await response.json();

    if (!Array.isArray(listings)) {
      listings = [];
    }

    renderListings(listings);

  } catch (error) {

    console.error(
      "Sasto Room Finder property loading error:",
      error
    );

    grid.innerHTML =
      '<div class="listing-empty">Unable to load properties right now. Please refresh the page.</div>';
  }
}

function filterProperties() {

  const q =
    (
      document.getElementById(
        "filterSearch"
      )?.value || ""
    )
      .toLowerCase()
      .trim();

  const t =
    (
      document.getElementById(
        "filterType"
      )?.value || ""
    )
      .toLowerCase()
      .trim();

  const filtered =
    listings.filter(room => {

      const searchable = [

        titleOf(room),

        locationOf(room),

        typeOf(room),

        room.description || "",

        room.price ??
          room.rent ??
          ""

      ]
        .join(" ")
        .toLowerCase();

      return (
        (!q ||
          searchable.includes(q)) &&

        (!t ||
          typeOf(room)
            .toLowerCase()
            .includes(t))
      );
    });

  renderListings(filtered);
}

function searchFromHome() {

  const location =
    document.getElementById(
      "homeLocation"
    )?.value || "";

  const budget =
    document.getElementById(
      "homeBudget"
    )?.value || "";

  const msg =
    `Hello Sasto Room Finder. I need a property in ${location || "Kathmandu Valley"} ` +
    `with budget ${budget || "to be discussed"}. Please send available options.`;

  window.open(
    `https://wa.me/${ADMIN_WHATSAPP}` +
    `?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

function sendInquiry(e) {

  if (e) {
    e.preventDefault();
  }

  const name =
    document.getElementById("name")
      ?.value || "";

  const phone =
    document.getElementById("phone")
      ?.value || "";

  const need =
    document.getElementById("need")
      ?.value || "";

  const location =
    document.getElementById("location")
      ?.value || "";

  const message =
    document.getElementById("message")
      ?.value || "";

  const msg =
    `Hello Sasto Room Finder Pvt. Ltd.\n` +
    `Name: ${name}\n` +
    `Phone: ${phone}\n` +
    `Need: ${need}\n` +
    `Location: ${location}\n` +
    `Details/Budget: ${message}`;

  window.open(
    `https://wa.me/${ADMIN_WHATSAPP}` +
    `?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

window.filterProperties =
  filterProperties;

window.searchFromHome =
  searchFromHome;

window.sendInquiry =
  sendInquiry;

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadListings();

    document
      .getElementById("filterSearch")
      ?.addEventListener(
        "input",
        filterProperties
      );

    document
      .getElementById("filterType")
      ?.addEventListener(
        "change",
        filterProperties
      );

  }
);
