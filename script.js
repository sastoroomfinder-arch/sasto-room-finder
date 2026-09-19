"use strict";

/* =========================================
   SASTO ROOM FINDER
   PUBLIC PROPERTIES LOADER
   ========================================= */

const SUPABASE_URL =
  "https://amhrnahjshsgelacqzyl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

const ADMIN_WHATSAPP = "9779818067008";

let allProperties = [];


/* =========================================
   BASIC HELPERS
   ========================================= */

function el(id) {
  return document.getElementById(id);
}

function safe(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function value(room, names, fallback = "") {

  for (const name of names) {

    if (
      room &&
      room[name] !== null &&
      room[name] !== undefined &&
      String(room[name]).trim() !== ""
    ) {
      return room[name];
    }

  }

  return fallback;
}


function title(room) {
  return value(
    room,
    ["title", "name", "property_name"],
    "Room / Property"
  );
}


function location(room) {
  return value(
    room,
    [
      "location",
      "address",
      "area",
      "city",
      "district",
      "municipality"
    ],
    "Kathmandu Valley"
  );
}


function propertyType(room) {
  return value(
    room,
    [
      "room_type",
      "property_type",
      "type",
      "category"
    ],
    "Property"
  );
}


function description(room) {
  return value(
    room,
    [
      "description",
      "details",
      "about"
    ],
    ""
  );
}


function price(room) {

  const p = value(
    room,
    [
      "price",
      "rent",
      "monthly_rent",
      "amount"
    ],
    ""
  );

  if (p === "") {
    return "Contact for price";
  }

  const number =
    Number(
      String(p)
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "")
    );

  if (Number.isFinite(number)) {

    return (
      "Rs. " +
      number.toLocaleString("en-IN") +
      " / month"
    );

  }

  return String(p);
}


/* =========================================
   PHOTOS
   ========================================= */

function photos(room) {

  let p = value(
    room,
    [
      "photos",
      "images",
      "image_urls",
      "photo_urls",
      "image"
    ],
    []
  );


  if (Array.isArray(p)) {

    return p
      .map(x => {

        if (typeof x === "string") {
          return x;
        }

        if (x && typeof x === "object") {
          return (
            x.url ||
            x.publicUrl ||
            x.public_url ||
            ""
          );
        }

        return "";

      })
      .filter(Boolean);

  }


  if (typeof p === "string") {

    p = p.trim();

    if (!p) {
      return [];
    }


    try {

      const parsed = JSON.parse(p);

      if (Array.isArray(parsed)) {

        return parsed
          .map(x =>
            typeof x === "string"
              ? x
              : (
                  x?.url ||
                  x?.publicUrl ||
                  x?.public_url ||
                  ""
                )
          )
          .filter(Boolean);

      }

    } catch (_) {}


    return p
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

  }


  return [];
}


/* =========================================
   PHONE / WHATSAPP
   ========================================= */

function phone(room) {

  let p = value(
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

  p = String(p).replace(/\D/g, "");

  if (p.startsWith("00")) {
    p = p.substring(2);
  }

  if (p.startsWith("0")) {
    p = "977" + p.substring(1);
  }

  if (p.length === 10 && p.startsWith("9")) {
    p = "977" + p;
  }

  return p || ADMIN_WHATSAPP;
}


function whatsapp(room) {

  const message =
    "Hello Sasto Room Finder, I am interested in " +
    title(room) +
    " at " +
    location(room) +
    ". Please send me the current details.";

  return (
    "https://wa.me/" +
    phone(room) +
    "?text=" +
    encodeURIComponent(message)
  );
}


/* =========================================
   SHOW MESSAGE
   ========================================= */

function message(text, error = false) {

  const grid = el("listingGrid");

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
    "color:" +
    (error ? "#b00020" : "#555") +
    ';">' +
    safe(text) +
    "</div>";
}


/* =========================================
   RENDER PROPERTIES
   ========================================= */

function renderProperties(properties) {

  const grid = el("listingGrid");

  if (!grid) {

    console.error(
      "ERROR: #listingGrid was not found."
    );

    return;
  }


  if (!properties.length) {

    message(
      "No approved and available properties found."
    );

    return;
  }


  grid.innerHTML =
    properties
      .map(room => {

        const pics = photos(room);

        let image = "";

        if (pics.length) {

          image =
            '<img src="' +
            safe(pics[0]) +
            '" ' +
            'alt="' +
            safe(title(room)) +
            '" ' +
            'loading="lazy" ' +
            'style="width:100%;height:220px;object-fit:cover;">';

        } else {

          image =
            '<div style="' +
            "height:220px;" +
            "display:flex;" +
            "align-items:center;" +
            "justify-content:center;" +
            "background:#eef2f0;" +
            "font-size:55px;" +
            '">🏠</div>';

        }


        return (

          '<article class="listing" ' +
          'style="' +
          "overflow:hidden;" +
          "background:white;" +
          "border-radius:16px;" +
          "border:1px solid #e5e5e5;" +
          'box-shadow:0 4px 15px rgba(0,0,0,.08);">' +

            '<div class="listing-photo">' +
              image +
            "</div>" +

            '<div class="listing-body" ' +
            'style="padding:18px;">' +

              '<span class="eyebrow">' +
                safe(propertyType(room)) +
              "</span>" +

              "<h3>" +
                safe(title(room)) +
              "</h3>" +

              "<p>📍 " +
                safe(location(room)) +
              "</p>" +

              (
                description(room)
                  ? "<p>" +
                    safe(description(room)) +
                    "</p>"
                  : ""
              ) +

              '<div class="listing-price">' +
                safe(price(room)) +
              "</div>" +

              '<a href="' +
                safe(whatsapp(room)) +
                '" ' +
                'target="_blank" ' +
                'rel="noopener noreferrer" ' +
                'class="btn btn-dark full" ' +
                'style="display:block;text-align:center;margin-top:15px;">' +
                "Enquire on WhatsApp" +
              "</a>" +

            "</div>" +

          "</article>"

        );

      })
      .join("");
}


/* =========================================
   LOAD FROM SUPABASE
   ========================================= */

async function loadListings() {

  console.log(
    "Sasto Room Finder: starting property load..."
  );


  const grid = el("listingGrid");

  if (!grid) {

    console.error(
      "Sasto Room Finder ERROR: listingGrid does not exist."
    );

    return;
  }


  message("Loading properties...");


  const endpoint =
    SUPABASE_URL +
    "/rest/v1/room" +
    "?select=*" +
    "&status=eq.available" +
    "&approval_status=eq.approved" +
    "&order=created_at.desc";


  console.log(
    "Supabase endpoint:",
    endpoint
  );


  try {

    const response =
      await fetch(
        endpoint,
        {
          method: "GET",

          headers: {
            "apikey": SUPABASE_KEY,
            "Accept": "application/json"
          },

          cache: "no-store"
        }
      );


    const body =
      await response.text();


    console.log(
      "Supabase HTTP status:",
      response.status
    );


    console.log(
      "Supabase response:",
      body
    );


    if (!response.ok) {

      throw new Error(
        "Supabase HTTP " +
        response.status +
        ": " +
        body
      );

    }


    let data;

    try {

      data = JSON.parse(body);

    } catch (_) {

      throw new Error(
        "Supabase did not return JSON."
      );

    }


    if (!Array.isArray(data)) {

      throw new Error(
        "Supabase returned unexpected data."
      );

    }


    allProperties = data;


    console.log(
      "PROPERTIES LOADED:",
      allProperties.length
    );


    renderProperties(
      allProperties
    );


  } catch (error) {

    console.error(
      "SASTO ROOM FINDER ERROR:",
      error
    );


    message(
      "Property loading failed: " +
      error.message,
      true
    );

  }

}


/* =========================================
   SEARCH / FILTER
   ========================================= */

function filterProperties() {

  const search =
    String(
      el("filterSearch")?.value || ""
    )
      .toLowerCase()
      .trim();


  const type =
    String(
      el("filterType")?.value || ""
    )
      .toLowerCase()
      .trim();


  const results =
    allProperties.filter(room => {

      const text = [

        title(room),
        location(room),
        propertyType(room),
        description(room),
        price(room)

      ]
        .join(" ")
        .toLowerCase();


      const searchOK =
        !search ||
        text.includes(search);


      const typeOK =
        !type ||
        propertyType(room)
          .toLowerCase()
          .includes(type);


      return searchOK && typeOK;

    });


  renderProperties(results);

}


/* =========================================
   PUBLIC FUNCTIONS
   ========================================= */

window.loadListings =
  loadListings;

window.filterProperties =
  filterProperties;


window.sendInquiry =
  function(room) {

    if (!room) {

      alert(
        "Please select a property first."
      );

      return;
    }

    window.open(
      whatsapp(room),
      "_blank"
    );

  };


/* =========================================
   START
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "Sasto Room Finder script started."
    );


    const search =
      el("filterSearch");


    const type =
      el("filterType");


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
