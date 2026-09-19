"use strict";

const SUPABASE_URL =
  "https://amhrnahjshsgelacqzyl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

const ADMIN_WHATSAPP = "9779818067008";

window.listings = [];
var listings = window.listings;


/* =========================
   HELPERS
========================= */

function get(id) {
  return document.getElementById(id);
}

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function field(room, names, fallback) {
  var i;
  var value;

  for (i = 0; i < names.length; i++) {
    value = room[names[i]];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return fallback || "";
}

function propertyTitle(room) {
  return field(
    room,
    ["title", "name", "property_name"],
    "Room / Property"
  );
}

function propertyLocation(room) {
  return field(
    room,
    ["location", "address", "area", "city", "district"],
    "Kathmandu Valley"
  );
}

function propertyType(room) {
  return field(
    room,
    ["room_type", "property_type", "type", "category"],
    "Property"
  );
}

function propertyDescription(room) {
  return field(
    room,
    ["description", "details", "about"],
    ""
  );
}

function propertyPrice(room) {
  var value = field(
    room,
    ["price", "rent", "monthly_rent", "amount"],
    ""
  );

  if (value === "") {
    return "Contact for price";
  }

  var number = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "")
  );

  if (!isNaN(number)) {
    return (
      "Rs. " +
      number.toLocaleString("en-IN") +
      " / month"
    );
  }

  return String(value);
}


/* =========================
   PHOTOS
========================= */

function propertyPhotos(room) {

  var value = field(
    room,
    ["photos", "images", "image_urls", "photo_urls"],
    []
  );

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {

    if (!value.trim()) {
      return [];
    }

    try {
      var parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }

    } catch (e) {}

    return value
      .split(",")
      .map(function (x) {
        return x.trim();
      })
      .filter(Boolean);
  }

  return [];
}


/* =========================
   WHATSAPP
========================= */

function propertyPhone(room) {

  var phone = field(
    room,
    [
      "phone",
      "whatsapp",
      "whatsapp_number",
      "contact",
      "contact_number",
      "owner_phone",
      "mobile"
    ],
    ADMIN_WHATSAPP
  );

  phone = String(phone).replace(/\D/g, "");

  if (phone.indexOf("00") === 0) {
    phone = phone.substring(2);
  }

  if (phone.indexOf("0") === 0) {
    phone = "977" + phone.substring(1);
  }

  if (
    phone.length === 10 &&
    phone.indexOf("9") === 0
  ) {
    phone = "977" + phone;
  }

  return phone || ADMIN_WHATSAPP;
}

function whatsapp(room) {

  var text =
    "Hello Sasto Room Finder, I am interested in " +
    propertyTitle(room) +
    " at " +
    propertyLocation(room) +
    ". Please send current details.";

  return (
    "https://wa.me/" +
    propertyPhone(room) +
    "?text=" +
    encodeURIComponent(text)
  );
}


/* =========================
   MESSAGE
========================= */

function showMessage(text) {

  var grid = get("listingGrid");

  if (!grid) {
    return;
  }

  grid.innerHTML =
    '<div style="' +
    "grid-column:1/-1;" +
    "padding:30px;" +
    "text-align:center;" +
    "background:#f5f5f5;" +
    "border-radius:12px;" +
    '">' +
    esc(text) +
    "</div>";
}


/* =========================
   RENDER
========================= */

function renderListings(rows) {

  var grid = get("listingGrid");

  if (!grid) {
    console.error(
      "Sasto Room Finder: listingGrid not found."
    );
    return;
  }

  if (!rows || rows.length === 0) {

    showMessage(
      "No approved and available properties found."
    );

    return;
  }

  grid.innerHTML = rows.map(function (room) {

    var title = esc(propertyTitle(room));
    var location = esc(propertyLocation(room));
    var type = esc(propertyType(room));
    var description =
      esc(propertyDescription(room));
    var price =
      esc(propertyPrice(room));

    var pics = propertyPhotos(room);

    var photo;

    if (pics.length > 0) {

      photo =
        '<img src="' +
        esc(pics[0]) +
        '" ' +
        'alt="' +
        title +
        '" ' +
        'loading="lazy" ' +
        'style="width:100%;height:220px;object-fit:cover;">';

    } else {

      photo =
        '<div style="' +
        "height:220px;" +
        "display:flex;" +
        "align-items:center;" +
        "justify-content:center;" +
        "background:#eef2f0;" +
        "font-size:55px;" +
        '">' +
        "🏠" +
        "</div>";
    }

    return (
      '<article class="listing">' +

        '<div class="listing-photo">' +
          photo +
        "</div>" +

        '<div class="listing-body">' +

          '<span class="eyebrow">' +
            type +
          "</span>" +

          "<h3>" +
            title +
          "</h3>" +

          "<p>📍 " +
            location +
          "</p>" +

          (
            description
              ? "<p>" +
                description +
                "</p>"
              : ""
          ) +

          '<div class="listing-price">' +
            price +
          "</div>" +

          '<a class="btn btn-dark full" ' +
          'href="' +
          esc(whatsapp(room)) +
          '" ' +
          'target="_blank" ' +
          'rel="noopener noreferrer" ' +
          'style="margin-top:14px;">' +
          "Enquire on WhatsApp" +
          "</a>" +

        "</div>" +

      "</article>"
    );

  }).join("");
}


/* =========================
   LOAD SUPABASE
========================= */

function loadListings() {

  var grid = get("listingGrid");

  if (!grid) {
    console.error(
      "Sasto Room Finder: #listingGrid does not exist."
    );
    return;
  }

  showMessage("Loading properties...");

  /*
     IMPORTANT:
     We deliberately do NOT put
     status / approval_status / created_at
     into the REST URL.
  */

  var url =
    SUPABASE_URL +
    "/rest/v1/room?select=*";

  fetch(url, {

    method: "GET",

    headers: {
      "apikey": SUPABASE_KEY,
      "Accept": "application/json"
    },

    cache: "no-store"

  })

  .then(function (response) {

    return response.text()
      .then(function (body) {

        if (!response.ok) {

          throw new Error(
            "Supabase HTTP " +
            response.status +
            ": " +
            body
          );
        }

        return body;
      });

  })

  .then(function (body) {

    console.log(
      "Supabase raw response:",
      body
    );

    var data;

    try {
      data = JSON.parse(body);
    } catch (e) {
      throw new Error(
        "Supabase did not return JSON."
      );
    }

    if (!Array.isArray(data)) {

      throw new Error(
        "Unexpected Supabase response."
      );
    }

    /*
       Filter AFTER receiving the data.
    */

    listings = data.filter(function (room) {

      return (
        String(room.status || "")
          .toLowerCase() === "available" &&

        String(room.approval_status || "")
          .toLowerCase() === "approved"
      );

    });

    console.log(
      "Total rows received:",
      data.length
    );

    console.log(
      "Public properties:",
      listings.length
    );

    renderListings(listings);

  })

  .catch(function (error) {

    console.error(
      "Sasto Room Finder ERROR:",
      error
    );

    showMessage(
      "Property loading error: " +
      error.message
    );

  });
}


/* =========================
   SEARCH
========================= */

function filterProperties() {

  var search =
    get("filterSearch");

  var type =
    get("filterType");

  var q =
    search
      ? String(search.value)
          .toLowerCase()
          .trim()
      : "";

  var t =
    type
      ? String(type.value)
          .toLowerCase()
          .trim()
      : "";

  var results =
    listings.filter(function (room) {

      var text = [

        propertyTitle(room),
        propertyLocation(room),
        propertyType(room),
        propertyDescription(room),
        propertyPrice(room)

      ].join(" ").toLowerCase();

      return (
        (!q || text.indexOf(q) !== -1) &&
        (
          !t ||
          propertyType(room)
            .toLowerCase()
            .indexOf(t) !== -1
        )
      );

    });

  renderListings(results);
}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.loadListings =
  loadListings;

window.filterProperties =
  filterProperties;


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "Sasto Room Finder script loaded."
    );

    var search =
      get("filterSearch");

    var type =
      get("filterType");

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

    loadListings();

  }
);
