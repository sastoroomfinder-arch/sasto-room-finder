// SastoRoomFinder public script.js
// Property listings + popup/gallery + watermark + WhatsApp + Maps + Share
// Sponsors/Ads + Inquiry form
// IMPORTANT: fetches ALL room rows first, then filters locally.

const SUPABASE_URL = "https://amhrnahjshsgelacqzyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj";
const ADMIN_WHATSAPP = "9779818067008";

let listings = [];
let selectedProperty = null;
let galleryIndex = 0;

const esc = v =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function photosOf(v) {
  if (!v) return [];

  if (Array.isArray(v)) {
    return v.filter(Boolean);
  }

  if (typeof v === "string") {
    try {
      const x = JSON.parse(v);
      if (Array.isArray(x)) return x.filter(Boolean);
    } catch (e) {}

    return v
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
  }

  return [];
}

function photosFor(r) {
  let a = [];

  for (const v of [
    r?.photos,
    r?.images,
    r?.image_urls,
    r?.photo_urls,
    r?.image
  ]) {
    if (!v) continue;

    if (Array.isArray(v)) {
      a.push(...v);
      continue;
    }

    if (typeof v === "string") {
      try {
        const x = JSON.parse(v);

        if (Array.isArray(x)) {
          a.push(...x);
          continue;
        }
      } catch (e) {}

      a.push(
        ...v
          .split(",")
          .map(x => x.trim())
          .filter(Boolean)
      );
    }
  }

  return [...new Set(a.filter(Boolean))];
}

function titleOf(r) {
  return (
    r?.title ||
    r?.property_title ||
    r?.name ||
    r?.property_name ||
    "Property"
  );
}

function locationOf(r) {
  return (
    r?.location ||
    r?.address ||
    r?.area ||
    r?.city ||
    r?.district ||
    "Nepal"
  );
}

function priceOf(r) {
  const p =
    r?.price ??
    r?.rent ??
    r?.monthly_rent ??
    r?.amount ??
    "";

  if (!p) return "Price on request";

  return "Rs. " + Number(p).toLocaleString("en-NP") + "/month";
}

function typeOf(r) {
  return (
    r?.property_type ||
    r?.type ||
    r?.category ||
    "Property"
  );
}

function descriptionOf(r) {
  return (
    r?.description ||
    r?.details ||
    r?.about ||
    "No description available."
  );
}

function phoneOf(r) {
  let p =
    r?.owner_phone ||
    r?.phone ||
    r?.contact_phone ||
    r?.whatsapp ||
    ADMIN_WHATSAPP;

  p = String(p).replace(/\D/g, "");

  if (!p) p = ADMIN_WHATSAPP;

  if (p.startsWith("0")) {
    p = "977" + p.substring(1);
  }

  if (!p.startsWith("977") && p.length === 10) {
    p = "977" + p;
  }

  return p;
}

function ownerOf(r) {
  return (
    r?.owner_name ||
    r?.owner ||
    r?.full_name ||
    "Property Owner"
  );
}

function whatsapp(r) {
  const message =
    `Hello, I am interested in this property:\n\n` +
    `Property: ${titleOf(r)}\n` +
    `Location: ${locationOf(r)}\n` +
    `Price: ${priceOf(r)}\n\n` +
    `I found it on Sasto Room Finder.`;

  return (
    "https://wa.me/" +
    phoneOf(r) +
    "?text=" +
    encodeURIComponent(message)
  );
}

function mapsUrl(r) {
  const q =
    r?.address ||
    r?.location ||
    r?.area ||
    titleOf(r);

  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(q)
  );
}

function propertyApproved(r) {
  return (
    String(r?.status || "")
      .trim()
      .toLowerCase() === "available" &&
    String(r?.approval_status || "")
      .trim()
      .toLowerCase() === "approved"
  );
}

/* =========================================================
   CSS
========================================================= */

function addStyles() {
  if (document.getElementById("srf-final-public-css")) return;

  const style = document.createElement("style");
  style.id = "srf-final-public-css";

  style.textContent = `

  .srf-watermark{
    position:absolute;
    left:10px;
    bottom:10px;
    z-index:5;
    padding:5px 9px;
    border-radius:6px;
    background:rgba(0,0,0,.62);
    color:#fff;
    font-size:10px;
    font-weight:800;
    letter-spacing:.4px;
    pointer-events:none;
  }

  .srf-card-photo{
    position:relative;
  }

  .srf-view-btn{
    cursor:pointer;
  }

  .srf-property-modal{
    position:fixed;
    inset:0;
    z-index:99999;
    display:none;
    align-items:center;
    justify-content:center;
    background:rgba(0,0,0,.78);
    padding:14px;
  }

  .srf-property-modal.open{
    display:flex;
  }

  .srf-property-box{
    width:min(900px,100%);
    max-height:94vh;
    overflow:auto;
    background:#fff;
    border-radius:18px;
    position:relative;
  }

  .srf-property-close{
    position:absolute;
    right:12px;
    top:12px;
    z-index:30;
    width:42px;
    height:42px;
    border:0;
    border-radius:50%;
    background:#fff;
    box-shadow:0 4px 15px rgba(0,0,0,.25);
    font-size:25px;
    cursor:pointer;
  }

  .srf-gallery{
    background:#111827;
    padding:12px;
  }

  .srf-main-photo{
    position:relative;
    background:#000;
    border-radius:12px;
    overflow:hidden;
  }

  .srf-main-photo img{
    display:block;
    width:100%;
    height:min(55vh,520px);
    object-fit:contain;
    background:#000;
  }

  .srf-photo-controls{
    position:absolute;
    left:10px;
    right:10px;
    top:50%;
    display:flex;
    justify-content:space-between;
    transform:translateY(-50%);
  }

  .srf-photo-controls button{
    width:42px;
    height:42px;
    border:0;
    border-radius:50%;
    background:rgba(255,255,255,.9);
    cursor:pointer;
    font-size:20px;
  }

  .srf-photo-counter{
    position:absolute;
    right:10px;
    bottom:10px;
    background:rgba(0,0,0,.65);
    color:#fff;
    padding:5px 9px;
    border-radius:8px;
    font-size:12px;
  }

  .srf-thumbnails{
    display:flex;
    gap:7px;
    overflow-x:auto;
    padding-top:10px;
  }

  .srf-thumb{
    flex:0 0 70px;
    height:55px;
    border:2px solid transparent;
    border-radius:7px;
    overflow:hidden;
    cursor:pointer;
    background:#222;
  }

  .srf-thumb.active{
    border-color:#16a34a;
  }

  .srf-thumb img{
    width:100%;
    height:100%;
    object-fit:cover;
  }

  .srf-property-content{
    padding:20px;
  }

  .srf-property-type{
    display:inline-block;
    padding:5px 9px;
    border-radius:999px;
    background:#e8f5ee;
    color:#16834f;
    font-size:11px;
    font-weight:800;
    text-transform:uppercase;
  }

  .srf-property-content h2{
    margin:9px 0 5px;
    color:#111827;
  }

  .srf-property-location{
    color:#64748b;
    margin-bottom:7px;
  }

  .srf-property-price{
    color:#16834f;
    font-size:20px;
    font-weight:900;
    margin-bottom:16px;
  }

  .srf-details-grid{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:9px;
    margin:15px 0;
  }

  .srf-detail{
    padding:11px;
    border:1px solid #e2e8f0;
    border-radius:10px;
    background:#f8fafc;
  }

  .srf-detail small{
    display:block;
    color:#64748b;
    font-size:10px;
  }

  .srf-detail strong{
    display:block;
    margin-top:3px;
    color:#111827;
    font-size:13px;
  }

  .srf-description{
    line-height:1.65;
    color:#475569;
    white-space:pre-wrap;
  }

  .srf-action-row{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:9px;
    margin-top:18px;
  }

  .srf-action-row a,
  .srf-action-row button{
    min-height:45px;
    border:0;
    border-radius:10px;
    display:flex;
    align-items:center;
    justify-content:center;
    text-decoration:none;
    cursor:pointer;
    font-weight:800;
  }

  .srf-wa{
    background:#16a34a;
    color:#fff;
  }

  .srf-map{
    background:#111827;
    color:#fff;
  }

  .srf-share{
    background:#e2e8f0;
    color:#111827;
  }

  /* Sponsors */

  .srf-sponsors{
    width:min(1180px,calc(100% - 28px));
    margin:22px auto;
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:16px;
  }

  .srf-sponsor{
    background:#fff;
    border:1px solid #e2e8f0;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 8px 25px rgba(15,23,42,.07);
  }

  .srf-sponsor img{
    width:100%;
    height:150px;
    object-fit:cover;
    display:block;
  }

  .srf-sponsor-body{
    padding:14px;
  }

  .srf-sponsor-badge{
    display:inline-block;
    font-size:10px;
    font-weight:800;
    text-transform:uppercase;
    background:#e6fffb;
    color:#0f766e;
    padding:5px 8px;
    border-radius:999px;
  }

  .srf-sponsor h3{
    margin:8px 0 5px;
    font-size:17px;
    color:#111827;
  }

  .srf-sponsor p{
    margin:0 0 10px;
    color:#64748b;
    font-size:13px;
    line-height:1.5;
  }

  .srf-sponsor-link{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    min-height:40px;
    padding:0 14px;
    border-radius:10px;
    background:#111827;
    color:#fff;
    text-decoration:none;
    font-weight:800;
    font-size:13px;
  }

  /* Inquiry */

  .srf-inquiry-btn{
    margin-top:10px;
    width:100%;
    min-height:44px;
    border:0;
    border-radius:11px;
    background:#0f766e;
    color:#fff;
    font-weight:800;
    cursor:pointer;
  }

  .srf-inquiry-modal{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.72);
    z-index:100000;
    display:none;
    align-items:center;
    justify-content:center;
    padding:14px;
  }

  .srf-inquiry-modal.open{
    display:flex;
  }

  .srf-inquiry-box{
    width:min(520px,100%);
    background:#fff;
    border-radius:18px;
    padding:20px;
    position:relative;
  }

  .srf-inquiry-box h3{
    margin:0 36px 5px 0;
    color:#111827;
  }

  .srf-inquiry-box p{
    margin:0 0 15px;
    color:#64748b;
    font-size:13px;
  }

  .srf-inquiry-close{
    position:absolute;
    right:12px;
    top:12px;
    width:38px;
    height:38px;
    border:0;
    border-radius:50%;
    background:#e2e8f0;
    font-size:24px;
    cursor:pointer;
  }

  .srf-inquiry-box input,
  .srf-inquiry-box textarea{
    width:100%;
    box-sizing:border-box;
    border:1px solid #cbd5e1;
    border-radius:10px;
    padding:11px;
    margin:6px 0;
    font:inherit;
  }

  .srf-inquiry-box textarea{
    min-height:105px;
    resize:vertical;
  }

  .srf-inquiry-submit{
    width:100%;
    min-height:46px;
    border:0;
    border-radius:11px;
    background:#16a34a;
    color:#fff;
    font-weight:800;
    cursor:pointer;
    margin-top:8px;
  }

  .srf-inquiry-status{
    font-size:12px;
    margin-top:8px;
    min-height:18px;
  }

  @media(max-width:800px){
    .srf-sponsors{
      grid-template-columns:1fr 1fr;
    }

    .srf-details-grid{
      grid-template-columns:repeat(2,1fr);
    }
  }

  @media(max-width:600px){
    .srf-sponsors{
      grid-template-columns:1fr;
      width:calc(100% - 20px);
      margin:16px auto;
    }

    .srf-sponsor img{
      height:170px;
    }

    .srf-action-row{
      grid-template-columns:1fr;
    }

    .srf-inquiry-modal{
      align-items:flex-end;
      padding:0;
    }

    .srf-inquiry-box{
      border-radius:18px 18px 0 0;
    }
  }

  `;

  document.head.appendChild(style);
}

/* =========================================================
   PROPERTY POPUP
========================================================= */

function ensurePropertyModal(){
  if(document.getElementById("srf-property-modal")) return;

  const m=document.createElement("div");

  m.id="srf-property-modal";
  m.className="srf-property-modal";

  m.innerHTML=`
    <div class="srf-property-box">

      <button
        type="button"
        class="srf-property-close"
        onclick="closePropertyDetails()"
      >
        ×
      </button>

      <div id="srf-property-body"></div>

    </div>
  `;

  document.body.appendChild(m);

  m.addEventListener("click",e=>{
    if(e.target===m) closePropertyDetails();
  });
}

function openPropertyDetails(index){

  const r=listings[index];

  if(!r) return;

  selectedProperty=r;
  galleryIndex=0;

  ensurePropertyModal();

  renderPropertyDetails();

  document
    .getElementById("srf-property-modal")
    .classList.add("open");

  document.body.style.overflow="hidden";
}

function closePropertyDetails(){

  const m=document.getElementById("srf-property-modal");

  if(m){
    m.classList.remove("open");
  }

  if(
    !document
      .getElementById("srf-inquiry-modal")
      ?.classList.contains("open")
  ){
    document.body.style.overflow="";
  }
}

function renderPropertyDetails(){

  if(!selectedProperty) return;

  const r=selectedProperty;

  const imgs=photosFor(r);

  const main=imgs[galleryIndex] || "";

  const bedrooms=
    r?.bedrooms ??
    r?.bedroom ??
    r?.rooms ??
    "-";

  const bathrooms=
    r?.bathrooms ??
    r?.bathroom ??
    "-";

  const furnished=
    r?.furnished ??
    r?.furnishing ??
    "-";

  const area=
    r?.area ??
    r?.size ??
    r?.square_feet ??
    "-";

  const propertyId=
    r?.id ??
    "-";

  const posted=
    r?.created_at
      ? new Date(r.created_at).toLocaleDateString("en-NP")
      : "-";

  const html=`

    <div class="srf-gallery">

      <div class="srf-main-photo">

        ${
          main
            ? `
              <img
                src="${esc(main)}"
                alt="${esc(titleOf(r))}"
              >
            `
            : `
              <div style="
                height:320px;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#fff;
              ">
                No Photo
              </div>
            `
        }

        <div class="srf-watermark">
          sastoroomfinder pvt. ltd.
        </div>

        ${
          imgs.length>1
            ? `
              <div class="srf-photo-controls">

                <button
                  type="button"
                  onclick="changePhoto(-1)"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onclick="changePhoto(1)"
                >
                  ›
                </button>

              </div>
            `
            : ""
        }

        ${
          imgs.length
            ? `
              <div class="srf-photo-counter">
                ${galleryIndex+1}/${imgs.length}
              </div>
            `
            : ""
        }

      </div>

      ${
        imgs.length>1
          ? `
            <div class="srf-thumbnails">

              ${imgs.map((x,i)=>`

                <button
                  type="button"
                  class="srf-thumb ${
                    i===galleryIndex ? "active" : ""
                  }"
                  onclick="setPhoto(${i})"
                >

                  <img
                    src="${esc(x)}"
                    alt=""
                  >

                </button>

              `).join("")}

            </div>
          `
          : ""
      }

    </div>

    <div class="srf-property-content">

      <span class="srf-property-type">
        ${esc(typeOf(r))}
      </span>

      <h2>
        ${esc(titleOf(r))}
      </h2>

      <div class="srf-property-location">
        📍 ${esc(locationOf(r))}
      </div>

      <div class="srf-property-price">
        ${esc(priceOf(r))}
      </div>

      <div class="srf-details-grid">

        <div class="srf-detail">
          <small>Bedrooms</small>
          <strong>${esc(bedrooms)}</strong>
        </div>

        <div class="srf-detail">
          <small>Bathrooms</small>
          <strong>${esc(bathrooms)}</strong>
        </div>

        <div class="srf-detail">
          <small>Furnished</small>
          <strong>${esc(furnished)}</strong>
        </div>

        <div class="srf-detail">
          <small>Area</small>
          <strong>${esc(area)}</strong>
        </div>

        <div class="srf-detail">
          <small>Property ID</small>
          <strong>${esc(propertyId)}</strong>
        </div>

        <div class="srf-detail">
          <small>Owner</small>
          <strong>${esc(ownerOf(r))}</strong>
        </div>

        <div class="srf-detail">
          <small>Posted</small>
          <strong>${esc(posted)}</strong>
        </div>

        <div class="srf-detail">
          <small>Status</small>
          <strong>Available</strong>
        </div>

      </div>

      ${
        r?.address
          ? `
            <p>
              <strong>Address:</strong>
              ${esc(r.address)}
            </p>
          `
          : ""
      }

      <h3>Property Description</h3>

      <div class="srf-description">
        ${esc(descriptionOf(r))}
      </div>

      <div class="srf-action-row">

        <a
          class="srf-wa"
          href="${whatsapp(r)}"
          target="_blank"
          rel="noopener"
        >
          WhatsApp Owner
        </a>

        <a
          class="srf-map"
          href="${mapsUrl(r)}"
          target="_blank"
          rel="noopener"
        >
          📍 Google Maps
        </a>

        <button
          type="button"
          class="srf-share"
          onclick="shareCurrentProperty()"
        >
          Share Property
        </button>

      </div>

      <button
        type="button"
        class="srf-inquiry-btn"
        onclick="openInquiry('${esc(r.id)}')"
      >
        ✉️ Send Inquiry
      </button>

    </div>
  `;

  document.getElementById("srf-property-body").innerHTML=html;
}

function setPhoto(i){

  const imgs=photosFor(selectedProperty);

  if(!imgs.length) return;

  galleryIndex=
    Math.max(
      0,
      Math.min(i,imgs.length-1)
    );

  renderPropertyDetails();
}

function changePhoto(direction){

  const imgs=photosFor(selectedProperty);

  if(!imgs.length) return;

  galleryIndex=
    (galleryIndex+direction+imgs.length)
    %imgs.length;

  renderPropertyDetails();
}

async function shareCurrentProperty(){

  if(!selectedProperty) return;

  const url=window.location.href;

  const text=
    `${titleOf(selectedProperty)} - `+
    `${locationOf(selectedProperty)} - `+
    `${priceOf(selectedProperty)}`;

  if(navigator.share){

    try{

      await navigator.share({
        title:titleOf(selectedProperty),
        text,
        url
      });

    }catch(e){}

  }else{

    try{

      await navigator.clipboard.writeText(
        url
      );

      alert("Property link copied.");

    }catch(e){

      alert(url);

    }

  }
}

/* =========================================================
   SPONSORS
========================================================= */

function sponsorIsActive(s){

  const status=
    String(s.status||"")
      .trim()
      .toLowerCase();

  if(status && status!=="active"){
    return false;
  }

  const today=new Date();

  today.setHours(0,0,0,0);

  if(s.start_date){

    const d=new Date(s.start_date);

    d.setHours(0,0,0,0);

    if(today<d) return false;

  }

  if(s.end_date){

    const d=new Date(s.end_date);

    d.setHours(0,0,0,0);

    if(today>d) return false;

  }

  return true;
}

async function loadSponsors(){

  const old=
    document.getElementById(
      "srf-public-sponsors"
    );

  if(old) old.remove();

  try{

    const res=await fetch(
      `${SUPABASE_URL}/rest/v1/sponsors?select=*&order=created_at.desc`,
      {
        headers:{
          apikey:SUPABASE_KEY,
          Accept:"application/json"
        },
        cache:"no-store"
      }
    );

    if(!res.ok){
      throw new Error(
        "Sponsors HTTP "+res.status
      );
    }

    const data=await res.json();

    const sponsors=
      (Array.isArray(data)?data:[])
      .filter(sponsorIsActive);

    if(!sponsors.length) return;

    const grid=
      document.getElementById(
        "listingGrid"
      );

    if(!grid || !grid.parentNode) return;

    const wrap=
      document.createElement("section");

    wrap.id="srf-public-sponsors";

    wrap.className="srf-sponsors";

    wrap.innerHTML=
      sponsors.map(s
