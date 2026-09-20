// SastoRoomFinder public script.js
// Direct Supabase REST + professional property popup + gallery + watermark + WhatsApp + Maps + Share

const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";
const ADMIN_WHATSAPP = "9779818067008";

let listings = [];
let selectedProperty = null;
let galleryIndex = 0;

const esc = v =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function photosOf(v) {
  if (!v) return [];

  if (Array.isArray(v)) {
    return v.filter(Boolean);
  }

  if (typeof v === "string") {
    try {
      const x = JSON.parse(v);
      if (Array.isArray(x)) return x.filter(Boolean);
    } catch (e) {}

    return v
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  return [];
}

function photosFor(r) {
  let a = [];

  for (const v of [
    r?.photos,
    r?.images,
    r?.image_urls,
    r?.photo_urls,
    r?.image
  ]) {
    if (!v) continue;

    if (Array.isArray(v)) {
      a.push(...v);
      continue;
    }

    if (typeof v === "string") {
      try {
        const x = JSON.parse(v);

        if (Array.isArray(x)) {
          a.push(...x);
          continue;
        }
      } catch (e) {}

      a.push(...v.split(",").map(x => x.trim()));
    }
  }

  return [...new Set(a.filter(Boolean))];
}

function titleOf(r) {
  return r.title || r.name || "Room / Property";
}

function typeOf(r) {
  return r.room_type || r.property_type || r.type || "Property";
}

function locationOf(r) {
  return (
    r.location ||
    r.address ||
    r.area ||
    r.city ||
    "Kathmandu Valley"
  );
}

function priceOf(r) {
  const p = r.price ?? r.rent ?? r.monthly_rent;

  if (p === null || p === undefined || p === "") {
    return "Contact for price";
  }

  const n = Number(p);

  return Number.isFinite(n)
    ? `Rs. ${n.toLocaleString("en-IN")} / month`
    : String(p);
}

function phoneOf(r) {
  let p = String(
    r.phone ||
    r.whatsapp ||
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

function whatsapp(r) {
  return `https://wa.me/${phoneOf(r)}?text=${encodeURIComponent(
    `Hello Sasto Room Finder, I am interested in ${titleOf(r)} at ${locationOf(
      r
    )}. Please send current details.`
  )}`;
}


/* =========================================================
   POPUP CSS
========================================================= */

function addPopupCSS() {
  if (document.getElementById("srf-popup-css")) return;

  const s = document.createElement("style");

  s.id = "srf-popup-css";

  s.textContent = `
.srf-modal{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.74);
  z-index:99999;
  display:none;
  align-items:center;
  justify-content:center;
  padding:14px
}

.srf-modal.open{
  display:flex
}

.srf-modal-box{
  background:#fff;
  width:min(820px,100%);
  max-height:95vh;
  overflow:auto;
  border-radius:20px;
  position:relative;
  box-shadow:0 22px 70px rgba(0,0,0,.35)
}

.srf-close{
  position:absolute;
  right:12px;
  top:12px;
  width:42px;
  height:42px;
  border:0;
  border-radius:50%;
  background:rgba(0,0,0,.66);
  color:#fff;
  font-size:27px;
  cursor:pointer;
  z-index:30
}

.srf-property-head{
  padding:23px 22px 18px
}

.srf-type{
  display:inline-block;
  background:#111827;
  color:#fff;
  padding:6px 11px;
  border-radius:999px;
  font-size:11px;
  font-weight:800;
  text-transform:uppercase
}

.srf-property-head h2{
  margin:10px 48px 7px 0;
  font-size:28px;
  line-height:1.18;
  color:#111827
}

.srf-location{
  color:#64748b;
  font-size:14px;
  margin:0
}

.srf-main-price{
  margin-top:12px;
  font-size:24px;
  font-weight:850;
  color:#0f766e
}

.srf-gallery{
  background:#0f172a
}

.srf-photo-wrap{
  position:relative
}

.srf-main-photo{
  width:100%;
  height:min(58vw,480px);
  min-height:250px;
  object-fit:cover;
  display:block
}

.srf-no-photo{
  display:flex;
  align-items:center;
  justify-content:center;
  height:360px;
  color:#cbd5e1;
  background:#334155
}

.srf-watermark{
  position:absolute;
  inset:0;
  pointer-events:none;
  overflow:hidden
}

.srf-watermark span{
  position:absolute;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%) rotate(-25deg);
  width:160%;
  text-align:center;
  font-size:24px;
  font-weight:850;
  letter-spacing:2px;
  color:rgba(255,255,255,.34);
  text-shadow:0 1px 5px rgba(0,0,0,.55);
  white-space:nowrap
}

.srf-watermark:after{
  content:"sastoroomfinder.pvt.ltd.";
  position:absolute;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%) rotate(-25deg);
  width:160%;
  text-align:center;
  font-size:24px;
  font-weight:850;
  color:rgba(255,255,255,.14);
  white-space:nowrap
}

.srf-gallery-btn{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  z-index:10;
  width:45px;
  height:45px;
  border:0;
  border-radius:50%;
  background:rgba(0,0,0,.58);
  color:#fff;
  font-size:29px;
  cursor:pointer
}

.srf-gallery-prev{
  left:12px
}

.srf-gallery-next{
  right:12px
}

.srf-photo-count{
  position:absolute;
  right:14px;
  bottom:14px;
  background:rgba(0,0,0,.66);
  color:#fff;
  padding:6px 10px;
  border-radius:999px;
  font-size:12px
}

.srf-thumbs{
  display:flex;
  gap:8px;
  padding:10px;
  overflow-x:auto
}

.srf-thumb{
  width:76px;
  height:58px;
  flex:0 0 76px;
  object-fit:cover;
  border-radius:8px;
  cursor:pointer;
  border:2px solid transparent
}

.srf-thumb.active{
  border-color:#14b8a6
}

.srf-details{
  padding:20px
}

.srf-section-title{
  font-size:17px;
  font-weight:850;
  color:#111827;
  margin:0 0 12px
}

.srf-facts{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
  margin-bottom:21px
}

.srf-fact{
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:13px;
  background:#f8fafc
}

.srf-fact-label{
  font-size:11px;
  color:#64748b;
  margin-bottom:4px
}

.srf-fact-value{
  font-size:14px;
  font-weight:750;
  color:#111827
}

.srf-property-meta{
  display:grid;
  gap:8px;
  padding:15px;
  border-radius:13px;
  background:#f8fafc;
  margin-bottom:20px
}

.srf-meta-row{
  display:flex;
  justify-content:space-between;
  gap:12px;
  font-size:13px
}

.srf-meta-row span:first-child{
  color:#64748b
}

.srf-meta-row span:last-child{
  font-weight:750;
  color:#111827;
  text-align:right
}

.srf-description{
  color:#475569;
  font-size:14px;
  line-height:1.65;
  margin-bottom:20px;
  white-space:pre-wrap
}

.srf-actions{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px
}

.srf-action{
  min-height:48px;
  border:0;
  border-radius:12px;
  font-weight:800;
  text-decoration:none;
  display:flex;
  align-items:center;
  justify-content:center
}

.srf-whatsapp{
  background:#16a34a;
  color:#fff!important
}

.srf-map{
  background:#e2e8f0;
  color:#0f172a
}

.srf-share{
  margin-top:10px;
  width:100%;
  min-height:45px;
  border:1px solid #cbd5e1;
  background:#fff;
  border-radius:12px;
  font-weight:750;
  cursor:pointer
}

.srf-listing-watermark{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  pointer-events:none
}

.srf-listing-watermark span{
  transform:rotate(-25deg);
  font-size:15px;
  font-weight:800;
  color:rgba(255,255,255,.3);
  text-shadow:0 1px 3px #000;
  white-space:nowrap
}

@media(max-width:600px){

  .srf-modal{
    padding:0;
    align-items:flex-end
  }

  .srf-modal-box{
    max-height:97vh;
    border-radius:20px 20px 0 0
  }

  .srf-property-head{
    padding:19px 16px 16px
  }

  .srf-property-head h2{
    font-size:22px
  }

  .srf-main-price{
    font-size:22px
  }

  .srf-details{
    padding:16px
  }

  .srf-watermark span,
  .srf-watermark:after{
    font-size:18px
  }
}
`;

  document.head.appendChild(s);
}


/* =========================================================
   MODAL
========================================================= */

function ensureModal() {
  if (document.getElementById("srf-details-modal")) return;

  const m = document.createElement("div");

  m.id = "srf-details-modal";
  m.className = "srf-modal";

  m.innerHTML = `
    <div class="srf-modal-box">

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

  document.body.appendChild(m);

  m.addEventListener("click", e => {
    if (e.target === m) {
      closePropertyDetails();
    }
  });

  m.querySelector(".srf-close").onclick =
    closePropertyDetails;
}

function openPropertyDetails(i) {
  if (!listings[i]) return;

  selectedProperty = listings[i];
  galleryIndex = 0;

  ensureModal();
  renderPropertyDetails();

  document
    .getElementById("srf-details-modal")
    .classList.add("open");

  document.body.style.overflow = "hidden";
}

function closePropertyDetails() {
  document
    .getElementById("srf-details-modal")
    ?.classList.remove("open");

  document.body.style.overflow = "";
}


/* =========================================================
   PROPERTY DETAILS
========================================================= */

function renderPropertyDetails() {

  const r = selectedProperty;

  if (!r) return;

  const pics = photosFor(r);

  const body =
    document.getElementById("srf-details-body");

  if (!body) return;

  const title = titleOf(r);
  const type = typeOf(r);
  const location = locationOf(r);

  const address =
    r.address || location;

  const owner =
    r.owner_name ||
    r.owner ||
    "Property Owner";

  const id =
    r.id ||
    r.property_id ||
    "SRF-" +
      Math.floor(
        Math.random() * 90000 + 10000
      );

  const posted = r.created_at
    ? new Date(r.created_at).toLocaleDateString()
    : "Recently";

  const map =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(address);

  let photo;

  if (pics[galleryIndex]) {

    photo = `
      <div class="srf-photo-wrap">

        <img
          class="srf-main-photo"
          src="${esc(pics[galleryIndex])}"
          alt="${esc(title)}"
        >

        <div class="srf-watermark">
          <span>
            sastoroomfinder.pvt.ltd.
          </span>
        </div>

        ${
          pics.length > 1
            ? `
              <button
                class="srf-gallery-btn srf-gallery-prev"
                type="button"
              >
                &#8249;
              </button>

              <button
                class="srf-gallery-btn srf-gallery-next"
                type="button"
              >
                &#8250;
              </button>

              <span class="srf-photo-count">
                ${galleryIndex + 1} / ${pics.length}
              </span>
            `
            : ""
        }

      </div>
    `;

  } else {

    photo = `
      <div class="srf-photo-wrap">

        <div class="srf-no-photo">
          No photos available
        </div>

        <div class="srf-watermark">
          <span>
            sastoroomfinder.pvt.ltd.
          </span>
        </div>

      </div>
    `;
  }

  const thumbs =
    pics.length > 1
      ? `
        <div class="srf-thumbs">

          ${pics
            .map(
              (p, i) => `
                <img
                  class="srf-thumb ${
                    i === galleryIndex
                      ? "active"
                      : ""
                  }"
                  src="${esc(p)}"
                  data-gallery-index="${i}"
                  alt="Property photo ${i + 1}"
                >
              `
            )
            .join("")}

        </div>
      `
      : "";

  body.innerHTML = `

    <!-- PROPERTY HEADER -->

    <div class="srf-property-head">

      <span class="srf-type">
        ${esc(type)}
      </span>

      <h2>
        ${esc(title)}
      </h2>

      <p class="srf-location">
        📍 ${esc(location)}
      </p>

      <div class="srf-main-price">
        ${esc(priceOf(r))}
      </div>

    </div>


    <!-- PHOTO GALLERY -->

    <div class="srf-gallery">

      ${photo}

      ${thumbs}

    </div>


    <!-- PROPERTY INFORMATION -->

    <div class="srf-details">

      <h3 class="srf-section-title">
        Property Details
      </h3>


      <div class="srf-facts">

        <div class="srf-fact">

          <div class="srf-fact-label">
            Bedrooms
          </div>

          <div class="srf-fact-value">
            🛏
            ${esc(
              r.bedrooms ??
              r.bedroom ??
              r.beds ??
              "Not specified"
            )}
          </div>

        </div>


        <div class="srf-fact">

          <div class="srf-fact-label">
            Bathrooms
          </div>

          <div class="srf-fact-value">
            🚿
            ${esc(
              r.bathrooms ??
              r.bathroom ??
              r.baths ??
              "Not specified"
            )}
          </div>

        </div>


        <div class="srf-fact">

          <div class="srf-fact-label">
            Furnishing
          </div>

          <div class="srf-fact-value">
            🛋
            ${esc(
              r.furnished ??
              r.furnishing ??
              "Not specified"
            )}
          </div>

        </div>


        <div class="srf-fact">

          <div class="srf-fact-label">
            Area
          </div>

          <div class="srf-fact-value">
            📐
            ${esc(
              r.area ||
              r.size ||
              r.square_feet ||
              r.area_sqft ||
              "Not specified"
            )}
          </div>

        </div>

      </div>


      <!-- MORE INFORMATION -->

      <div class="srf-property-meta">

        <div class="srf-meta-row">
          <span>Property ID</span>
          <span>${esc(id)}</span>
        </div>

        <div class="srf-meta-row">
          <span>Property Type</span>
          <span>${esc(type)}</span>
        </div>

        <div class="srf-meta-row">
          <span>Owner</span>
          <span>${esc(owner)}</span>
        </div>

        <div class="srf-meta-row">
          <span>Posted</span>
          <span>${esc(posted)}</span>
        </div>

        <div class="srf-meta-row">
          <span>Location</span>
          <span>${esc(address)}</span>
        </div>

      </div>


      <!-- DESCRIPTION -->

      <h3 class="srf-section-title">
        Description
      </h3>

      <div class="srf-description">
        ${esc(
          r.description ||
          r.details ||
          r.about ||
          "No description provided."
        )}
      </div>


      <!-- ACTIONS -->

      <div class="srf-actions">

        <a
          class="srf-action srf-whatsapp"
          href="${whatsapp(r)}"
          target="_blank"
          rel="noopener"
        >
          💬 WhatsApp Owner
        </a>


        <a
          class="srf-action srf-map"
          href="${esc(map)}"
          target="_blank"
          rel="noopener"
        >
          📍 View Location
        </a>

      </div>


      <button
        class="srf-share"
        type="button"
        onclick="srfShareProperty()"
      >
        🔗 Share Property
      </button>

    </div>
  `;


  /* GALLERY CONTROLS */

  body
    .querySelector(".srf-gallery-prev")
    ?.addEventListener("click", () => {

      galleryIndex =
        (galleryIndex - 1 + pics.length) %
        pics.length;

      renderPropertyDetails();
    });


  body
    .querySelector(".srf-gallery-next")
    ?.addEventListener("click", () => {

      galleryIndex =
        (galleryIndex + 1) %
        pics.length;

      renderPropertyDetails();
    });


  body
    .querySelectorAll(".srf-thumb")
    .forEach(x => {

      x.onclick = () => {

        galleryIndex =
          Number(
            x.dataset.galleryIndex || 0
          );

        renderPropertyDetails();
      };

    });
}


/* =========================================================
   SHARE PROPERTY
========================================================= */

async function srfShareProperty() {

  if (!selectedProperty) return;

  const d = {

    title: titleOf(selectedProperty),

    text:
      `${titleOf(selectedProperty)} - ` +
      `${locationOf(selectedProperty)} - ` +
      `${priceOf(selectedProperty)}`,

    url: location.href
  };

  try {

    if (navigator.share) {

      await navigator.share(d);

    } else if (navigator.clipboard) {

      await navigator.clipboard.writeText(
        location.href
      );

      alert("Property link copied.");

    } else {

      prompt(
        "Copy property link:",
        location.href
      );

    }

  } catch (e) {}
}


/* =========================================================
   PROPERTY LISTINGS
========================================================= */

function renderListings(rows = listings) {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  if (!rows.length) {

    grid.innerHTML =
      '<div class="listing-empty">No properties found.</div>';

    return;
  }


  grid.innerHTML = rows
    .map(r => {

      const p = photosFor(r);

      const img = p[0]

        ? `
          <div style="position:relative">

            <img
              src="${esc(p[0])}"
              alt="${esc(titleOf(r))}"
              loading="lazy"
            >

            <div class="srf-listing-watermark">

              <span>
                sastoroomfinder.pvt.ltd.
              </span>

            </div>

          </div>
        `

        : `
          <div class="listing-no-photo">
            No photo
          </div>
        `;


      return `

        <article class="listing">

          <div class="listing-photo">
            ${img}
          </div>


          <div class="listing-body">

            <span class="eyebrow">
              ${esc(typeOf(r))}
            </span>


            <h3>
              ${esc(titleOf(r))}
            </h3>


            <p>
              ${esc(locationOf(r))}
            </p>


            ${
              r.description
                ? `
                  <p>
                    ${esc(r.description)}
                  </p>
                `
                : ""
            }


            <div class="listing-price">
              ${esc(priceOf(r))}
            </div>


            <button
              type="button"
              class="btn btn-dark full srf-view-btn"
              data-property-id="${esc(r.id)}"
            >
              View Full Details
            </button>


            <a
              class="btn btn-dark full"
              style="margin-top:14px"
              href="${whatsapp(r)}"
              target="_blank"
              rel="noopener"
            >
              Enquire on WhatsApp
            </a>

          </div>

        </article>
      `;

    })
    .join("");


  /* VIEW DETAILS BUTTON */

  grid
    .querySelectorAll(".srf-view-btn")
    .forEach(b => {

      b.onclick = () => {

        const i =
          listings.findIndex(
            x =>
              String(x.id) ===
              String(b.dataset.propertyId)
          );

        if (i >= 0) {
          openPropertyDetails(i);
        }

      };

    });
}


/* =========================================================
   LOAD FROM SUPABASE
========================================================= */

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
    
