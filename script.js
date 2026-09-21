// Sasto Room Finder - public website
// Full property details + all-photo gallery
// Single-file replacement for script.js

const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";
const ADMIN_WHATSAPP = "9779818067008";

let listings = [];
let selectedProperty = null;
let galleryIndex = 0;

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function photosOf(room) {
  const fields = [
    room?.photos,
    room?.images,
    room?.image_urls,
    room?.photo_urls,
    room?.image
  ];

  const out = [];

  for (const value of fields) {
    if (!value) continue;

    if (Array.isArray(value)) {
      out.push(...value.filter(Boolean));
      continue;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          out.push(...parsed.filter(Boolean));
          continue;
        }
      } catch (_) {}

      out.push(
        ...value
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      );
    }
  }

  return [...new Set(out)];
}

function priceOf(room) {
  const p = room?.price ?? room?.rent ?? room?.monthly_rent;

  if (p === null || p === undefined || p === "") {
    return "Contact for price";
  }

  const n = Number(p);

  return Number.isFinite(n)
    ? `Rs. ${n.toLocaleString("en-IN")} / month`
    : esc(p);
}

function typeOf(room) {
  return (
    room?.room_type ||
    room?.property_type ||
    room?.type ||
    "Property"
  );
}

function locationOf(room) {
  return (
    room?.location ||
    room?.address ||
    room?.area ||
    room?.city ||
    "Kathmandu Valley"
  );
}

function titleOf(room) {
  return room?.title || room?.name || "Room / Property";
}

function phoneOf(room) {
  let p = String(
    room?.phone ||
    room?.whatsapp ||
    ADMIN_WHATSAPP
  ).replace(/\D/g, "");

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

  return `https://wa.me/${phoneOf(room)}?text=${encodeURIComponent(text)}`;
}


/* =========================
   PROPERTY DETAILS STYLES
========================= */

function injectDetailsStyles() {
  if (document.getElementById("srf-details-styles")) return;

  const style = document.createElement("style");

  style.id = "srf-details-styles";

  style.textContent = `
    .srf-modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.72);
      z-index: 99999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .srf-modal.open {
      display: flex;
    }

    .srf-modal-box {
      background: #fff;
      width: min(960px,100%);
      max-height: 94vh;
      overflow: auto;
      border-radius: 18px;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
    }

    .srf-close {
      position: absolute;
      right: 12px;
      top: 12px;
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 50%;
      background: rgba(0,0,0,.65);
      color: #fff;
      font-size: 26px;
      cursor: pointer;
      z-index: 3;
    }

    .srf-main-photo {
      width: 100%;
      height: min(58vw,480px);
      min-height: 240px;
      object-fit: cover;
      background: #eee;
      display: block;
    }

    .srf-photo-wrap {
      position: relative;
      background: #111;
    }

    .srf-gallery-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border: 0;
      border-radius: 50%;
      background: rgba(0,0,0,.58);
      color: #fff;
      font-size: 28px;
      cursor: pointer;
      z-index: 2;
    }

    .srf-gallery-prev {
      left: 12px;
    }

    .srf-gallery-next {
      right: 12px;
    }

    .srf-photo-count {
      position: absolute;
      right: 14px;
      bottom: 12px;
      background: rgba(0,0,0,.65);
      color: #fff;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 13px;
    }

    .srf-thumbs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 10px;
      background: #f6f6f6;
    }

    .srf-thumb {
      width: 76px;
      height: 58px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      flex: 0 0 auto;
    }

    .srf-thumb.active {
      border-color: #111;
    }

    .srf-content {
      padding: 22px;
    }

    .srf-content h2 {
      margin: 0 44px 8px 0;
      font-size: 28px;
      line-height: 1.2;
    }

    .srf-muted {
      color: #667085;
      margin: 6px 0;
    }

    .srf-price {
      font-size: 22px;
      font-weight: 700;
      margin: 14px 0;
    }

    .srf-grid {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 10px;
      margin: 18px 0;
    }

    .srf-info {
      background: #f7f8f7;
      border-radius: 10px;
      padding: 12px;
    }

    .srf-info strong {
      display: block;
      font-size: 12px;
      color: #667085;
      margin-bottom: 4px;
    }

    .srf-description {
      white-space: pre-wrap;
      line-height: 1.65;
      color: #344054;
    }

    .srf-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .srf-actions a,
    .srf-actions button {
      min-height: 44px;
      padding: 11px 16px;
      border-radius: 9px;
      text-decoration: none;
      border: 1px solid #d0d5dd;
      cursor: pointer;
      font-weight: 600;
    }

    .srf-wa {
      background: #111;
      color: #fff !important;
      border-color: #111 !important;
    }

    .srf-no-photo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 240px;
      color: #777;
      background: #eee;
    }

    .srf-view-btn {
      margin-top: 10px;
      width: 100%;
      min-height: 44px;
      cursor: pointer;
    }

    @media(max-width:600px) {
      .srf-content {
        padding: 16px;
      }

      .srf-content h2 {
        font-size: 23px;
      }

      .srf-grid {
        grid-template-columns: 1fr;
      }

      .srf-main-photo {
        height: 58vw;
        min-height: 220px;
      }
    }
  `;

  document.head.appendChild(style);
}


/* =========================
   DETAILS MODAL
========================= */

function ensureDetailsModal() {
  if (document.getElementById("srf-details-modal")) return;

  const modal = document.createElement("div");

  modal.id = "srf-details-modal";
  modal.className = "srf-modal";

  modal.innerHTML = `
    <div
      class="srf-modal-box"
      role="dialog"
      aria-modal="true"
      aria-label="Property details"
    >
      <button
        class="srf-close"
        type="button"
        aria-label="Close"
      >
        &times;
      </button>

      <div id="srf-details-body"></div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      closePropertyDetails();
    }
  });

  modal
    .querySelector(".srf-close")
    .addEventListener("click", closePropertyDetails);
}

function openPropertyDetails(index) {
  const room = listings[index];

  if (!room) return;

  selectedProperty = room;
  galleryIndex = 0;

  ensureDetailsModal();
  renderPropertyDetails();

  document
    .getElementById("srf-details-modal")
    .classList.add("open");

  document.body.style.overflow = "hidden";
}

function closePropertyDetails() {
  const modal = document.getElementById("srf-details-modal");

  if (modal) {
    modal.classList.remove("open");
  }

  document.body.style.overflow = "";
}

function renderPropertyDetails() {
  if (!selectedProperty) return;

  const room = selectedProperty;
  const pics = photosOf(room);
  const body = document.getElementById("srf-details-body");

  if (!body) return;

  const current = pics[galleryIndex] || "";

  const photo = current
    ? `
      <img
        class="srf-main-photo"
        src="${esc(current)}"
        alt="${esc(titleOf(room))}"
      >
    `
    : `
      <div class="srf-no-photo">
        No photos available
      </div>
    `;

  const thumbs = pics.length > 1
    ? `
      <div class="srf-thumbs">
        ${pics.map((p, i) => `
          <img
            class="srf-thumb ${i === galleryIndex ? "active" : ""}"
            src="${esc(p)}"
            alt="Photo ${i + 1}"
            data-gallery-index="${i}"
          >
        `).join("")}
      </div>
    `
    : "";

  const navigation = pics.length > 1
    ? `
      <button
        class="srf-gallery-btn srf-gallery-prev"
        type="button"
        aria-label="Previous photo"
      >
        &#8249;
      </button>

      <button
        class="srf-gallery-btn srf-gallery-next"
        type="button"
        aria-label="Next photo"
      >
        &#8250;
      </button>

      <span class="srf-photo-count">
        ${galleryIndex + 1} / ${pics.length}
      </span>
    `
    : "";

  const details = [
    ["Property type", typeOf(room)],
    ["Location", locationOf(room)],
    ["Address", room.address || locationOf(room)],
    ["Bedrooms", room.bedrooms ?? ""],
    ["Bathrooms", room.bathrooms ?? ""],
    [
      "Furnished",
      room.furnished === true
        ? "Yes"
        : room.furnished === false
          ? "No"
          : ""
    ]
  ].filter(([, value]) =>
    String(value ?? "").trim() !== ""
  );

  body.innerHTML = `
    <div class="srf-photo-wrap">
      ${photo}
      ${navigation}
    </div>

    ${thumbs}

    <div class="srf-content">

      <div class="eyebrow">
        ${esc(typeOf(room))}
      </div>

      <h2>
        ${esc(titleOf(room))}
      </h2>

      <p class="srf-muted">
        📍 ${esc(locationOf(room))}
      </p>

      <div class="srf-price">
        ${priceOf(room)}
      </div>

      <div class="srf-grid">
        ${details.map(([label, value]) => `
          <div class="srf-info">
            <strong>${esc(label)}</strong>
            ${esc(value)}
          </div>
        `).join("")}
      </div>

      ${
        room.description
          ? `
            <h3>Details</h3>

            <div class="srf-description">
              ${esc(room.description)}
            </div>
          `
          : ""
      }

      <div class="srf-actions">

        <a
          class="srf-wa"
          href="${whatsapp(room)}"
          target="_blank"
          rel="noopener"
        >
          Enquire on WhatsApp
        </a>

      </div>

    </div>
  `;

  body
    .querySelector(".srf-gallery-prev")
    ?.addEventListener("click", () => {

      galleryIndex =
        (galleryIndex - 1 + pics.length) % pics.length;

      renderPropertyDetails();
    });

  body
    .querySelector(".srf-gallery-next")
    ?.addEventListener("click", () => {

      galleryIndex =
        (galleryIndex + 1) % pics.length;

      renderPropertyDetails();
    });

  body
    .querySelectorAll(".srf-thumb")
    .forEach(el => {

      el.addEventListener("click", () => {

        galleryIndex =
          Number(el.dataset.galleryIndex || 0);

        renderPropertyDetails();
      });

    });
}


/* =========================
   PROPERTY CARDS
========================= */

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

    const masterIndex =
      listings.findIndex(
        x => String(x.id) === String(room.id)
      );

    const index =
      masterIndex >= 0
        ? masterIndex
        : listings.indexOf(room);

    const pics = photosOf(room);

    const image = pics[0]
      ? `
        <img
          src="${esc(pics[0])}"
          alt="${esc(titleOf(room))}"
          loading="lazy"
        >
      `
      : `
        <div class="listing-no-photo">
          No photo
        </div>
      `;

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

          <button
            type="button"
            class="btn btn-dark full srf-view-btn"
            data-property-index="${index}"
          >
            View Full Details
          </button>

          <a
            class="btn btn-dark full"
            style="margin-top:8px"
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

  grid
    .querySelectorAll(".srf-view-btn")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        openPropertyDetails(
          Number(btn.dataset.propertyIndex)
        );

      });

    });
}


/* =========================
   LOAD PROPERTIES
========================= */

async function loadListings() {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  grid.innerHTML =
    '<div class="listing-empty">Loading properties...</div>';

  // IMPORTANT:
  // Do not send Authorization: Bearer with sb_publishable key.

  const url =
    `${SUPABASE_URL}/rest/v1/room` +
    `?select=*` +
    `&order=created_at.desc`;

  try {

    const response =
      await fetch(url, {
        method: "GET",

        headers: {
          apikey: SUPABASE_KEY,
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

    const data =
      await response.json();

    listings =
      Array.isArray(data)
        ? data.filter(room =>
            String(room.status || "")
              .toLowerCase() === "available" &&

            String(room.approval_status || "")
              .toLowerCase() === "approved"
          )
        : [];

    renderListings(listings);

  } catch (error) {

    console.error(
      "Sasto Room Finder property loading error:",
      error
    );

    grid.innerHTML =
      `
        <div class="listing-empty">
          Unable to load properties right now.
          Please refresh the page.
        </div>
      `;
  }
}


/* =========================
   SEARCH / FILTER
========================= */

function filterProperties() {

  const q =
    (
      document.getElementById("filterSearch")
        ?.value || ""
    )
      .toLowerCase()
      .trim();

  const t =
    (
      document.getElementById("filterType")
        ?.value || ""
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
        (!q || searchable.includes(q)) &&

        (!t ||
          typeOf(room)
            .toLowerCase()
            .includes(t))
      );

    });

  renderListings(filtered);
}


/* =========================
   HOME SEARCH
========================= */

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
    `Hello Sasto Room Finder. ` +
    `I need a property in ` +
    `${location || "Kathmandu Valley"} ` +
    `with budget ` +
    `${budget || "to be discussed"}. ` +
    `Please send available options.`;

  window.open(
    `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}


/* =========================
   GENERAL INQUIRY
========================= */

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
    `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}


/* =========================
   PUBLIC FUNCTIONS
========================= */

window.filterProperties =
  filterProperties;

window.searchFromHome =
  searchFromHome;

window.sendInquiry =
  sendInquiry;

window.openPropertyDetails =
  openPropertyDetails;

window.closePropertyDetails =
  closePropertyDetails;


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    injectDetailsStyles();

    ensureDetailsModal();

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

    document.addEventListener(
      "keydown",
      e => {

        const modal =
          document.getElementById(
            "srf-details-modal"
          );

        if (
          !modal?.classList.contains("open")
        ) {
          return;
        }

        if (e.key === "Escape") {
          closePropertyDetails();
        }

        const pics =
          photosOf(selectedProperty);

        if (
          pics.length > 1 &&
          e.key === "ArrowLeft"
        ) {

          galleryIndex =
            (galleryIndex - 1 + pics.length)
            % pics.length;

          renderPropertyDetails();
        }

        if (
          pics.length > 1 &&
          e.key === "ArrowRight"
        ) {

          galleryIndex =
            (galleryIndex + 1)
            % pics.length;

          renderPropertyDetails();
        }

      }
    );

  }
);
