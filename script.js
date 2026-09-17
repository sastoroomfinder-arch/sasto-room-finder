// Sasto Room Finder - FINAL public script
const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

let db = null;
let listings = [];
const ADMIN_WHATSAPP = "9779818067008";

/* ---------- Supabase ---------- */

function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve();
      return;
    }

    const urls = [
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
      "https://unpkg.com/@supabase/supabase-js@2"
    ];

    let i = 0;

    function next() {
      if (window.supabase) {
        resolve();
        return;
      }

      if (i >= urls.length) {
        reject(new Error("Supabase library could not be loaded."));
        return;
      }

      const script = document.createElement("script");
      script.src = urls[i++];
      script.async = true;

      script.onload = () => {
        if (window.supabase) resolve();
        else next();
      };

      script.onerror = next;
      document.head.appendChild(script);
    }

    next();
  });
}

/* ---------- Helpers ---------- */

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

function formatPrice(price) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "Contact for price";
  }

  const n = Number(price);

  if (Number.isNaN(n)) {
    return String(price);
  }

  return "Rs. " + n.toLocaleString("en-IN") + " / month";
}

/* ---------- WhatsApp ---------- */

function waNumber(value) {
  let n = String(value || "").replace(/[^\d]/g, "");

  if (n.startsWith("0")) {
    n = "977" + n.slice(1);
  } else if (n.startsWith("98") && n.length === 10) {
    n = "977" + n;
  }

  return n || ADMIN_WHATSAPP;
}

function propertyWhatsApp(property) {
  const number = waNumber(property.phone);

  const message =
`Hello Sasto Room Finder.

I am interested in this property:

Property: ${property.title || "Property"}
Location: ${property.location || property.address || "Not specified"}
Price: ${property.price ? "Rs. " + property.price : "Contact for price"}

Please send me the current details.`;

  return (
    "https://wa.me/" +
    number +
    "?text=" +
    encodeURIComponent(message)
  );
}

/* ---------- Public CSS ---------- */

function ensurePublicStyles() {
  if (document.getElementById("srf-final-style")) return;

  const style = document.createElement("style");
  style.id = "srf-final-style";

  style.textContent = `
    .srf-gallery{
      background:#f1f5f9;
      overflow:hidden;
      border-radius:12px 12px 0 0;
    }

    .srf-main-photo{
      width:100%;
      height:250px;
      object-fit:cover;
      display:block;
      cursor:pointer;
    }

    .srf-photo-row{
      display:flex;
      gap:7px;
      overflow-x:auto;
      padding:8px;
      background:#fff;
    }

    .srf-photo-thumb{
      width:62px;
      height:50px;
      object-fit:cover;
      border-radius:7px;
      flex:0 0 auto;
      cursor:pointer;
      border:2px solid transparent;
    }

    .srf-photo-thumb:hover{
      border-color:#0879e8;
    }

    .srf-photo-count{
      position:absolute;
      top:10px;
      right:10px;
      background:rgba(0,0,0,.7);
      color:#fff;
      padding:5px 9px;
      border-radius:20px;
      font-size:12px;
    }

    .srf-gallery-wrap{
      position:relative;
    }

    .srf-buttons{
      display:flex;
      gap:8px;
      flex-wrap:wrap;
      margin-top:14px;
    }

    .srf-details-btn,
    .srf-whatsapp-btn{
      border:0;
      border-radius:9px;
      padding:11px 14px;
      font-weight:700;
      cursor:pointer;
      text-decoration:none;
      display:inline-block;
      text-align:center;
    }

    .srf-details-btn{
      background:#0879e8;
      color:#fff;
    }

    .srf-whatsapp-btn{
      background:#16834f;
      color:#fff;
    }

    .srf-property-modal{
      position:fixed;
      inset:0;
      z-index:99999;
      background:rgba(0,0,0,.7);
      display:none;
      align-items:center;
      justify-content:center;
      padding:15px;
    }

    .srf-property-modal.open{
      display:flex;
    }

    .srf-property-box{
      background:#fff;
      width:min(900px,100%);
      max-height:94vh;
      overflow:auto;
      border-radius:16px;
      position:relative;
    }

    .srf-property-close{
      position:absolute;
      right:12px;
      top:12px;
      z-index:5;
      width:40px;
      height:40px;
      border:0;
      border-radius:50%;
      background:#fff;
      font-size:25px;
      cursor:pointer;
    }

    .srf-property-main{
      width:100%;
      height:min(58vw,460px);
      object-fit:cover;
      display:block;
      background:#eef2f7;
    }

    .srf-property-thumbs{
      display:flex;
      gap:8px;
      overflow-x:auto;
      padding:10px;
    }

    .srf-property-thumbs img{
      width:75px;
      height:60px;
      object-fit:cover;
      border-radius:8px;
      cursor:pointer;
      flex:0 0 auto;
    }

    .srf-property-content{
      padding:18px;
    }

    .srf-property-content h2{
      margin:0 0 7px;
    }

    .srf-property-meta{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:9px;
      margin:15px 0;
    }

    .srf-property-meta div{
      background:#f5f8fb;
      padding:10px;
      border-radius:9px;
    }

    .srf-owner-wa{
      display:block;
      text-align:center;
      text-decoration:none;
      background:#16834f;
      color:#fff;
      padding:13px;
      border-radius:10px;
      font-weight:700;
      margin-top:15px;
    }

    .srf-sponsors{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
      gap:15px;
      margin-bottom:25px;
    }

    .srf-sponsor{
      display:block;
      text-decoration:none;
      color:inherit;
      background:#fff;
      border:1px solid #e1e7ed;
      border-radius:13px;
      overflow:hidden;
    }

    .srf-sponsor img{
      width:100%;
      height:130px;
      object-fit:cover;
      display:block;
    }

    .srf-sponsor-body{
      padding:13px;
    }

    .srf-sponsor-body h3{
      margin:4px 0;
    }

    .srf-sponsored{
      font-size:11px;
      text-transform:uppercase;
      opacity:.6;
    }

    @media(max-width:600px){
      .srf-main-photo{
        height:210px;
      }

      .srf-buttons{
        flex-direction:column;
      }

      .srf-details-btn,
      .srf-whatsapp-btn{
        width:100%;
        box-sizing:border-box;
      }

      .srf-property-meta{
        grid-template-columns:1fr;
      }

      .srf-property-main{
        height:55vw;
      }
    }
  `;

  document.head.appendChild(style);
}

/* ---------- Property Details Modal ---------- */

function ensurePropertyModal() {
  if (document.getElementById("srfPropertyModal")) return;

  const modal = document.createElement("div");

  modal.id = "srfPropertyModal";
  modal.className = "srf-property-modal";

  modal.innerHTML = `
    <div class="srf-property-box">

      <button
        type="button"
        class="srf-property-close"
        aria-label="Close"
      >×</button>

      <img
        id="srfPropertyMain"
        class="srf-property-main"
        alt="Property photo"
      >

      <div
        id="srfPropertyThumbs"
        class="srf-property-thumbs"
      ></div>

      <div
        id="srfPropertyContent"
        class="srf-property-content"
      ></div>

    </div>
  `;

  document.body.appendChild(modal);

  modal
    .querySelector(".srf-property-close")
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
  const property = listings.find(
    item => String(item.id) === String(id)
  );

  if (!property) return;

  ensurePropertyModal();

  const photos = normalizePhotos(property.photos);

  const mainImage =
    document.getElementById("srfPropertyMain");

  const thumbs =
    document.getElementById("srfPropertyThumbs");

  const content =
    document.getElementById("srfPropertyContent");

  mainImage.src = photos[0] || "";
  mainImage.alt = property.title || "Property photo";

  thumbs.innerHTML = photos
    .map(
      (photo, index) => `
        <img
          src="${escapeHtml(photo)}"
          alt="Property photo ${index + 1}"
          data-photo="${escapeHtml(photo)}"
        >
      `
    )
    .join("");

  thumbs
    .querySelectorAll("img")
    .forEach(img => {
      img.addEventListener("click", () => {
        mainImage.src = img.dataset.photo;
      });
    });

  content.innerHTML = `
    <h2>${escapeHtml(property.title || "Property")}</h2>

    <div>
      📍 ${escapeHtml(
        property.location ||
        property.address ||
        "Location not specified"
      )}
    </div>

    <div class="srf-property-meta">

      <div>
        <b>Price</b><br>
        ${escapeHtml(formatPrice(property.price))}
      </div>

      <div>
        <b>Property Type</b><br>
        ${escapeHtml(property.room_type || "Property")}
      </div>

      <div>
        <b>Bedrooms</b><br>
        ${escapeHtml(property.bedrooms ?? "—")}
      </div>

      <div>
        <b>Bathrooms</b><br>
        ${escapeHtml(property.bathrooms ?? "—")}
      </div>

      <div>
        <b>Furnished</b><br>
        ${property.furnished === true ? "Yes" : "No"}
      </div>

      <div>
        <b>WhatsApp</b><br>
        ${escapeHtml(property.phone || "Not provided")}
      </div>

    </div>

    ${
      property.address
        ? `
          <p>
            <b>Address / Area:</b>
            ${escapeHtml(property.address)}
          </p>
        `
        : ""
    }

    ${
      property.description
        ? `
          <p>
            ${escapeHtml(
              String(property.description)
            ).replace(/\n/g, "<br>")}
          </p>
        `
        : ""
    }

    <a
      class="srf-owner-wa"
      href="${propertyWhatsApp(property)}"
      target="_blank"
      rel="noopener"
    >
      💬 WhatsApp Owner
    </a>
  `;

  document
    .getElementById("srfPropertyModal")
    .classList.add("open");
}

/* ---------- Render Properties ---------- */

function renderListings(items = listings) {
  ensurePublicStyles();

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div class="listing-empty">
        No properties available right now.
      </div>
    `;
    return;
  }

  grid.innerHTML = items
    .map(property => {

      const photos =
        normalizePhotos(property.photos);

      const firstPhoto =
        photos[0] || "";

      const gallery = photos.length
        ? `
          <div class="srf-gallery-wrap">

            <div class="srf-gallery">

              <img
                class="srf-main-photo"
                src="${escapeHtml(firstPhoto)}"
                alt="${escapeHtml(
                  property.title ||
                  "Property photo"
                )}"
                loading="lazy"
              >

              ${
                photos.length > 1
                  ? `
                    <div class="srf-photo-count">
                      ${photos.length} photos
                    </div>

                    <div class="srf-photo-row">
                      ${photos
                        .map(
                          (photo, index) => `
                            <img
                              class="srf-photo-thumb"
                              src="${escapeHtml(photo)}"
                              alt="Photo ${index + 1}"
                              data-photo="${escapeHtml(photo)}"
                              loading="lazy"
                            >
                          `
                        )
                        .join("")}
                    </div>
                  `
                  : ""
              }

            </div>

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
          data-property-id="${escapeHtml(property.id)}"
        >

          ${gallery}

          <div class="listing-body">

            <h3>
              ${escapeHtml(
                property.title ||
                "Property"
              )}
            </h3>

            <div class="listing-location">
              📍
              ${escapeHtml(
                property.location ||
                property.address ||
                ""
              )}
            </div>

            <div class="listing-price">
              ${escapeHtml(
                formatPrice(property.price)
              )}
            </div>

            <div class="listing-meta">
              ${escapeHtml(
                property.room_type ||
                "Property"
              )}

              ${
                property.bedrooms !== null &&
                property.bedrooms !== undefined
                  ? ` • ${escapeHtml(
                      property.bedrooms
                    )} bed`
                  : ""
              }

              ${
                property.bathrooms !== null &&
                property.bathrooms !== undefined
                  ? ` • ${escapeHtml(
                      property.bathrooms
                    )} bath`
                  : ""
              }
            </div>

            ${
              property.description
                ? `
                  <p>
                    ${escapeHtml(
                      String(
                        property.description
                      ).slice(0, 180)
                    )}
                    ${
                      String(
                        property.description
                      ).length > 180
                        ? "…"
                        : ""
                    }
                  </p>
                `
                : ""
            }

            <div class="srf-buttons">

              <button
                type="button"
                class="srf-details-btn"
                data-id="${escapeHtml(property.id)}"
              >
                View Property Details
              </button>

              <a
                class="srf-whatsapp-btn"
                href="${propertyWhatsApp(property)}"
                target="_blank"
                rel="noopener"
              >
                💬 Enquire on WhatsApp
              </a>

            </div>

          </div>

        </article>
      `;
    })
    .join("");

  /* Details buttons */

  grid
    .querySelectorAll(".srf-details-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        openPropertyDetails(
          button.dataset.id
        );
      });
    });

  /* Photo thumbnails */

  grid
    .querySelectorAll(".srf-gallery-wrap")
    .forEach(wrapper => {

      const main =
        wrapper.querySelector(
          ".srf-main-photo"
        );

      wrapper
        .querySelectorAll(
          ".srf-photo-thumb"
        )
        .forEach(thumb => {

          thumb.addEventListener(
            "click",
            event => {
              event.stopPropagation();

              main.src =
                thumb.dataset.photo;
            }
          );
        });
    });
}

/* ---------- Load Properties ---------- */

async function loadListings() {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  grid.innerHTML = `
    <div class="listing-empty">
      Loading properties...
    </div>
  `;

  let result =
    await db
      .from("room")
      .select("*")
      .eq("status", "available")
      .eq("approval_status", "approved")
      .order("created_at", {
        ascending: false
      });

  /* If created_at does not exist */

  if (
    result.error &&
    /created_at/i.test(
      result.error.message
    )
  ) {
    result =
      await db
        .from("room")
        .select("*")
        .eq("status", "available")
        .eq("approval_status", "approved");
  }

  if (result.error) {
    console.error(
      "Property loading error:",
      result.error
    );

    grid.innerHTML = `
      <div class="listing-empty">
        Unable to load properties right now.
        Please refresh the page.
      </div>
    `;

    return;
  }

  listings = result.data || [];

  renderListings();
}

/* ---------- Sponsors / Ads ---------- */

async function loadSponsors() {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) return;

  let wrap =
    document.getElementById(
      "srfSponsorWrap"
    );

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

  const result =
    await db
      .from("sponsors")
      .select("*")
      .eq("status", "active")
      .order("created_at", {
        ascending: false
      });

  if (result.error) {
    console.warn(
      "Sponsors unavailable:",
      result.error.message
    );

    wrap.innerHTML = "";
    return;
  }

  const now = new Date();

  const active =
    (result.data || []).filter(
      sponsor => {

        const start =
          sponsor.start_date
            ? new Date(
                sponsor.start_date +
                "T00:00:00"
              )
            : null;

        const end =
          sponsor.end_date
            ? new Date(
                sponsor.end_date +
                "T23:59:59"
              )
            : null;

        return (
          (!start || now >= start) &&
          (!end || now <= end)
        );
      }
    );

  if (!active.length) {
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML = `
    <div class="srf-sponsors">

      ${active
        .map(sponsor => {

          const image =
            sponsor.image_url ||
            sponsor.image ||
            "";

          const link =
            sponsor.link_url ||
            sponsor.link ||
            "";

          const content = `
            ${
              image
                ? `
                  <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(
                      sponsor.title ||
                      "Advertisement"
                    )}"
                  >
                `
                : ""
            }

            <div class="srf-sponsor-body">

              <div class="srf-sponsored">
                Sponsored
              </div>

              <h3>
                ${escapeHtml(
                  sponsor.title ||
                  sponsor.sponsor_name ||
                  "Advertisement"
                )}
              </h3>

              ${
                sponsor.description
                  ? `
                    <p>
                      ${escapeHtml(
                        sponsor.description
                      )}
                    </p>
                  `
                  : ""
              }

            </div>
          `;

          if (link) {
            return `
              <a
                class="srf-sponsor"
                href="${escapeHtml(link)}"
       
