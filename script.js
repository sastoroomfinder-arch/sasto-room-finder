
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
    
