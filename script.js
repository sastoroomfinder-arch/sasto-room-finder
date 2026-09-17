// Sasto Room Finder - public property listings
const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

let db = null;
let listings = [];

function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) return resolve();

    const urls = [
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
      "https://unpkg.com/@supabase/supabase-js@2"
    ];

    let i = 0;

    const next = () => {
      if (window.supabase) return resolve();

      if (i >= urls.length) {
        return reject(
          new Error("Supabase library could not be loaded.")
        );
      }

      const sc = document.createElement("script");
      sc.src = urls[i++];

      sc.onload = () => {
        window.supabase ? resolve() : next();
      };

      sc.onerror = next;

      document.head.appendChild(sc);
    };

    next();
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(price) {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "Contact for current price";
  }

  const n = Number(price);

  return Number.isNaN(n)
    ? String(price)
    : "Rs. " + n.toLocaleString("en-IN") + " / month";
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
    } catch (e) {}

    return value
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);
  }

  return [];
}

/* =========================================================
   PUBLIC UI
   ========================================================= */

function ensurePublicUI() {
  if (!document.getElementById("srf-public-styles")) {
    const st = document.createElement("style");

    st.id = "srf-public-styles";

    st.textContent = `
      .srf-sponsors{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:16px;
        margin:0 0 28px;
      }

      .srf-sponsor{
        border:1px solid #e2e8e4;
        border-radius:14px;
        overflow:hidden;
        background:#fff;
        display:block;
        text-decoration:none;
        color:inherit;
      }

      .srf-sponsor img{
        width:100%;
        height:130px;
        object-fit:cover;
        display:block;
      }

      .srf-sponsor-body{
        padding:14px;
      }

      .srf-sponsor-body h3{
        margin:4px 0 6px;
      }

      .srf-sponsor-body p{
        margin:0 0 8px;
      }

      .srf-inquire{
        border:0;
        cursor:pointer;
        padding:11px 15px;
        border-radius:9px;
        background:#111;
        color:#fff;
        font-weight:700;
        width:100%;
        margin-top:12px;
      }

      .srf-modal{
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.55);
        display:none;
        align-items:center;
        justify-content:center;
        padding:18px;
        z-index:9999;
      }

      .srf-modal.open{
        display:flex;
      }

      .srf-box{
        background:#fff;
        width:min(520px,100%);
        border-radius:16px;
        padding:20px;
        position:relative;
      }

      .srf-box h2{
        margin:0 30px 6px 0;
      }

      .srf-close{
        position:absolute;
        right:12px;
        top:10px;
        border:0;
        background:none;
        font-size:28px;
        cursor:pointer;
      }

      .srf-box label{
        display:block;
        font-weight:600;
        margin-top:11px;
      }

      .srf-box input,
      .srf-box textarea{
        width:100%;
        box-sizing:border-box;
        padding:11px;
        margin-top:5px;
        border:1px solid #ccd5cf;
        border-radius:9px;
        font:inherit;
      }

      .srf-box textarea{
        min-height:90px;
        resize:vertical;
      }

      .srf-submit{
        width:100%;
        margin-top:14px;
        padding:12px;
        border:0;
        border-radius:9px;
        background:#111;
        color:#fff;
        font-weight:700;
      }

      .srf-msg{
        margin-top:10px;
        font-weight:600;
      }

      .srf-sponsored-label{
        font-size:12px;
        letter-spacing:.04em;
        text-transform:uppercase;
        opacity:.65;
      }
    `;

    document.head.appendChild(st);
  }

  if (!document.getElementById("srfInquiryModal")) {
    const m = document.createElement("div");

    m.id = "srfInquiryModal";
    m.className = "srf-modal";

    m.innerHTML = `
      <div class="srf-box" role="dialog" aria-modal="true">

        <button
          class="srf-close"
          type="button"
          aria-label="Close"
        >×</button>

        <h2>Send Inquiry</h2>

        <p id="srfInquiryProperty"></p>

        <form id="srfInquiryForm">

          <label>
            Name
            <input
              id="srfName"
              required
              maxlength="100"
            >
          </label>

          <label>
            Phone
            <input
              id="srfPhone"
              required
              maxlength="30"
              inputmode="tel"
            >
          </label>

          <label>
            Message
            <textarea
              id="srfMessage"
              maxlength="1000"
              required
            ></textarea>
          </label>

          <button
            class="srf-submit"
            type="submit"
          >
            Send Inquiry
          </button>

          <div
            id="srfInquiryMsg"
            class="srf-msg"
            aria-live="polite"
          ></div>

        </form>

      </div>
    `;

    document.body.appendChild(m);

    m.querySelector(".srf-close")
      .addEventListener("click", closeInquiry);

    m.addEventListener("click", e => {
      if (e.target === m) {
        closeInquiry();
      }
    });

    m.querySelector("#srfInquiryForm")
      .addEventListener("submit", submitInquiry);
  }

  if (!document.getElementById("srfSponsorWrap")) {
    const g = document.getElementById("listingGrid");

    if (g) {
      const wrap = document.createElement("div");

      wrap.id = "srfSponsorWrap";

      g.parentNode.insertBefore(wrap, g);
    }
  }
}

let inquiryRoom = null;

/* =========================================================
   INQUIRY
   ========================================================= */

function openInquiry(room) {
  ensurePublicUI();

  inquiryRoom = room;

  document.getElementById(
    "srfInquiryProperty"
  ).textContent =
    "Property: " +
    (room.title ||
      room.location ||
      "Selected property");

  document.getElementById(
    "srfInquiryMsg"
  ).textContent = "";

  document.getElementById(
    "srfInquiryForm"
  ).reset();

  document.getElementById(
    "srfInquiryModal"
  ).classList.add("open");

  document.getElementById(
    "srfName"
  ).focus();
}

function closeInquiry() {
  document.getElementById(
    "srfInquiryModal"
  )?.classList.remove("open");

  inquiryRoom = null;
}

async function submitInquiry(e) {
  e.preventDefault();

  if (!inquiryRoom) return;

  const msg =
    document.getElementById("srfInquiryMsg");

  msg.textContent = "Sending...";

  const { error } = await db
    .from("inquiries")
    .insert({
      room_id: inquiryRoom.id || null,
      owner_id: inquiryRoom.owner_id || null,
      property_title:
        inquiryRoom.title ||
        inquiryRoom.location ||
        "Property",

      name:
        document.getElementById(
          "srfName"
        ).value.trim(),

      phone:
        document.getElementById(
          "srfPhone"
        ).value.trim(),

      message:
        document.getElementById(
          "srfMessage"
        ).value.trim(),

      status: "new"
    });

  if (error) {
    console.error(
      "Inquiry error:",
      error
    );

    msg.textContent =
      "Unable to send inquiry. Please try again.";

    return;
  }

  msg.textContent =
    "Inquiry sent successfully.";

  setTimeout(
    closeInquiry,
    900
  );
}

/* =========================================================
   WHATSAPP
   ========================================================= */

function waNumber(value) {
  let n = String(value || "")
    .replace(/[^\d]/g, "");

  if (n.startsWith("0")) {
    n = "977" + n.slice(1);
  } else if (
    n.startsWith("98") &&
    n.length === 10
  ) {
    n = "977" + n;
  }

  return n || "9779818067008";
}

function propertyWhatsApp(x) {
  const msg =
`Hello Sasto Room Finder. I am interested in this property:
${x.title || "Property"}
Location: ${x.location || x.address || "Not specified"}
Price: Rs. ${x.price || "Contact for price"}

Please send me the current details.`;

  return (
    "https://wa.me/" +
    waNumber(x.phone) +
    "?text=" +
    encodeURIComponent(msg)
  );
}

/* =========================================================
   PROPERTY DETAILS MODAL
   ========================================================= */

function ensurePropertyModal() {
  if (
    document.getElementById(
      "srfPropertyModal"
    )
  ) {
    return;
  }

  const st =
    document.createElement("style");

  st.id = "srf-property-style";

  st.textContent = `
    #srfPropertyModal{
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.68);
      z-index:99999;
      display:none;
      align-items:center;
      justify-content:center;
      padding:16px;
    }

    #srfPropertyModal.open{
      display:flex;
    }

    #srfPropertyModal .srf-box{
      background:#fff;
      border-radius:16px;
      max-width:900px;
      width:100%;
      max-height:92vh;
      overflow:auto;
      position:relative;
    }

    #srfPropertyModal .srf-close{
      position:absolute;
      right:12px;
      top:10px;
      border:0;
      background:#fff;
      border-radius:50%;
      width:42px;
      height:42px;
      font-size:24px;
      cursor:pointer;
      z-index:2;
    }

    #srfPropertyModal .srf-main-img{
      width:100%;
      height:min(58vw,440px);
      object-fit:cover;
      background:#eef3f8;
    }

    #srfPropertyModal .srf-thumbs{
      display:flex;
      gap:8px;
      overflow:auto;
      padding:10px 14px;
    }

    #srfPropertyModal .srf-thumbs img{
      width:72px;
      height:58px;
      object-fit:cover;
      border-radius:8px;
      cursor:pointer;
      flex:0 0 auto;
    }

    #srfPropertyModal .srf-body{
      padding:16px 18px 22px;
    }

    #srfPropertyModal .srf-body h2{
      margin:0 0 8px;
    }

    #srfPropertyModal .srf-meta{
      display:grid;
      grid-template-columns:
        repeat(2,minmax(0,1fr));
      gap:8px;
      margin:14px 0;
    }

    #srfPropertyModal .srf-meta div{
      padding:9px 10px;
      background:#f5f8fb;
      border-radius:9px;
    }

    #srfPropertyModal .srf-wa{
      display:block;
      text-align:center;
      text-decoration:none;
      padding:12px;
      border-radius:10px;
      background:#16834f;
      color:#fff;
      font-weight:700;
      margin-top:14px;
    }

    @media(max-width:560px){
      #srfPropertyModal .srf-meta{
        grid-template-columns:1fr;
      }

      #srfPropertyModal{
        padding:8px;
      }

      #srfPropertyModal .srf-main-img{
        height:55vw;
      }
    }
  `;

  document.head.appendChild(st);

  const m =
    document.createElement("div");

  m.id = "srfPropertyModal";

  m.innerHTML = `
    <div class="srf-box">

      <button
        class="srf-close"
        type="button"
        aria-label="Close"
      >×</button>

      <img
        class="srf-main-img"
        id="srfModalImg"
        alt=""
      >

      <div
        class="srf-thumbs"
        id="srfModalThumbs"
      ></div>

      <div
        class="srf-body"
        id="srfModalBody"
      ></div>

    </div>
  `;

  document.body.appendChild(m);

  m.querySelector(".srf-close")
    .addEventListener(
      "click",
      () => m.classList.remove("open")
    );

  m.addEventListener("click", e => {
    if (e.target === m) {
      m.classList.remove("open");
    }
  });
}

function openPropertyDetails(id) {
  const x = listings.find(
    r => String(r.id) === String(id)
  );

  if (!x) return;

  ensurePropertyModal();

  const photos =
    normalizePhotos(x.photos);

  const img =
    document.getElementById(
      "srfModalImg"
    );

  const thumbs =
    document.getElementById(
      "srfModalThumbs"
    );

  img.src = photos[0] || "";
  img.alt =
    x.title ||
    "Property photo";

  thumbs.innerHTML =
    photos
      .map(
        (p, i) =>
          `<img
            src="${escapeHtml(p)}"
            alt="Photo ${i + 1}"
            data-photo="${escapeHtml(p)}"
          >`
      )
      .join("");

  thumbs
    .querySelectorAll("img")
    .forEach(t => {
      t.addEventListener(
        "click",
        () => {
          img.src =
            t.dataset.photo;
        }
      );
    });

  const price =
    x.price !== null &&
    x.price !== undefined &&
    x.price !== ""
      ? "Rs. " +
        Number(x.price)
          .toLocaleString() +
        " / month"
      : "Contact for price";

  document.getElementById(
    "srfModalBody"
  ).innerHTML = `

    <h2>
      ${escapeHtml(
        x.title || "Property"
      )}
    </h2>

    <div>
      ${escapeHtml(
        x.location ||
        x.address ||
        "Location not specified"
      )}
    </div>

    <div class="srf-meta">

      <div>
        <b>Price</b><br>
        ${escapeHtml(price)}
      </div>

      <div>
        <b>Type</b><br>
        ${escapeHtml(
          x.room_type ||
          "Property"
        )}
      </div>

      <div>
        <b>Bedrooms</b><br>
        ${escapeHtml(
          x.bedrooms ??
          "—"
        )}
      </div>

      <div>
        <b>Bathrooms</b><br>
        ${escapeHtml(
          x.bathrooms ??
          "—"
        )}
      </div>

      <div>
        <b>Furnished</b><br>
        ${
          x.furnished === true
            ? "Yes"
            : "No"
        }
      </div>

      <div>
        <b>Contact</b><br>
        ${escapeHtml(
          x.phone ||
          "Not provided"
        )}
      </div>

    </div>

    ${
      x.description
        ? `<p>
            ${escapeHtml(
              String(x.description)
            ).replace(
              /\n/g,
              "<br>"
            )}
          </p>`
        : ""
    }

    ${
      x.address
        ? `<p>
            <b>Address / Area:</b>
            ${escapeHtml(
              x.address
            )}
          </p>`
        : ""
    }

    <a
      class="srf-wa"
      href="${propertyWhatsApp(x)}"
      target="_blank"
      rel="noopener"
    >
      WhatsApp Owner
    </a>
  `;

  document
    .getElementById(
      "srfPropertyModal"
    )
    .classList.add("open");
}

/* =========================================================
   PROPERTY GALLERY
   ========================================================= */

function ensurePublicGalleryStyle() {
  if (
    document.getElementById(
      "srf-gallery-style"
    )
  ) {
    return;
  }

  const st =
    document.createElement("style");

  st.id = "srf-gallery-style";

  st.textContent = `
    .srf-gallery{
      position:relative;
      background:#eef3f8;
    }

    .srf-card-img{
      display:block;
      width:100%;
      height:240px;
      object-fit:cover;
    }

    .srf-photo-row{
      display:flex;
      gap:6px;
      padding:7px;
      overflow-x:auto;
      background:#fff;
    }

    .srf-photo-row img{
      width:58px;
      height:48px;
      object-fit:cover;
      border-radius:6px;
      cursor:pointer;
      flex:0 0 auto;
    }

    .srf-photo-count{
      position:absolute;
      right:8px;
      top:8px;
      background:rgba(0,0,0,.68);
      color:#fff;
      padding:5px 8px;
      border-radius:999px;
      font-size:12px;
    }

    .srf-no-photo{
      height:240px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#eef3f8;
      color:#71839b;
    }

    @media(max-width:600px){
      .srf-card-img{
        height:210px;
      }

      .srf-no-photo{
        height:210px;
      }
    }
  `;

  document.head.appendChild(st);
}

/* =========================================================
   RENDER LISTINGS
   ========================================================= */

function renderListings(items = listings) {
  ensurePublicGalleryStyle();

  const g =
    document.getElementById(
      "listingGrid"
    );

  if (!g) return;

  if (!items.length) {
    g.innerHTML =
      '<div class="listing-empty">No properties available right now.</div>';

    return;
  }

  g.innerHTML =
    items
      .map(x => {

        const photos =
          normalizePhotos(
            x.photos
          );

        const first =
          photos[0] || "";

        const price =
          x.price !== null &&
          x.price !== undefined &&
          x.price !== ""
            ? "Rs. " +
              Number(x.price)
                .toLocaleString() +
              " / month"
            : "Contact for price";

        const wa =
          propertyWhatsApp(x);

        const gallery =
          photos.length
            ? `
              <div class="srf-gallery">

                <img
                  class="srf-card-img"
                  src="${escapeHtml(first)}"
                  alt="${escapeHtml(
                    x.title ||
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
                            (p, i) =>
                              `
                              <img
                                src="${escapeHtml(p)}"
                                data-photo="${escapeHtml(p)}"
                                alt="Photo ${i + 1}"
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
            `
            : `
              <div class="srf-no-photo">
                No photo available
              </div>
            `;

        return `
          <article
            class="listing"
            data-id="${escapeHtml(
              x.id
            )}"
          >

            ${gallery}

            <div class="listing-body">

              <h3>
                ${escapeHtml(
                  x.title ||
                  "Property"
                )}
              </h3>

              <div class="listing-location">
                ${escapeHtml(
                  x.location ||
                  x.address ||
                  ""
                )}
              </div>

              <div class="listing-price">
                ${escapeHtml(price)}
              </div>

              <div class="listing-meta">

                ${escapeHtml(
                  x.room_type ||
                  ""
                )}

                ${
                  x.bedrooms !==
                    null &&
                  x.bedrooms !==
                    undefined
                    ? " • " +
                      escapeHtml(
                      
