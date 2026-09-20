// ============================================================
// SASTO ROOM FINDER - PUBLIC script.js
// ============================================================

const SUPABASE_URL =
  "https://amhrnahjshsgelacqzyl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

const ADMIN_WHATSAPP = "9779818067008";

let listings = [];
let selectedProperty = null;
let galleryIndex = 0;


// ============================================================
// HELPERS
// ============================================================

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function photosOf(value) {

  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {

    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }

    } catch (e) {}

    return value
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  return [];
}


function photosFor(room) {

  let photos = [];

  const possibleFields = [
    room?.photos,
    room?.images,
    room?.image_urls,
    room?.photo_urls,
    room?.image
  ];

  for (const value of possibleFields) {

    if (!value) continue;

    if (Array.isArray(value)) {
      photos.push(...value);
      continue;
    }

    if (typeof value === "string") {

      try {

        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          photos.push(...parsed);
          continue;
        }

      } catch (e) {}

      photos.push(
        ...value
          .split(",")
          .map(x => x.trim())
          .filter(Boolean)
      );
    }
  }

  return [...new Set(photos.filter(Boolean))];
}


function titleOf(room) {
  return (
    room.title ||
    room.name ||
    "Room / Property"
  );
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


function priceOf(room) {

  const price =
    room.price ??
    room.rent ??
    room.monthly_rent;

  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "Contact for price";
  }

  const number = Number(price);

  if (Number.isFinite(number)) {
    return (
      "Rs. " +
      number.toLocaleString("en-IN") +
      " / month"
    );
  }

  return String(price);
}


function phoneOf(room) {

  let phone = String(
    room.phone ||
    room.whatsapp ||
    ADMIN_WHATSAPP
  ).replace(/[^\d]/g, "");

  if (phone.startsWith("0")) {
    phone = "977" + phone.slice(1);
  }

  if (
    !phone.startsWith("977") &&
    phone.length === 10
  ) {
    phone = "977" + phone;
  }

  return phone || ADMIN_WHATSAPP;
}


function whatsapp(room) {

  const message =
    `Hello Sasto Room Finder, ` +
    `I am interested in ${titleOf(room)} ` +
    `at ${locationOf(room)}. ` +
    `Please send current details.`;

  return (
    "https://wa.me/" +
    phoneOf(room) +
    "?text=" +
    encodeURIComponent(message)
  );
}


// ============================================================
// POPUP CSS
// ============================================================

function addPopupCSS() {

  if (
    document.getElementById(
      "srf-popup-css"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id = "srf-popup-css";

  style.textContent = `

.srf-modal{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.74);
  z-index:99999;
  display:none;
  align-items:center;
  justify-content:center;
  padding:14px;
}

.srf-modal.open{
  display:flex;
}

.srf-modal-box{
  background:#fff;
  width:min(820px,100%);
  max-height:95vh;
  overflow:auto;
  border-radius:20px;
  position:relative;
  box-shadow:0 22px 70px rgba(0,0,0,.35);
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
  z-index:30;
}

.srf-property-head{
  padding:23px 22px 18px;
}

.srf-type{
  display:inline-block;
  background:#111827;
  color:#fff;
  padding:6px 11px;
  border-radius:999px;
  font-size:11px;
  font-weight:800;
  text-transform:uppercase;
}

.srf-property-head h2{
  margin:10px 48px 7px 0;
  font-size:28px;
  line-height:1.18;
  color:#111827;
}

.srf-location{
  color:#64748b;
  font-size:14px;
  margin:0;
}

.srf-main-price{
  margin-top:12px;
  font-size:24px;
  font-weight:850;
  color:#0f766e;
}

.srf-gallery{
  background:#0f172a;
}

.srf-photo-wrap{
  position:relative;
}

.srf-main-photo{
  width:100%;
  height:min(58vw,480px);
  min-height:250px;
  object-fit:cover;
  display:block;
}

.srf-no-photo{
  display:flex;
  align-items:center;
  justify-content:center;
  height:360px;
  color:#cbd5e1;
  background:#334155;
}

.srf-watermark{
  position:absolute;
  inset:0;
  pointer-events:none;
  overflow:hidden;
}

.srf-watermark span{
  position:absolute;
  left:50%;
  top:50%;
  transform:
    translate(-50%,-50%)
    rotate(-25deg);
  width:160%;
  text-align:center;
  font-size:24px;
  font-weight:850;
  letter-spacing:2px;
  color:rgba(255,255,255,.34);
  text-shadow:0 1px 5px rgba(0,0,0,.55);
  white-space:nowrap;
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
  cursor:pointer;
}

.srf-gallery-prev{
  left:12px;
}

.srf-gallery-next{
  right:12px;
}

.srf-photo-count{
  position:absolute;
  right:14px;
  bottom:14px;
  background:rgba(0,0,0,.66);
  color:#fff;
  padding:6px 10px;
  border-radius:999px;
  font-size:12px;
}

.srf-thumbs{
  display:flex;
  gap:8px;
  padding:10px;
  overflow-x:auto;
}

.srf-thumb{
  width:76px;
  height:58px;
  flex:0 0 76px;
  object-fit:cover;
  border-radius:8px;
  cursor:pointer;
  border:2px solid transparent;
}

.srf-thumb.active{
  border-color:#14b8a6;
}

.srf-details{
  padding:20px;
}

.srf-section-title{
  font-size:17px;
  font-weight:850;
  color:#111827;
  margin:0 0 12px;
}

.srf-facts{
  display:grid;
  grid-template-columns:
    repeat(2,minmax(0,1fr));
  gap:10px;
  margin-bottom:21px;
}

.srf-fact{
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:13px;
  background:#f8fafc;
}

.srf-fact-label{
  font-size:11px;
  color:#64748b;
  margin-bottom:4px;
}

.srf-fact-value{
  font-size:14px;
  font-weight:750;
  color:#111827;
}

.srf-property-meta{
  display:grid;
  gap:8px;
  padding:15px;
  border-radius:13px;
  background:#f8fafc;
  margin-bottom:20px;
}

.srf-meta-row{
  display:flex;
  justify-content:space-between;
  gap:12px;
  font-size:13px;
}

.srf-meta-row span:first-child{
  color:#64748b;
}

.srf-meta-row span:last-child{
  font-weight:750;
  color:#111827;
  text-align:right;
}

.srf-description{
  color:#475569;
  font-size:14px;
  line-height:1.65;
  margin-bottom:20px;
  white-space:pre-wrap;
}

.srf-actions{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.srf-action{
  min-height:48px;
  border:0;
  border-radius:12px;
  font-weight:800;
  text-decoration:none;
  display:flex;
  align-items:center;
  justify-content:center;
}

.srf-whatsapp{
  background:#16a34a;
  color:#fff!important;
}

.srf-map{
  background:#e2e8f0;
  color:#0f172a;
}

.srf-share{
  margin-top:10px;
  width:100%;
  min-height:45px;
  border:1px solid #cbd5e1;
  background:#fff;
  border-radius:12px;
  font-weight:750;
  cursor:pointer;
}

.srf-listing-watermark{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  pointer-events:none;
}

.srf-listing-watermark span{
  transform:rotate(-25deg);
  font-size:15px;
  font-weight:800;
  color:rgba(255,255,255,.3);
  text-shadow:0 1px 3px #000;
  white-space:nowrap;
}

@media(max-width:600px){

  .srf-modal{
    padding:0;
    align-items:flex-end;
  }

  .srf-modal-box{
    max-height:97vh;
    border-radius:
      20px 20px 0 0;
  }

  .srf-property-head{
    padding:19px 16px 16px;
  }

  .srf-property-head h2{
    font-size:22px;
  }

  .srf-main-price{
    font-size:22px;
  }

  .srf-details{
    padding:16px;
  }

  .srf-watermark span{
    font-size:18px;
  }
}

`;

  document.head.appendChild(style);
}


// ============================================================
// MODAL
// ============================================================

function ensureModal() {

  if (
    document.getElementById(
      "srf-details-modal"
    )
  ) {
    return;
  }

  const modal =
    document.createElement("div");

  modal.id =
    "srf-details-modal";

  modal.className =
    "srf-modal";

  modal.innerHTML = `
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

  document.body.appendChild(modal);

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {
        closePropertyDetails();
      }

    }
  );

  modal
    .querySelector(".srf-close")
    .onclick =
    closePropertyDetails;
}


// ============================================================
// OPEN / CLOSE PROPERTY
// ============================================================

function openPropertyDetails(index) {

  if (!listings[index]) {
    return;
  }

  selectedProperty =
    listings[index];

  galleryIndex = 0;

  ensureModal();

  renderPropertyDetails();

  document
    .getElementById(
      "srf-details-modal"
    )
    .classList.add("open");

  document.body.style.overflow =
    "hidden";
}


function closePropertyDetails() {

  document
    .getElementById(
      "srf-details-modal"
    )
    ?.classList.remove("open");

  document.body.style.overflow =
    "";
}


// ============================================================
// PROPERTY DETAILS
// ============================================================

function renderPropertyDetails() {

  const room =
    selectedProperty;

  if (!room) return;

  const photos =
    photosFor(room);

  const body =
    document.getElementById(
      "srf-details-body"
    );

  if (!body) return;

  const title =
    titleOf(room);

  const type =
    typeOf(room);

  const location =
    locationOf(room);

  const address =
    room.address ||
    location;

  const owner =
    room.owner_name ||
    room.owner ||
    "Property Owner";

  const propertyId =
    room.id ||
    room.property_id ||
    "SastoRoomFinder";

  const posted =
    room.created_at
      ? new Date(
          room.created_at
        ).toLocaleDateString()
      : "Recently";

  const mapURL =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(address);


  let galleryHTML = "";


  if (photos.length) {

    galleryHTML = `
      <div class="srf-photo-wrap">

        <img
          class="srf-main-photo"
          src="${esc(
            photos[galleryIndex]
          )}"
          alt="${esc(title)}"
        >

        <div class="srf-watermark">
          <span>
            sastoroomfinder.pvt.ltd.
          </span>
        </div>

        ${
          photos.length > 1
            ? `
              <button
                class="
                  srf-gallery-btn
                  srf-gallery-prev
                "
                type="button"
              >
                &#8249;
              </button>

              <button
                class="
                  srf-gallery-btn
                  srf-gallery-next
                "
                type="button"
              >
                &#8250;
              </button>

              <span
                class="srf-photo-count"
              >
                ${galleryIndex + 1}
                /
                ${photos.length}
              </span>
            `
            : ""
        }

      </div>
    `;

  } else {

    galleryHTML = `
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


  let thumbnailsHTML = "";


  if (photos.length > 1) {

    thumbnailsHTML = `
      <div class="srf-thumbs">

        ${photos
          .map(
            (photo, index) => `
              <img
                class="
                  srf-thumb
                  ${
                    index === galleryIndex
                      ? "active"
                      : ""
                  }
                "
                src="${esc(photo)}"
                data-gallery-index="${index}"
                alt="Property photo ${
                  index + 1
                }"
              >
            `
          )
          .join("")}

      </div>
    `;
  }


  body.innerHTML = `

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
        ${esc(priceOf(room))}
      </div>

    </div>


    <div class="srf-gallery">

      ${galleryHTML}

      ${thumbnailsHTML}

    </div>


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
              room.bedrooms ??
              room.bedroom ??
              room.beds ??
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
              room.bathrooms ??
              room.bathroom ??
              room.baths ??
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
              room.furnished ??
              room.furnishing ??
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
              room.area ||
              room.size ||
              room.square_feet ||
              room.area_sqft ||
              "Not specified"
            )}
          </div>

        </div>

      </div>


      <div class="srf-property-meta">

        <div class="srf-meta-row">
          <span>Property ID</span>
          <span>
            ${esc(propertyId)}
          </span>
        </div>

        <div class="srf-meta-row">
          <span>Property Type</span>
          <span>
            ${esc(type)}
          </span>
        </div>

        <div class="srf-meta-row">
          <span>Owner</span>
          <span>
            ${esc(owner)}
          </span>
        </div>

        <div class="srf-meta-row">
          <span>Posted</span>
          <span>
            ${esc(posted)}
          </span>
        </div>

        <div class="srf-meta-row">
          <span>Location</span>
          <span>
            ${esc(address)}
          </span>
        </div>

      </div>


      <h3 class="srf-section-title">
        Description
      </h3>

      <div class="srf-description">
        ${esc(
          room.description ||
          room.details ||
          room.about ||
          "No description provided."
        )}
      </div>


      <div class="srf-actions">

        <a
          class="srf-action srf-whatsapp"
          href="${whatsapp(room)}"
          target="_blank"
          rel="noopener"
        >
          💬 WhatsApp Owner
        </a>

        <a
          class="srf-action srf-map"
          href="${esc(mapURL)}"
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


  const previous =
    body.querySelector(
      ".srf-gallery-prev"
    );

  if (previous) {

    previous.onclick = () => {

      galleryIndex =
        (
          galleryIndex -
          1 +
          photos.length
        ) %
        photos.length;

      renderPropertyDetails();
    };
  }


  const next =
    body.querySelector(
      ".srf-gallery-next"
    );

  if (next) {

    next.onclick = () => {

      galleryIndex =
        (
          galleryIndex +
          1
        ) %
        photos.length;

      renderPropertyDetails();
    };
  }


  body
    .querySelectorAll(
      ".srf-thumb"
    )
    .forEach(thumbnail => {

      thumbnail.onclick = () => {

        galleryIndex =
          Number(
            thumbnail.dataset
              .galleryIndex || 0
          );

        renderPropertyDetails();
      };

    });
}


// ============================================================
// SHARE
// ============================================================

async function srfShareProperty() {

  if (!selectedProperty) {
    return;
  }

  const shareData = {

    title:
      titleOf(selectedProperty),

    text:
      `${titleOf(
        selectedProperty
      )} - ` +
      `${locationOf(
        selectedProperty
      )} - ` +
      `${priceOf(
        selectedProperty
      )}`,

    url:
      window.location.href

  };


  try {

    if (
      navigator.share
    ) {

      await navigator.share(
        shareData
      );

      return;
    }


    if (
      navigator.clipboard
    ) {

      await navigator.clipboard.writeText(
        window.location.href
      );

      alert(
        "Property link copied."
      );

      return;
    }


    prompt(
      "Copy property link:",
      window.location.href
    );

  } catch (error) {

    console.log(
      "Share cancelled."
    );

  }
}


// ============================================================
// RENDER PROPERTY CARDS
// ============================================================

function renderListings(
  rows = listings
) {

  const grid =
    document.getElementById(
      "listingGrid"
    );

  if (!grid) {

    console.error(
      "listingGrid element not found."
    );

    return;
  }


  if (!rows.length) {

    grid.innerHTML = `
      <div class="listing-empty">
        No properties found.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    rows
      .map(room => {

        const photos =
          photosFor(room);

        let imageHTML = "";


        if (photos.length) {

          imageHTML = `
            <div
              style="
                position:relative;
              "
            >

              <img
                src="${esc(
                  photos[0]
                )}"
                alt="${esc(
                  titleOf(room)
                )}"
                loading="lazy"
              >

              <div
                class="
                  srf-listing-watermark
                "
              >
                <span>
                  sastoroomfinder.pvt.ltd.
                </span>
