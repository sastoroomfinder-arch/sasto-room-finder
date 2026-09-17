// Sasto Room Finder - PUBLIC PROPERTY LISTINGS

const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

const ADMIN_WHATSAPP = "9779818067008";

let db = null;
let listings = [];

/* =========================
   LOAD SUPABASE
========================= */

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
        reject(
          new Error("Supabase library could not be loaded.")
        );
        return;
      }

      const script = document.createElement("script");

      script.src = urls[i++];

      script.onload = () => {
        if (window.supabase) {
          resolve();
        } else {
          next();
        }
      };

      script.onerror = () => {
        next();
      };

      document.head.appendChild(script);
    }

    next();
  });
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================
   PRICE
========================= */

function formatPrice(price) {

  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "Contact for current price";
  }

  const number = Number(price);

  if (Number.isNaN(number)) {
    return String(price);
  }

  return "Rs. " +
    number.toLocaleString("en-IN") +
    " / month";
}


/* =========================
   PHOTOS
========================= */

function normalizePhotos(photos) {

  if (!photos) {
    return [];
  }

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


/* =========================
   WHATSAPP NUMBER
========================= */

function normalizeWhatsApp(phone) {

  if (!phone || !String(phone).trim()) {
    return ADMIN_WHATSAPP;
  }

  let number = String(phone)
    .trim()
    .replace(/\D/g, "");

  if (!number) {
    return ADMIN_WHATSAPP;
  }

  // Already has Nepal country code
  if (number.startsWith("977")) {
    return number;
  }

  // Local number with 0
  if (number.startsWith("0")) {
    number = number.substring(1);
  }

  // Nepal mobile number
  if (
    number.length === 10 &&
    (
      number.startsWith("98") ||
      number.startsWith("97")
    )
  ) {
    return "977" + number;
  }

  return number;
}


/* =========================
   PROPERTY WHATSAPP
========================= */

function getWhatsAppLink(property) {

  const number =
    normalizeWhatsApp(property.phone);

  const roomType =
    property.room_type ||
    "property";

  const location =
    property.location ||
    property.address ||
    "the listed property";

  const title =
    property.title ||
    "this property";

  const message =
    `Hello Sasto Room Finder, I am interested in ${title} at ${location}. ` +
    `Room type: ${roomType}. ` +
    `Please send me the current details.`;

  return (
    "https://wa.me/" +
    number +
    "?text=" +
    encodeURIComponent(message)
  );
}


/* =========================
   RENDER LISTINGS
========================= */

function renderListings(data = listings) {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) {
    return;
  }

  if (!data || !data.length) {

    grid.innerHTML = `
      <div class="listing-empty">
        No properties are currently available.
      </div>
    `;

    return;
  }

  grid.innerHTML = data.map(property => {

    const type =
      escapeHtml(
        property.room_type ||
        "Property"
      );

    const title =
      escapeHtml(
        property.title ||
        property.location ||
        "Property"
      );

    const location =
      escapeHtml(
        property.location ||
        "Location not provided"
      );

    const description =
      escapeHtml(
        property.description ||
        ""
      );

    const price =
      escapeHtml(
        formatPrice(property.price)
      );

    const photos =
      normalizePhotos(property.photos);

    const image =
      photos.length
        ? `
          <img
            src="${escapeHtml(photos[0])}"
            alt="${title}"
            class="listing-image"
            loading="lazy"
            onerror="this.style.display='none';"
          >
        `
        : "🏠";

    const whatsapp =
      getWhatsAppLink(property);

    return `
      <article class="listing">

        <div class="listing-photo">
          ${image}
        </div>

        <div class="listing-body">

          <span class="eyebrow">
            ${type}
          </span>

          <h3>
            ${title}
          </h3>

          <p>
            📍 ${location}
          </p>

          ${
            description
              ? `<p>${description}</p>`
              : ""
          }

          <div class="listing-price">
            ${price}
          </div>

          <a
            class="btn btn-dark full"
            style="margin-top:14px"
            href="${whatsapp}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enquire on WhatsApp
          </a>

        </div>

      </article>
    `;

  }).join("");
}


/* =========================
   LOAD APPROVED LISTINGS
========================= */

async function loadListings() {

  const grid =
    document.getElementById("listingGrid");

  if (!grid) {
    return;
  }

  grid.innerHTML = `
    <div class="listing-empty">
      Loading properties...
    </div>
  `;

  try {

    /*
      IMPORTANT:

      Only properties that are:
      1. approved
      2. available

      will appear publicly.
    */

    let result = await db
      .from("room")
      .select("*")
      .eq("status", "available")
      .eq("approval_status", "approved")
      .order("created_at", {
        ascending: false
      });

    /*
      If created_at does not exist,
      retry without ordering.
    */

    if (
      result.error &&
      /created_at/i.test(result.error.message)
    ) {

      result = await db
        .from("room")
        .select("*")
        .eq("status", "available")
        .eq("approval_status", "approved");
    }

    if (result.error) {

      console.error(
        "Supabase property loading error:",
        result.error
      );

      grid.innerHTML = `
        <div class="listing-empty">
          Unable to load properties right now.
          Please try again later.
        </div>
      `;

      return;
    }

    listings = result.data || [];

    renderListings();

  } catch (error) {

    console.error(
      "Property loading error:",
      error
    );

    grid.innerHTML = `
      <div class="listing-empty">
        Website connection is temporarily unavailable.
        Please refresh.
      </div>
    `;
  }
}


/* =========================
   FILTER PROPERTIES
========================= */

function filterProperties() {

  const search =
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
    listings.filter(property => {

      const text = [
        property.title,
        property.location,
        property.room_type,
        property.description,
        property.price
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!search || text.includes(search)) &&
        (
          !type ||
          String(
            property.room_type || ""
          )
            .toLowerCase()
            .includes(type)
        )
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

  const message =
    `Hello Sasto Room Finder. ` +
    `I need a property in ` +
    `${location || "Kathmandu Valley"} ` +
    `with budget ` +
    `${budget || "to be discussed"}. ` +
    `Please send available options.`;

  window.open(
    "https://wa.me/" +
    ADMIN_WHATSAPP +
    "?text=" +
    encodeURIComponent(message),
    "_blank"
  );
}


/* =========================
   OLD INQUIRY COMPATIBILITY
========================= */

function sendInquiry(event) {

  if (event) {
    event.preventDefault();
  }

  const nameField =
    document.getElementById("name");

  const phoneField =
    document.getElementById("phone");

  const needField =
    document.getElementById("need");

  const locationField =
    document.getElementById("location");

  const messageField =
    document.getElementById("message");

  const message =
    `Hello Sasto Room Finder Pvt. Ltd.
Name: ${nameField?.value || ""}
Phone: ${phoneField?.value || ""}
Need: ${needField?.value || ""}
Location: ${locationField?.value || ""}
Details/Budget: ${messageField?.value || ""}`;

  window.open(
    "https://wa.me/" +
    ADMIN_WHATSAPP +
    "?text=" +
    encodeURIComponent(message),
    "_blank"
  );
}


/* =========================
   START WEBSITE
========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      await loadSupabase();

      db =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );

      /*
        Your actual public page uses
        #listingGrid.
      */

      if (
        document.getElementById(
          "listingGrid"
        )
      ) {

        await loadListings();
      }

    } catch (error) {

      console.error(error);

      const grid =
        document.getElementById(
          "listingGrid"
        );

      if (grid) {

        grid.innerHTML = `
          <div class="listing-empty">
            Website connection is temporarily unavailable.
            Please refresh.
          </div>
        `;
      }
    }


    /* =========================
       MOBILE MENU
    ========================= */

    document
      .querySelector(".menu")
      ?.addEventListener(
        "click",
        () => {

          const nav =
            document.querySelector("nav");

          if (!nav) {
            return;
          }

          nav.style.display =
            nav.style.display === "flex"
              ? "none"
              : "flex";

          nav.style.flexDirection =
            "column";

          nav.style.position =
            "absolute";

          nav.style.top =
            "68px";

          nav.style.right =
            "4%";

          nav.style.background =
            "#fff";

          nav.style.padding =
            "18px";

          nav.style.border =
            "1px solid #dfe4df";

          nav.style.borderRadius =
            "12px";
        }
      );


    /* =========================
       FILTERS
    ========================= */

    document
      .getElementById(
        "filterSearch"
      )
      ?.addEventListener(
        "input",
        filterProperties
      );

    document
      .getElementById(
        "filterType"
      )
      ?.addEventListener(
        "change",
        filterProperties
      );

  }
);


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.loadListings =
  loadListings;

window.renderListings =
  renderListings;

window.filterProperties =
  filterProperties;

window.searchFromHome =
  searchFromHome;

window.sendInquiry =
  sendInquiry;

window.normalizeWhatsApp =
  normalizeWhatsApp;

window.getWhatsAppLink =
  getWhatsAppLink;
