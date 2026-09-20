/* =========================================================
   SASTO ROOM FINDER - PUBLIC PROPERTIES SCRIPT
   Matches properties.html
   ========================================================= */

(function () {
  "use strict";

  /* =========================
     SUPABASE CONFIG
     ========================= */

  const SUPABASE_URL =
    "https://amhrnahjshsgelacqzyl.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";

  const ROOM_API =
    SUPABASE_URL +
    "/rest/v1/room?select=*&status=eq.available&approval_status=eq.approved&order=created_at.desc";

  /* =========================
     GLOBAL DATA
     ========================= */

  let allProperties = [];
  let filteredProperties = [];
  let currentProperty = null;
  let currentPhotoIndex = 0;

  /* =========================
     HELPERS
     ========================= */

  function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function firstValue(obj, keys, fallback = "") {
    for (const key of keys) {
      if (
        obj &&
        obj[key] !== undefined &&
        obj[key] !== null &&
        String(obj[key]).trim() !== ""
      ) {
        return obj[key];
      }
    }

    return fallback;
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
      return "Price on request";
    }

    const text = String(value).trim();

    if (!text) return "Price on request";

    if (/rs\.?|npr|रु/i.test(text)) {
      return text;
    }

    const number = Number(text.replace(/,/g, ""));

    if (!Number.isNaN(number)) {
      return "Rs. " + number.toLocaleString("en-IN");
    }

    return text;
  }

  function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function getPhotos(property) {
    let photos =
      property.photos ||
      property.images ||
      property.image_urls ||
      property.image ||
      [];

    if (!photos) return [];

    if (Array.isArray(photos)) {
      return photos
        .map((p) => {
          if (typeof p === "string") return p;

          if (p && typeof p === "object") {
            return (
              p.url ||
              p.publicUrl ||
              p.public_url ||
              p.src ||
              p.path ||
              ""
            );
          }

          return "";
        })
        .filter(Boolean);
    }

    if (typeof photos === "string") {
      let text = photos.trim();

      if (!text) return [];

      /* JSON array */
      try {
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          return parsed
            .map((p) =>
              typeof p === "string"
                ? p
                : p?.url ||
                  p?.publicUrl ||
                  p?.public_url ||
                  p?.src ||
                  p?.path ||
                  ""
            )
            .filter(Boolean);
        }
      } catch (e) {}

      /* comma separated */
      if (text.includes(",")) {
        return text
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }

      return [text];
    }

    return [];
  }

  function getTitle(property) {
    return firstValue(
      property,
      [
        "title",
        "property_title",
        "property_name",
        "name",
        "room_title",
        "listing_title"
      ],
      "Property Listing"
    );
  }

  function getType(property) {
    return firstValue(
      property,
      [
        "property_type",
        "type",
        "room_type",
        "category"
      ],
      "Property"
    );
  }

  function getLocation(property) {
    return firstValue(
      property,
      [
        "location",
        "address",
        "area",
        "city",
        "property_location"
      ],
      "Location not available"
    );
  }

  function getDescription(property) {
    return firstValue(
      property,
      [
        "description",
        "details",
        "about",
        "property_description"
      ],
      "No description available."
    );
  }

  function getPhone(property) {
    return firstValue(
      property,
      [
        "phone",
        "owner_phone",
        "contact",
        "contact_number",
        "mobile",
        "whatsapp"
      ],
      "9779818067008"
    );
  }

  function cleanPhone(phone) {
    return String(phone || "")
      .replace(/[^\d+]/g, "")
      .replace(/^\+/, "");
  }

  function getOwner(property) {
    return firstValue(
      property,
      [
        "owner_name",
        "owner",
        "name_of_owner",
        "posted_by"
      ],
      "Property Owner"
    );
  }

  function getGoogleMapsURL(property) {
    const mapValue = firstValue(
      property,
      [
        "google_maps",
        "maps_url",
        "map_url",
        "location_url",
        "google_map"
      ],
      ""
    );

    if (mapValue) {
      return String(mapValue);
    }

    const location = getLocation(property);

    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(location)
    );
  }

  /* =========================
     LOAD PROPERTIES
     ========================= */

  async function loadProperties() {
    const grid = document.getElementById("listingGrid");

    if (!grid) {
      console.error(
        "Sasto Room Finder: #listingGrid was not found."
      );
      return;
    }

    grid.innerHTML = `
      <div class="srf-loading">
        <div class="srf-spinner"></div>
        <p>Loading properties...</p>
      </div>
    `;

    try {
      const response = await fetch(ROOM_API, {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Accept: "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          "Supabase returned " +
            response.status +
            ": " +
            errorText
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Supabase returned an unexpected response.");
      }

      allProperties = data;

      filteredProperties = [...allProperties];

      console.log(
        "Sasto Room Finder: properties loaded:",
        allProperties.length
      );

      renderProperties(filteredProperties);
    } catch (error) {
      console.error(
        "Sasto Room Finder property loading error:",
        error
      );

      grid.innerHTML = `
        <div class="srf-error">
          <h3>Unable to load properties</h3>
          <p>Please refresh the page and try again.</p>
          <button
            type="button"
            class="btn btn-dark"
            onclick="loadProperties()"
          >
            Try Again
          </button>
        </div>
      `;
    }
  }

  /* =========================
     RENDER PROPERTY CARDS
     ========================= */

  function renderProperties(properties) {
    const grid = document.getElementById("listingGrid");

    if (!grid) return;

    if (!properties.length) {
      grid.innerHTML = `
        <div class="srf-empty">
          <h3>No properties found</h3>
          <p>Try another location or property type.</p>
        </div>
      `;

      return;
    }

    grid.innerHTML = properties
      .map((property, index) => {
        const photos = getPhotos(property);

        const image =
          photos[0] ||
          "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80";

        const title = getTitle(property);
        const type = getType(property);
        const location = getLocation(property);
        const price = formatPrice(
          firstValue(property, [
            "price",
            "rent",
            "monthly_rent",
            "amount"
          ])
        );

        const description = getDescription(property);

        return `
          <article class="srf-property-card">

            <div class="srf-card-image-wrap">

              <img
                class="srf-card-image"
                src="${escapeHTML(image)}"
                alt="${escapeHTML(title)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80';"
              >

              <span class="srf-type-badge">
                ${escapeHTML(type)}
              </span>

              ${
                photos.length > 1
                  ? `<span class="srf-photo-count">📷 ${photos.length}</span>`
                  : ""
              }

            </div>

            <div class="srf-card-body">

              <h3>
                ${escapeHTML(title)}
              </h3>

              <div class="srf-location">
                📍 ${escapeHTML(location)}
              </div>

              <div class="srf-price">
                ${escapeHTML(price)}
              </div>

              <p class="srf-description">
                ${escapeHTML(
                  description.length > 130
                    ? description.substring(0, 130) + "..."
                    : description
                )}
              </p>

              <button
                type="button"
                class="btn btn-dark srf-details-button"
                onclick="openPropertyDetails(${index})"
              >
                View Full Details
              </button>

            </div>

          </article>
        `;
      })
      .join("");

    /*
      Because filtering can change the array, keep the exact
      rendered array available for the details buttons.
    */
    window.__SRF_RENDERED_PROPERTIES__ = properties;
  }

  /* =========================
     FILTER
     ========================= */

  window.filterProperties = function () {
    const searchInput =
      document.getElementById("filterSearch");

    const typeSelect =
      document.getElementById("filterType");

    const search = normalize(
      searchInput ? searchInput.value : ""
    );

    const type = normalize(
      typeSelect ? typeSelect.value : ""
    );

    filteredProperties = allProperties.filter(
      (property) => {
        const title = normalize(getTitle(property));
        const location = normalize(getLocation(property));
        const propertyType = normalize(getType(property));
        const description = normalize(
          getDescription(property)
        );

        const matchesSearch =
          !search ||
          title.includes(search) ||
          location.includes(search) ||
          description.includes(search);

        const matchesType =
          !type ||
          propertyType === type ||
          propertyType.includes(type);

        return matchesSearch && matchesType;
      }
    );

    renderProperties(filteredProperties);
  };

  /* =========================
     SEARCH FROM HOME PAGE
     ========================= */

  window.searchFromHome = function (value) {
    const input =
      document.getElementById("filterSearch");

    if (input) {
      input.value = value || "";
    }

    window.filterProperties();
  };

  /* =========================
     PROPERTY DETAILS MODAL
     ========================= */

  function createModal() {
    let modal =
      document.getElementById("srfPropertyModal");

    if (modal) return modal;

    modal = document.createElement("div");

    modal.id = "srfPropertyModal";

    modal.innerHTML = `
      <div
        class="srf-modal-backdrop"
        onclick="closePropertyDetails()"
      ></div>

      <div
        class="srf-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Property details"
      >

        <button
          type="button"
          class="srf-modal-close"
          onclick="closePropertyDetails()"
          aria-label="Close"
        >
          ×
        </button>

        <div id="srfModalContent"></div>

      </div>
    `;

    document.body.appendChild(modal);

    return modal;
  }

  window.openPropertyDetails = function (index) {
    const properties =
      window.__SRF_RENDERED_PROPERTIES__ ||
      filteredProperties;

    const property = properties[index];

    if (!property) {
      console.error(
        "Sasto Room Finder: property not found for index",
        index
      );

      return;
    }

    currentProperty = property;

    currentPhotoIndex = 0;

    const modal = createModal();

    const content =
      document.getElementById("srfModalContent");

    if (!content) return;

    renderPropertyDetails(content);

    modal.classList.add("srf-modal-open");

    document.body.classList.add(
      "srf-modal-body-lock"
    );
  };

  function renderPropertyDetails(content) {
    const property = currentProperty;

    if (!property) return;

    const photos = getPhotos(property);

    const title = getTitle(property);
    const type = getType(property);
    const location = getLocation(property);
    const price = formatPrice(
      firstValue(property, [
        "price",
        "rent",
        "monthly_rent",
        "amount"
      ])
    );

    const description = getDescription(property);

    const owner = getOwner(property);

    const phone = getPhone(property);

    const mapURL = getGoogleMapsURL(property);

    const bedrooms = firstValue(
      property,
      ["bedrooms", "bedroom", "rooms", "no_of_bedrooms"],
      "—"
    );

    const bathrooms = firstValue(
      property,
      ["bathrooms", "bathroom", "no_of_bathrooms"],
      "—"
    );

    const furnished = firstValue(
      property,
      ["furnished", "furnishing"],
      "—"
    );

    const area = firstValue(
      property,
      ["area", "property_area", "square_feet", "sqft"],
      "—"
    );

    const propertyId = firstValue(
      property,
      ["id", "property_id", "room_id"],
      "—"
    );

    const createdAt = firstValue(
      property,
      ["created_at", "posted_at", "date"],
      ""
    );

    const mainImage =
      photos[currentPhotoIndex] ||
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=85";

    const galleryHTML =
      photos.length > 0
        ? `
          <div class="srf-gallery">

            <div class="srf-main-photo-wrap">

              <button
                type="button"
                class="srf-gallery-arrow srf-gallery-prev"
                onclick="srfPreviousPhoto()"
                ${
                  photos.length <= 1
                    ? "disabled"
                    : ""
                }
              >
                ‹
              </button>

              <img
                id="srfMainPropertyPhoto"
                class="srf-main-photo"
                src="${escapeHTML(mainImage)}"
                alt="${escapeHTML(title)}"
                onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=85';"
              >

              <div class="srf-photo-watermark">
                sastoroomfinder.pvt.ltd.
              </div>

              <button
                type="button"
                class="srf-gallery-arrow srf-gallery-next"
                onclick="srfNextPhoto()"
                ${
                  photos.length <= 1
                    ? "disabled"
                    : ""
                }
              >
                ›
              </button>

              ${
                photos.length > 1
                  ? `
                    <div class="srf-gallery-counter">
                      ${currentPhotoIndex + 1} / ${photos.length}
                    </div>
                  `
                  : ""
              }

            </div>

            ${
              photos.length > 1
                ? `
                  <div class="srf-thumbnails">
                    ${photos
                      .map(
                        (photo, i) => `
                          <button
                            type="button"
                            class="srf-thumb ${
                              i === currentPhotoIndex
                                ? "active"
                                : ""
                            }"
                            onclick="srfSelectPhoto(${i})"
                          >
                            <img
                              src="${escapeHTML(photo)}"
                              alt="Property photo ${
                                i + 1
                              }"
                              onerror="this.style.display='none';"
                            >
                          </button>
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
          <div class="srf-gallery">

            <div class="srf-main-photo-wrap">

              <img
                class="srf-main-photo"
                src="https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=85"
                alt="${escapeHTML(title)}"
              >

              <div class="srf-photo-watermark">
                sastoroomfinder.pvt.ltd.
              </div>

            </div>

          </div>
        `;

    content.innerHTML = `

      <div class="srf-property-details">

        <div class="srf-details-header">

          <div>

            <span class="srf-details-type">
              ${escapeHTML(type)}
            </span>

            <h2>
              ${escapeHTML(title)}
            </h2>

            <div class="srf-details-location">
              📍 ${escapeHTML(location)}
            </div>

          </div>

          <div class="srf-details-price">
            ${escapeHTML(price)}
          </div>

        </div>

        ${galleryHTML}

        <div class="srf-facts">

          <div class="srf-fact">
            <span>Bedrooms</span>
            <strong>${escapeHTML(bedrooms)}</strong>
          </div>

          <div class="srf-fact">
            <span>Bathrooms</span>
            <strong>${escapeHTML(bathrooms)}</strong>
          </div>

          <div class="srf-fact">
            <span>Furnished</span>
            <strong>${escapeHTML(furnished)}</strong>
          </div>

          <div class="srf-fact">
            <span>Area</span>
            <strong>${escapeHTML(area)}</strong>
          </div>

          <div class="srf-fact">
            <span>Property ID</span>
            <strong>${escapeHTML(propertyId)}</strong>
          </div>

          <div class="srf-fact">
            <span>Posted</span>
            <strong>${escapeHTML(
              formatDate(createdAt)
            )}</strong>
          </div>

        </div>

        <section class="srf-description-section">

          <h3>Description</h3>

          <p>
            ${escapeHTML(description)}
          </p>

        </section>

        <section class="srf-owner-section">

          <h3>Property Owner</h3>

          <p>
            <strong>${escapeHTML(owner)}</strong>
          </p>

        </section>

        <div class="srf-action-buttons">

          <a
            class="srf-action whatsapp"
            href="https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(
              "Hello, I am interested in your p
