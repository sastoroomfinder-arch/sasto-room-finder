/* =========================================================
   SASTO ROOM FINDER - PUBLIC WEBSITE SCRIPT
   Corrected version:
   - Only approved + available properties are public
   - WhatsApp goes to property's own phone number
   - Admin WhatsApp is fallback
   ========================================================= */

const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

const ADMIN_WHATSAPP = "9779818067008";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
  Convert phone number to WhatsApp format.

  Examples:
  9812345678      -> 9779812345678
  9812345678      -> 9779812345678
  09812345678     -> 9779812345678
  +9779812345678  -> 9779812345678
*/
function normalizeWhatsAppNumber(phone) {
  let number = String(phone || "").trim();

  if (!number) {
    return ADMIN_WHATSAPP;
  }

  number = number.replace(/\D/g, "");

  if (!number) {
    return ADMIN_WHATSAPP;
  }

  // Already Nepal country code
  if (number.startsWith("977")) {
    return number;
  }

  // Nepal local number beginning with 0
  if (number.startsWith("0")) {
    number = number.substring(1);
  }

  // Nepal mobile number
  if (
    number.length === 10 &&
    (number.startsWith("97") || number.startsWith("98"))
  ) {
    return "977" + number;
  }

  // If another valid international number was entered,
  // use it as entered.
  return number;
}

function getPropertyWhatsApp(property) {
  const phone = property?.phone;

  if (!phone || !String(phone).trim()) {
    return ADMIN_WHATSAPP;
  }

  return normalizeWhatsAppNumber(phone);
}

function propertyWhatsAppLink(property) {
  const number = getPropertyWhatsApp(property);

  const roomType =
    property?.room_type ||
    property?.type ||
    "property";

  const location =
    property?.location ||
    property?.address ||
    "the listed property";

  const title =
    property?.title ||
    "this property";

  const message =
    `Hello Sasto Room Finder, I am interested in ${title}. ` +
    `Room type: ${roomType}. ` +
    `Location: ${location}. ` +
    `Please send me the current details.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/* =========================================================
   IMAGE HELPERS
   ========================================================= */

function getFirstImage(property) {
  if (!property) return "";

  let photos = property.photos;

  if (typeof photos === "string") {
    try {
      photos = JSON.parse(photos);
    } catch (e) {
      photos = [photos];
    }
  }

  if (Array.isArray(photos) && photos.length > 0) {
    return photos[0];
  }

  if (property.image_url) {
    return property.image_url;
  }

  if (property.image) {
    return property.image;
  }

  return "";
}

function getAllImages(property) {
  let photos = property?.photos;

  if (typeof photos === "string") {
    try {
      photos = JSON.parse(photos);
    } catch (e) {
      photos = [photos];
    }
  }

  if (Array.isArray(photos)) {
    return photos.filter(Boolean);
  }

  if (property?.image_url) {
    return [property.image_url];
  }

  if (property?.image) {
    return [property.image];
  }

  return [];
}

/* =========================================================
   FORMATTERS
   ========================================================= */

function formatPrice(price) {
  if (
    price === null ||
    price === undefined ||
    price === "" ||
    Number.isNaN(Number(price))
  ) {
    return "Price on request";
  }

  return "Rs. " + Number(price).toLocaleString("en-IN");
}

function formatDate(date) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (e) {
    return "";
  }
}

/* =========================================================
   PROPERTY CARD
   ========================================================= */

function createPropertyCard(property) {
  const image = getFirstImage(property);

  const title =
    property.title ||
    property.room_type ||
    "Room / Property";

  const location =
    property.location ||
    property.address ||
    "Location not specified";

  const description =
    property.description ||
    "Contact owner for more details.";

  const roomType =
    property.room_type ||
    property.type ||
    "Room";

  const price = formatPrice(property.price);

  const whatsapp = propertyWhatsAppLink(property);

  const imageHTML = image
    ? `
      <img
        src="${escapeHTML(image)}"
        alt="${escapeHTML(title)}"
        loading="lazy"
        onerror="this.style.display='none';"
      >
    `
    : `
      <div class="listing-image-placeholder">
        <span>🏠</span>
      </div>
    `;

  return `
    <article class="listing">

      <div class="listing-image">
        ${imageHTML}
      </div>

      <div class="listing-content">

        <h3>${escapeHTML(title)}</h3>

        <p class="listing-location">
          📍 ${escapeHTML(location)}
        </p>

        <p class="listing-price">
          ${escapeHTML(price)}
        </p>

        <p class="listing-type">
          ${escapeHTML(roomType)}
        </p>

        <p class="listing-description">
          ${escapeHTML(description)}
        </p>

        ${
          property.bedrooms
            ? `<p>🛏 Bedrooms: ${escapeHTML(property.bedrooms)}</p>`
            : ""
        }

        ${
          property.bathrooms
            ? `<p>🚿 Bathrooms: ${escapeHTML(property.bathrooms)}</p>`
            : ""
        }

        ${
          property.furnished === true
            ? `<p>🛋 Furnished</p>`
            : ""
        }

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
}

/* =========================================================
   LOAD PUBLIC LISTINGS
   ========================================================= */

async function loadListings() {
  const container =
    $("listings") ||
    $("property-listings") ||
    $("properties") ||
    $("rooms");

  if (!container) {
    console.warn("Listing container not found.");
    return;
  }

  container.innerHTML = `
    <div class="loading">
      Loading properties...
    </div>
  `;

  try {
    /*
      IMPORTANT:
      Public website will ONLY receive:
      approval_status = approved
      status = available
    */

    let result = await db
      .from("room")
      .select("*")
      .eq("approval_status", "approved")
      .eq("status", "available")
      .order("created_at", {
        ascending: false
      });

    /*
      Some old database versions may not have created_at.
      Retry without ordering if needed.
    */

    if (result.error) {
      console.warn(
        "First listing query failed. Retrying...",
        result.error
      );

      result = await db
        .from("room")
        .select("*")
        .eq("approval_status", "approved")
        .eq("status", "available");
    }

    if (result.error) {
      console.error(
        "Supabase listing error:",
        result.error
      );

      container.innerHTML = `
        <div class="empty-state">
          <h3>Unable to load properties</h3>
          <p>Please try again later.</p>
        </div>
      `;

      return;
    }

    const properties = result.data || [];

    if (!properties.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No properties available</h3>
          <p>New rooms and properties will appear here after approval.</p>
        </div>
      `;

      return;
    }

    container.innerHTML = properties
      .map(createPropertyCard)
      .join("");

  } catch (error) {
    console.error(
      "Unexpected listing error:",
      error
    );

    container.innerHTML = `
      <div class="empty-state">
        <h3>Something went wrong</h3>
        <p>Please refresh the page and try again.</p>
      </div>
    `;
  }
}

/* =========================================================
   HOME SEARCH
   ========================================================= */

function searchFromHome() {
  const locationInput =
    $("homeLocation") ||
    $("location") ||
    $("searchLocation") ||
    $("search-location");

  const typeInput =
    $("homeType") ||
    $("type") ||
    $("searchType") ||
    $("search-type");

  const location =
    locationInput?.value?.trim() || "";

  const type =
    typeInput?.value?.trim() || "";

  const params = new URLSearchParams();

  if (location) {
    params.set("location", location);
  }

  if (type) {
    params.set("type", type);
  }

  /*
    If your public page has a properties.html page,
    send the search there.
  */

  const target =
    "properties.html" +
    (params.toString()
      ? "?" + params.toString()
      : "");

  window.location.href = target;
}

/* =========================================================
   SEARCH LISTINGS ON PROPERTIES PAGE
   ========================================================= */

async function searchListings() {
  const container =
    $("listings") ||
    $("property-listings") ||
    $("properties") ||
    $("rooms");

  if (!container) {
    return;
  }

  const params =
    new URLSearchParams(window.location.search);

  const location =
    (params.get("location") || "").trim();

  const type =
    (params.get("type") || "").trim();

  container.innerHTML = `
    <div class="loading">
      Searching properties...
    </div>
  `;

  try {
    let query = db
      .from("room")
      .select("*")
      .eq("approval_status", "approved")
      .eq("status", "available");

    if (location) {
      query = query.ilike(
        "location",
        `%${location}%`
      );
    }

    if (type) {
      query = query.ilike(
        "room_type",
        `%${type}%`
      );
    }

    let result = await query.order(
      "created_at",
      {
        ascending: false
      }
    );

    if (result.error) {
      /*
        Retry without created_at ordering.
      */

      let retry = db
        .from("room")
        .select("*")
        .eq("approval_status", "approved")
        .eq("status", "available");

      if (location) {
        retry = retry.ilike(
          "location",
          `%${location}%`
        );
      }

      if (type) {
        retry = retry.ilike(
          "room_type",
          `%${type}%`
        );
      }

      result = await retry;
    }

    if (result.error) {
      console.error(
        "Search error:",
        result.error
      );

      container.innerHTML = `
        <div class="empty-state">
          <h3>Unable to search</h3>
          <p>Please try again.</p>
        </div>
      `;

      return;
    }

    const properties =
      result.data || [];

    if (!properties.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No matching properties found</h3>
          <p>Try another location or room type.</p>
        </div>
      `;

      return;
    }

    container.innerHTML =
      properties
        .map(createPropertyCard)
        .join("");

  } catch (error) {
    console.error(
      "Search failed:",
      error
    );

    container.innerHTML = `
      <div class="empty-state">
        <h3>Something went wrong</h3>
        <p>Please refresh and try again.</p>
      </div>
    `;
  }
}

/* =========================================================
   DIRECT WHATSAPP INQUIRY
   ========================================================= */

function enquireOnWhatsApp(property) {
  const link =
    propertyWhatsAppLink(property);

  window.open(
    link,
    "_blank",
    "noopener,noreferrer"
  );
}

/* =========================================================
   OLD INQUIRY FUNCTION
   Kept for compatibility with existing HTML.
   It now uses the property's phone number.
   ========================================================= */

async function sendInquiry(property) {
  if (!property) {
    return;
  }

  const whatsapp =
    propertyWhatsAppLink(property);

  window.open(
    whatsapp,
    "_blank",
    "noopener,noreferrer"
  );
}

/* =========================================================
   SPONSORS
   ========================================================= */

async function loadSponsors() {
  const containers = [
    $("sponsors"),
    $("sponsor-list"),
    $("sponsorList"),
    $("ads"),
    $("advertisements")
  ].filter(Boolean);

  if (!containers.length) {
    return;
  }

  try {
    const { data, error } =
      await db
        .from("sponsors")
        .select("*")
        .eq("active", true)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.warn(
        "Sponsors could not be loaded:",
        error
      );
      return;
    }

    const sponsors = data || [];

    if (!sponsors.length) {
      containers.forEach(
        container => {
          container.innerHTML = "";
        }
      );
      return;
    }

    const html =
      sponsors
        .map(sponsor => {

          const image =
            sponsor.image_url ||
            sponsor.image ||
            "";

          const title =
            sponsor.title ||
            sponsor.name ||
            "Sponsor";

          const description =
            sponsor.description ||
            "";

          const link =
            sponsor.link ||
            sponsor.url ||
            "#";

          return `
            <div class="sponsor-card">

              ${
                image
                  ? `
                    <img
                      src="${escapeHTML(image)}"
                      alt="${escapeHTML(title)}"
                      loading="lazy"
                    >
                  `
                  : ""
              }

              <h3>
                ${escapeHTML(title)}
              </h3>

              ${
                description
                  ? `
                    <p>
                      ${escapeHTML(description)}
                    </p>
                  `
                  : ""
              }

              ${
                link !== "#"
                  ? `
                    <a
                      href="${escapeHTML(link)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Sponsor
                    </a>
                  `
                  : ""
              }

            </div>
          `;
        })
        .join("");

    containers.forEach(
      container => {
        container.innerHTML = html;
      }
    );

  } catch (error) {
    console.warn(
      "Sponsor loading error:",
      error
    );
  }
}

/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

function initializePublicWebsite() {

  /*
    Load sponsors wherever sponsor containers exist.
  */

  loadSponsors();

  /*
    If URL has search parameters,
    use searchListings().
    Otherwise load all approved listings.
  */

  const hasSearch =
    new URLSearchParams(
      window.location.search
    ).has("location") ||
    new URLSearchParams(
      window.location.search
    ).has("type");

  if (hasSearch) {
    searchListings();
  } else {
    loadListings();
  }
}

/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializePublicWebsite
  );
} else {
  initializePublicWebsite();
}

/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.loadListings =
  loadListings;

window.searchListings =
  searchListings;

window.searchFromHome =
  searchFromHome;

window.sendInquiry =
  sendInquiry;

window.enquireOnWhatsApp =
  enquireOnWhatsApp;

window.loadSponsors =
  loadSponsors;

window.propertyWhatsAppLink =
  propertyWhatsAppLink;

window.normalizeWhatsAppNumber =
  normalizeWhatsAppNumber;
