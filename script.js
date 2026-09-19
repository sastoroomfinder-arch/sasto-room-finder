const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";
const ADMIN_WHATSAPP = "9779818067008";

let listings = [];

/* ---------- BASIC HELPERS ---------- */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizePhotos(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).map(String);
      }
    } catch (_) {}

    return value
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);
  }

  return [];
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "Contact for price";
  }

  const n = Number(value);

  return Number.isFinite(n)
    ? `Rs. ${n.toLocaleString("en-IN")} / month`
    : String(value);
}

function normalizeWhatsApp(value) {
  let n = String(value || "").replace(/\D/g, "");

  if (!n) return ADMIN_WHATSAPP;

  if (n.startsWith("00")) {
    n = n.slice(2);
  }

  if (n.startsWith("0")) {
    n = "977" + n.slice(1);
  } else if (n.startsWith("98") && n.length === 10) {
    n = "977" + n;
  }

  return n;
}

function propertyWhatsApp(room) {
  const number = normalizeWhatsApp(
    room.phone || ADMIN_WHATSAPP
  );

  const message = [
    "Hello Sasto Room Finder, I am interested in this property.",
    `Property: ${room.title || "Property"}`,
    `Location: ${room.location || room.address || "Not specified"}`,
    `Price: ${formatPrice(room.price)}`,
    "Please send me the current details."
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}


/* ---------- SUPABASE REST CONNECTION ---------- */
/*
   This version does NOT load supabase-js from a CDN.
   It directly uses the Supabase REST API.
*/

async function supabaseGet(table, params = "") {
  const url =
    `${SUPABASE_URL}/rest/v1/${table}` +
    (params ? `?${params}` : "");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json"
    }
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {}

  if (!response.ok) {
    const message =
      data?.message ||
      data?.hint ||
      text ||
      `HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}


/* ---------- PUBLIC PAGE STYLES ---------- */

function ensureStyles() {
  if (document.getElementById("srf-script-styles")) return;

  const style = document.createElement("style");

  style.id = "srf-script-styles";

  style.textContent = `
    .srf-gallery {
      position: relative;
      background: #eef3f8;
      border-radius: 12px 12px 0 0;
      overflow: hidden;
    }

    .srf-card-img {
      display: block;
      width: 100%;
      height: 240px;
      object-fit: cover;
      background: #eef3f8;
    }

    .srf-photo-count {
      position: absolute;
      right: 10px;
      top: 10px;
      background: rgba(0,0,0,.72);
      color: #fff;
      padding: 5px 9px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }

    .srf-photo-row {
      display: flex;
      gap: 7px;
      overflow-x: auto;
      padding: 8px;
      background: #fff;
    }

    .srf-photo-row img {
      width: 62px;
      height: 50px;
      object-fit: cover;
      border-radius: 7px;
      cursor: pointer;
      flex: 0 0 auto;
      border: 2px solid transparent;
    }

    .srf-photo-row img:hover {
      border-color: #16834f;
    }

    .srf-no-photo {
      height: 240px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eef3f8;
      color: #687789;
      border-radius: 12px 12px 0 0;
    }

    .srf-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 14px;
    }

    .srf-actions .btn {
      flex: 1 1 170px;
      text-align: center;
      text-decoration: none;
      box-sizing: border-box;
    }

    .srf-wa {
      background: #16834f !important;
      color: #fff !important;
    }

    .srf-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(0,0,0,.68);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }

    .srf-modal.open {
      display: flex;
    }

    .srf-modal-box {
      background: #fff;
      width: min(900px,100%);
      max-height: 92vh;
      overflow: auto;
      border-radius: 16px;
      position: relative;
    }

    .srf-modal-close {
      position: absolute;
      right: 12px;
      top: 12px;
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 50%;
      background: #fff;
      font-size: 25px;
      cursor: pointer;
      z-index: 3;
      box-shadow: 0 2px 10px rgba(0,0,0,.15);
    }

    .srf-modal-main {
      width: 100%;
      height: min(58vw,440px);
      object-fit: cover;
      background: #eef3f8;
      display: block;
    }

    .srf-modal-thumbs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 10px 14px;
    }

    .srf-modal-thumbs img {
      width: 78px;
      height: 62px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      flex: 0 0 auto;
    }

    .srf-modal-body {
      padding: 18px 20px 24px;
    }

    .srf-modal-body h2 {
      margin: 0 0 8px;
    }

    .srf-meta-grid {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 9px;
      margin: 15px 0;
    }

    .srf-meta-grid div {
      background: #f5f8f6;
      border-radius: 9px;
      padding: 10px;
    }

    .srf-modal-wa {
      display: block;
      text-align: center;
      background: #16834f;
      color: #fff;
      text-decoration: none;
      padding: 13px;
      border-radius: 10px;
      font-weight: 700;
      margin-top: 16px;
    }

    .srf-sponsors {
      display: grid;
      grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
      gap: 16px;
      margin: 0 0 26px;
    }

    .srf-sponsor {
      display: block;
      text-decoration: none;
      color: inherit;
      border: 1px solid #e1e7e3;
      border-radius: 14px;
      overflow: hidden;
      background: #fff;
    }

    .srf-sponsor img {
      display: block;
      width: 100%;
      height: 140px;
      object-fit: cover;
    }

    .srf-sponsor-body {
      padding: 14px;
    }

    .srf-sponsor-body h3 {
      margin: 5px 0 7px;
    }

    .srf-sponsored-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .06em;
      opacity: .65;
    }

    .srf-loading,
    .srf-error,
    .listing-empty {
      padding: 28px;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }

    @media(max-width:600px) {

      .srf-card-img,
      .srf-no-photo {
        height: 210px;
      }

      .srf-meta-grid {
        grid-template-columns: 1fr;
      }

      .srf-modal {
        padding: 8px;
      }

      .srf-modal-box {
        max-height: 96vh;
        border-radius: 12px;
      }

      .srf-modal-body {
        padding: 15px;
      }
    }
  `;

  document.head.appendChild(style);
}


/* ---------- PROPERTY DETAILS MODAL ---------- */

function ensurePropertyModal() {
  if (document.getElementById("srfPropertyModal")) return;

  const modal = document.createElement("div");

  modal.id = "srfPropertyModal";
  modal.className = "srf-modal";

  modal.innerHTML = `
    <div class="srf-modal-box"
         role="dialog"
         aria-modal="true"
         aria-label="Property details">

      <button
        class="srf-modal-close"
        type="button"
        aria-label="Close">
        ×
      </button>

      <img
        id="srfModalMain"
        class="srf-modal-main"
        alt="Property photo">

      <div
        id="srfModalThumbs"
        class="srf-modal-thumbs">
      </div>

      <div
        id="srfModalBody"
        class="srf-modal-body">
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  modal
    .querySelector(".srf-modal-close")
    .addEventListener("click", () => {
      modal.classList.remove("open");
    });

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.classList.remove("open");
    }
  });
}


function openPropertyDetails(id) {
  const room = listings.find(
    item => String(item.id) === String(id)
  );

  if (!room) return;

  ensurePropertyModal();

  const photos = normalizePhotos(room.photos);

  const main = document.getElementById("srfModalMain");
  const thumbs = document.getElementById("srfModalThumbs");

  main.src = photos[0] || "";
  main.alt = room.title || "Property photo";

  thumbs.innerHTML = photos.map((photo, index) => `
    <img
      src="${escapeHtml(photo)}"
      data-photo="${escapeHtml(photo)}"
      alt="Photo ${index + 1}">
  `).join("");

  thumbs
    .querySelectorAll("img")
    .forEach(img => {
      img.addEventListener("click", () => {
        main.src = img.dataset.photo;
      });
    });

  const furnished =
    room.furnished === true ||
    room.furnished === "true"
      ? "Yes"
      : "No";

  document.getElementById("srfModalBody").innerHTML = `
    <h2>
      ${escapeHtml(room.title || "Property")}
    </h2>

    <div>
      ${escapeHtml(
        room.location ||
        room.address ||
        "Location not specified"
      )}
    </div>

    <div class="srf-meta-grid">

      <div>
        <b>Price</b><br>
        ${escapeHtml(formatPrice(room.price))}
      </div>

      <div>
        <b>Type</b><br>
        ${escapeHtml(room.room_type || "Property")}
      </div>

      <div>
        <b>Bedrooms</b><br>
        ${escapeHtml(room.bedrooms ?? "—")}
      </div>

      <div>
        <b>Bathrooms</b><br>
        ${escapeHtml(room.bathrooms ?? "—")}
      </div>

      <div>
        <b>Furnished</b><br>
        ${furnished}
      </div>

      <div>
        <b>Phone / WhatsApp</b><br>
        ${escapeHtml(room.phone || "Not provided")}
      </div>

    </div>

    ${
      room.description
        ? `<p>
             ${escapeHtml(room.description)
               .replace(/\n/g, "<br>")}
           </p>`
        : ""
    }

    ${
      room.address
        ? `<p>
             <b>Address / Area:</b>
             ${escapeHtml(room.address)}
           </p>`
        : ""
    }

    <a
      class="srf-modal-wa"
      href="${propertyWhatsApp(room)}"
      target="_blank"
      rel="noopener">
      WhatsApp Owner
    </a>
  `;

  document
    .getElementById("srfPropertyModal")
    .classList.add("open");
}


/* ---------- PROPERTY LIST ---------- */

function renderListings(items = listings) {
  ensureStyles();

  const grid = document.getElementById("listingGrid");

  if (!grid) return;

  if (!items.length) {
    grid.innerHTML =
      '<div class="listing-empty">No properties available right now.</div>';

    return;
  }

  grid.innerHTML = items.map(room => {

    const photos = normalizePhotos(room.photos);

    const first = photos[0] || "";

    const photoHtml = photos.length
      ? `
        <div class="srf-gallery">

          <img
            class="srf-card-img"
            src="${escapeHtml(first)}"
            alt="${escapeHtml(
              room.title || "Property photo"
            )}"
            loading="lazy">

          ${
            photos.length > 1
              ? `
                <div class="srf-photo-count">
                  ${photos.length} photos
                </div>

                <div class="srf-photo-row">

                  ${photos.map((photo,index) => `
                    <img
                      src="${escapeHtml(photo)}"
                      data-photo="${escapeHtml(photo)}"
                      alt="Photo ${index + 1}"
                      loading="lazy">
                  `).join("")}

                </div>
              `
              : ""
          }

        </div>
      `
      : `
        <div class="srf-no-photo">
          No photo available
        </div>
      `;

    return `
      <article
        class="listing"
        data-property-id="${escapeHtml(room.id)}">

        ${photoHtml}

        <div class="listing-body">

          <h3>
            ${escapeHtml(room.title || "Property")}
          </h3>

          <div class="listing-location">
            ${escapeHtml(
              room.location ||
              room.address ||
              ""
            )}
          </div>

          <div class="listing-price">
            ${escapeHtml(formatPrice(room.price))}
          </div>

          <div class="listing-meta">
            ${escapeHtml(room.room_type || "")}

            ${
              room.bedrooms !== null &&
              room.bedrooms !== undefined
                ? ` • ${escapeHtml(room.bedrooms)} bed`
                : ""
            }

            ${
              room.bathrooms !== null &&
              room.bathrooms !== undefined
                ? ` • ${escapeHtml(room.bathrooms)} bath`
                : ""
            }
          </div>

          ${
            room.description
              ? `
                <p>
                  ${escapeHtml(
                    String(room.description).slice(0,180)
                  )}
                  ${
                    String(room.description).length > 180
                      ? "…"
                      : ""
                  }
                </p>
              `
              : ""
          }

          <div class="srf-actions">

            <button
              type="button"
              class="btn btn-dark srf-details"
              data-id="${escapeHtml(room.id)}">
              View Property Details
            </button>

            <a
              class="btn btn-dark srf-wa"
              href="${propertyWhatsApp(room)}"
              target="_blank"
              rel="noopener">
              Enquire on WhatsApp
            </a>

          </div>

        </div>

      </article>
    `;
  }).join("");

  grid
    .querySelectorAll(".srf-details")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => openPropertyDetails(
          button.dataset.id
        )
      );
    });

  grid
    .querySelectorAll(".srf-photo-row img")
    .forEach(thumb => {

      thumb.addEventListener("click", event => {

        event.stopPropagation();

        const gallery =
          thumb.closest(".srf-gallery");

        const main =
          gallery?.querySelector(".srf-card-img");

        if (main) {
          main.src = thumb.dataset.photo;
        }

      });

    });
}


/* ---------- LOAD PROPERTIES ---------- */

async function loadListings() {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  grid.innerHTML =
    '<div class="srf-loading">Loading properties...</div>';

  try {

    const params =
      new URLSearchParams({
        select: "*",
        status: "eq.available",
        approval_status: "eq.approved",
        order: "created_at.desc"
      });

    listings =
      await supabaseGet(
        "room",
        params.toString()
      ) || [];

    console.log(
      "SastoRoomFinder properties loaded:",
      listings
    );

    renderListings();

  } catch (error) {

    console.error(
      "SastoRoomFinder property loading error:",
      error
    );

    grid.innerHTML = `
      <div class="srf-error">
        Unable to load properties right now.
        Please refresh the page.
      </div>
    `;
  }
}


/* ---------- SPONSORS / ADS ---------- */

async function loadSponsors() {

  let wrap =
    document.getElementById("srfSponsorWrap");

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  if (!wrap) {

    wrap =
      document.createElement("div");

    wrap.id =
      "srfSponsorWrap";

    grid.parentNode.insertBefore(
      wrap,
      grid
    );
  }

  try {

    const params =
      new URLSearchParams({
        select: "*",
        status: "eq.active",
        order: "created_at.desc"
      });

    const sponsors =
      await supabaseGet(
        "sponsors",
        params.toString()
      ) || [];

    const now = new Date();

    const active =
      sponsors.filter(item => {

        const from =
          item.start_date
            ? new Date(
                `${item.start_date}T00:00:00`
              )
            : null;

        const to =
          item.end_date
            ? new Date(
                `${item.end_date}T23:59:59`
              )
            : null;

        return (
          (!from || now >= from) &&
          (!to || now <= to)
        );
      });

    if (!active.length) {

      wrap.innerHTML = "";

      return;
    }

    wrap.innerHTML = `
      <div class="srf-sponsors">

        ${active.map(item => {

          const image =
            item.image_url ||
            item.image ||
            "";

          const link =
            item.link_url ||
            item.link ||
            "";

          const body = `
            <div class="srf-sponsor-body">

              <div class="srf-sponsored-label">
                Sponsored
              </div>

              <h3>
                ${escapeHtml(
                  item.title ||
                  item.sponsor_name ||
                  "Advertisement"
                )}
              </h3>

              ${
                item.description
                  ? `
                    <p>
                      ${escapeHtml(
                        item.description
                      )}
                    </p>
                  `
                  : ""
              }

            </div>
          `;

          return link

            ? `
              <a
                class="srf-sponsor"
                href="${escapeHtml(link)}"
                target="_blank"
                rel="noopener">

                ${
                  image
                    ? `
                      <img
                        src="${escapeHtml(image)}"
                        alt="">
                    `
                    : ""
                }

                ${body}

              </a>
            `

            : `
              <div class="srf-sponsor">

                ${
                  image
                    ? `
                      <img
                        src="${escapeHtml(image)}"
                        alt="">
                    `
                    : ""
                }

                ${body}

              </div>
            `;
        }).join("")}

      </div>
    `;

  } catch (error) {

    console.warn(
      "SastoRoomFinder sponsors loading error:",
      error
    );

    wrap.innerHTML = "";
  }
}


/* ---------- SEARCH / FILTER ---------- */

function filterProperties() {

  const query =
    (
      document.getElementById(
        "filterSearch"
      )?.value || ""
    )
      .toLowerCase()
      .trim();

  const type =
    (
      document.getElementById(
        "filterType"
      )?.value || ""
    )
      .toLowerCase()
      .trim();

  const filtered =
    listings.filter(room => {

      const text =
        [
          room.title,
          room.location,
          room.room_type,
          room.description,
          room.address,
          room.price
        ]
          .join(" ")
          .toLowerCase();

      const matchesQuery =
        !query ||
        text.includes(query);

      const matchesType =
        !type ||
        String(
          room.room_type || ""
        )
          .toLowe
