const SUPABASE_URL =
  "https://amhrnahjshsgelacqzyl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFJ";

const ADMIN_WHATSAPP = "9779818067008";

let listings = [];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTitle(room) {
  return room.title || room.name || "Room / Property";
}

function getLocation(room) {
  return (
    room.location ||
    room.address ||
    room.area ||
    room.city ||
    "Kathmandu Valley"
  );
}

function getType(room) {
  return (
    room.room_type ||
    room.property_type ||
    room.type ||
    "Property"
  );
}

function getPrice(room) {
  const value =
    room.price ??
    room.rent ??
    room.monthly_rent;

  if (value === null || value === undefined || value === "") {
    return "Contact for price";
  }

  const number = Number(value);

  if (Number.isFinite(number)) {
    return "Rs. " + number.toLocaleString("en-IN") + " / month";
  }

  return String(value);
}

function getPhotos(room) {
  let value =
    room.photos ||
    room.images ||
    room.image_urls ||
    [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (error) {}

    return value
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  return [];
}

function getPhone(room) {
  let phone =
    room.phone ||
    room.whatsapp ||
    ADMIN_WHATSAPP;

  phone = String(phone).replace(/\D/g, "");

  if (phone.startsWith("0")) {
    phone = "977" + phone.substring(1);
  }

  if (phone.length === 10) {
    phone = "977" + phone;
  }

  return phone || ADMIN_WHATSAPP;
}

function whatsappLink(room) {
  const message =
    "Hello Sasto Room Finder, I am interested in " +
    getTitle(room) +
    " at " +
    getLocation(room) +
    ". Please send current details.";

  return (
    "https://wa.me/" +
    getPhone(room) +
    "?text=" +
    encodeURIComponent(message)
  );
}

function renderListings(rows) {
  const grid =
    document.getElementById("listingGrid");

  if (!grid) {
    return;
  }

  if (!rows || rows.length === 0) {
    grid.innerHTML =
      '<div class="listing-empty">No properties found.</div>';
    return;
  }

  grid.innerHTML = rows.map(room => {

    const photos = getPhotos(room);

    let photoHTML;

    if (photos.length > 0) {
      photoHTML =
        '<img src="' +
        esc(photos[0]) +
        '" alt="' +
        esc(getTitle(room)) +
        '" loading="lazy">';
    } else {
      photoHTML =
        '<div style="' +
        'height:220px;' +
        'display:flex;' +
        'align-items:center;' +
        'justify-content:center;' +
        'background:#eef2f0;' +
        'font-size:50px;' +
        '">🏠</div>';
    }

    return `
      <article class="listing">

        <div class="listing-photo">
          ${photoHTML}
        </div>

        <div class="listing-body">

          <span class="eyebrow">
            ${esc(getType(room))}
          </span>

          <h3>
            ${esc(getTitle(room))}
          </h3>

          <p>
            ${esc(getLocation(room))}
          </p>

          ${
            room.description
              ? `<p>${esc(room.description)}</p>`
              : ""
          }

          <div class="listing-price">
            ${esc(getPrice(room))}
          </div>

          <a
            class="btn btn-dark full"
            style="margin-top:14px"
            href="${whatsappLink(room)}"
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

  if (!grid) {
    return;
  }

  grid.innerHTML =
    '<div class="listing-empty">Loading properties...</div>';

  try {

    const url =
      SUPABASE_URL +
      "/rest/v1/room" +
      "?select=*" +
      "&status=eq.available" +
      "&approval_status=eq.approved" +
      "&order=created_at.desc";

    const response =
      await fetch(url, {
        method: "GET",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
          "Accept": "application/json"
        },

        cache: "no-store"
      });

    if (!response.ok) {
      throw new Error(
        "Supabase HTTP " +
        response.status +
        ": " +
        await response.text()
      );
    }

    const data =
      await response.json();

    listings =
      Array.isArray(data)
        ? data
        : [];

    renderListings(listings);

  } catch (error) {

    console.error(
      "Sasto Room Finder error:",
      error
    );

    grid.innerHTML =
      '<div class="listing-empty">' +
      'Unable to load properties right now.' +
      '</div>';
  }
}

function filterProperties() {

  const search =
    (
      document.getElementById("filterSearch")?.value ||
      ""
    ).toLowerCase().trim();

  const type =
    (
      document.getElementById("filterType")?.value ||
      ""
    ).toLowerCase().trim();

  const filtered =
    listings.filter(room => {

      const text = [
        getTitle(room),
        getLocation(room),
        getType(room),
        room.description || "",
        room.price || ""
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        text.includes(search);

      const matchesType =
        !type ||
        getType(room)
          .toLowerCase()
          .includes(type);

      return (
        matchesSearch &&
        matchesType
      );
    });

  renderListings(filtered);
}

window.filterProperties =
  filterProperties;

window.loadListings =
  loadListings;

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadListings();

    const search =
      document.getElementById(
        "filterSearch"
      );

    const type =
      document.getElementById(
        "filterType"
      );

    if (search) {
      search.addEventListener(
        "input",
        filterProperties
      );
    }

    if (type) {
      type.addEventListener(
        "change",
        filterProperties
      );
    }
  }
);
