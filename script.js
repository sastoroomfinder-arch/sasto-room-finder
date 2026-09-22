/* Sasto Room Finder - responsive property cards + mobile popup + watermark */
(()=>{"use strict";
const U="https://amhrnahjshsgelacqzyl.supabase.co",K="sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj",ADMIN="9779818067008",WM="sastoroomfinder pvt. ltd.";
let rows=[],shown=[],active=null,pi=0,$=id=>document.getElementById(id);
const V=(...a)=>{for(const x of a)if(x!=null&&String(x).trim())return x;return""};
const E=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
const J=x=>{try{return typeof x=="object"?x:JSON.parse(x)}catch{return null}};

function photos(r){
 let p=V(r.photos,r.images,r.photo_urls,r.image_urls);
 if(typeof p=="string"){
   let j=J(p);
   p=Array.isArray(j)?j:p.includes(",")?p.split(","):[p]
 }
 if(!Array.isArray(p))p=[];
 p=p.map(x=>typeof x=="string"?x.trim():V(x?.url,x?.src,x?.path)).filter(Boolean);
 let q=V(r.image_url,r.image,r.photo_url,r.thumbnail);
 if(!p.length&&q)p=[q];
 return[...new Set(p)]
}

const type=r=>String(V(r.room_type,r.property_type,r.type,r.category,"Property"));
const title=r=>String(V(r.title,r.property_title,r.name,`${type(r)} for Rent`));
const loc=r=>String(V(r.location,r.address,r.area,r.city,"Kathmandu Valley"));

function price(r){
 let p=V(r.price,r.rent,r.monthly_rent,r.amount);
 if(!p)return"Price on request";
 let n=String(p).replace(/,/g,"").replace(/[^\d.]/g,"");
 return n?`Rs. ${Number(n).toLocaleString("en-IN")} / month`:String(p)
}

const desc=r=>String(V(
 r.description,r.details,r.about,r.content,
 "Contact the owner for more information and viewing details."
));

const phone=r=>String(V(
 r.phone,r.owner_phone,r.contact,r.whatsapp,ADMIN
));

const owner=r=>String(V(
 r.owner_name,r.owner,r.full_name,"Property Owner"
));

function wa(r){
 let p=String(phone(r)).replace(/\D/g,"");
 if(p.startsWith("0"))p="977"+p.slice(1);
 if(!p.startsWith("977")&&p.length==10)p="977"+p;

 return`https://wa.me/${p}?text=${encodeURIComponent(
 `Hello Sasto Room Finder, I am interested in:\n\n${title(r)}\nLocation: ${loc(r)}\nPrice: ${price(r)}`
 )}`
}

const map=r=>V(
 r.google_maps_url,
 r.maps_url,
 r.map_url,
 `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc(r))}`
);

function ok(r){
 let s=String(r.status??"").trim().toLowerCase(),
     a=String(r.approval_status??"").trim().toLowerCase();

 return s==="available"&&a==="approved"
}

function css(){
 if($("srfcss"))return;

 let s=document.createElement("style");
 s.id="srfcss";

 s.textContent=`

.srf-menu-open{display:flex!important;flex-direction:column!important;position:absolute!important;top:100%!important;right:4%!important;background:#fff!important;padding:18px!important;border:1px solid #dfe4df!important;border-radius:12px!important;z-index:99999!important;box-shadow:0 10px 30px rgba(15,23,42,.12)!important}
.srfwm{
 position:absolute;
 z-index:5;
 left:50%;
 top:50%;
 transform:translate(-50%,-50%) rotate(-18deg);
 white-space:nowrap;
 color:#fff;
 font-weight:900;
 font-size:clamp(13px,2.3vw,24px);
 text-shadow:0 2px 8px #000;
 opacity:.8;
 pointer-events:none
}

.srfphoto{
 position:relative;
 overflow:hidden;
 background:#edf2f7
}

.srfphoto img{
 width:100%;
 height:100%;
 object-fit:cover;
 display:block
}

.srfcard{
 background:#fff;
 border:1px solid #e1e8f0;
 border-radius:18px;
 overflow:hidden;
 box-shadow:0 8px 28px #0b274013
}

.srfcard .srfimg{
 height:240px
}

.srfbody{
 padding:16px
}

.srfbody h3{
 margin:0 0 6px;
 color:#071a33;
 font-size:19px
}

.srfloc{
 color:#637187;
 font-size:13px
}

.srfprice{
 color:#008d59;
 font-weight:900;
 font-size:18px;
 margin:10px 0
}

.srffacts{
 display:grid;
 grid-template-columns:repeat(4,1fr);
 gap:6px;
 margin:12px 0
}

.srffact{
 background:#f7f9fc;
 border:1px solid #e4eaf1;
 border-radius:9px;
 padding:7px 4px;
 text-align:center;
 font-size:11px;
 color:#647287
}

.srffact b{
 display:block;
 color:#17263c
}

.srfactions{
 display:grid;
 gap:8px
}

.srfbtn{
 min-height:45px;
 border-radius:10px;
 border:1px solid #071a33;
 font:inherit;
 font-weight:800;
 cursor:pointer;
 padding:9px 12px
}

.srfdark{
 background:#071a33;
 color:#fff
}

.srfwa{
 background:#fff;
 color:#087d4d;
 border-color:#087d4d
}


.srf-public-sponsors{width:min(1180px,calc(100% - 28px));margin:22px auto 28px;padding:18px;background:linear-gradient(135deg,#eef7ff,#f7fbff);border:1px solid #cbdced;border-radius:20px;position:relative}
.srf-public-sponsors:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:#0879e8;border-radius:20px 0 0 20px}
.srf-sponsor-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 13px;padding-left:6px}
.srf-sponsor-heading span{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#0879e8;background:#fff;border:1px solid #cfe0f3;border-radius:999px;padding:6px 9px}
.srf-sponsor-heading h2{margin:0;color:#071a33;font-size:19px}
.srf-sponsor-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.srf-sponsor-card{display:grid;grid-template-columns:105px minmax(0,1fr);background:#fff;border:1px solid #dbe6f2;border-radius:14px;overflow:hidden;box-shadow:0 5px 16px rgba(11,39,64,.06)}
.srf-sponsor-card img{width:105px;height:100%;min-height:125px;object-fit:cover;display:block;background:#edf2f7}
.srf-sponsor-body{padding:12px 13px}
.srf-sponsor-badge{display:inline-block;padding:4px 7px;border-radius:5px;background:#071a33;color:#fff;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
.srf-sponsor-body h3{margin:7px 0 3px;color:#071a33;font-size:15px;line-height:1.25}
.srf-sponsor-body p{margin:0 0 7px;color:#637187;font-size:12px;line-height:1.4}
.srf-sponsor-name{font-weight:800;color:#33445c!important}
.srf-sponsor-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.srf-sponsor-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 10px;border-radius:8px;background:#0879e8;color:#fff;text-decoration:none;font-size:11px;font-weight:800}
.srf-sponsor-actions a.wa{background:#0b8f5a}
@media(max-width:900px){.srf-sponsor-grid{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.srf-public-sponsors{width:calc(100% - 20px);margin:14px auto 20px;padding:14px}.srf-sponsor-grid{grid-template-columns:1fr}.srf-sponsor-card{grid-template-columns:92px minmax(0,1fr)}.srf-sponsor-card img{width:92px;min-height:115px}}

.srf-empty{
 grid-column:1/-1;
 text-align:center;
 padding:45px 20px;
 color:#647287;
 background:#fff;
 border:1px dashed #ccd7e4;
 border-radius:16px
}


/* PROPERTY POPUP */

.srfov{
 position:fixed;
 inset:0;
 z-index:999999;
 background:#031022b8;
 backdrop-filter:blur(5px);
 display:none;
 align-items:center;
 justify-content:center;
 padding:16px;
 overflow:auto
}

.srfov.open{
 display:flex
}

.srfmodal{
 width:min(1050px,100%);
 max-height:95vh;
 overflow:auto;
 background:#fff;
 border-radius:22px;
 box-shadow:0 30px 90px #0005
}

.srfhead{
 padding:20px 24px 14px;
 border-bottom:1px solid #edf1f5;
 position:sticky;
 top:0;
 background:#fff;
 z-index:20
}

.srfclose{
 position:absolute;
 right:16px;
 top:14px;
 width:42px;
 height:42px;
 border:0;
 border-radius:50%;
 background:#071a33;
 color:#fff;
 font-size:22px;
 cursor:pointer
}

.srfhead small{
 display:inline-block;
 background:#eaf2ff;
 color:#0b4ea2;
 padding:6px 10px;
 border-radius:99px;
 font-weight:900
}

.srfhead h2{
 margin:8px 50px 5px 0;
 color:#071a33;
 font-size:clamp(22px,4vw,31px)
}

.srfsub{
 display:flex;
 flex-wrap:wrap;
 gap:12px;
 color:#637187;
 font-size:14px
}

.srfmprice{
 color:#008d59;
 font-weight:900;
 margin-left:auto
}


/* GALLERY */

.srfgallery{
 padding:18px 24px 0
}

.srfmain{
 height:min(52vh,510px);
 min-height:270px;
 border-radius:16px
}

.srfarr{
 position:absolute;
 top:50%;
 transform:translateY(-50%);
 z-index:8;
 width:46px;
 height:46px;
 border:0;
 border-radius:50%;
 background:#071a33d9;
 color:#fff;
 font-size:28px;
 cursor:pointer
}

.srfprev{
 left:14px
}

.srfnext{
 right:14px
}

.srfcount{
 position:absolute;
 right:14px;
 bottom:14px;
 background:#071a33df;
 color:#fff;
 padding:6px 10px;
 border-radius:99px;
 font-size:12px
}

.srfthumbs{
 display:flex;
 gap:8px;
 overflow:auto;
 padding:10px 0
}

.srfthumb{
 flex:0 0 82px;
 width:82px;
 height:62px;
 border:2px solid transparent;
 border-radius:9px;
 padding:0;
 overflow:hidden;
 background:#edf2f7;
 cursor:pointer
}

.srfthumb.on{
 border-color:#0b66d6
}

.srfthumb img{
 width:100%;
 height:100%;
 object-fit:cover
}


/* PROPERTY INFORMATION */

.srfdetails{
 padding:20px 24px
}

.srfspecs{
 display:grid;
 grid-template-columns:repeat(3,1fr);
 border:1px solid #e0e8f1;
 border-radius:14px;
 overflow:hidden;
 background:#f7faff
}

.srfspec{
 padding:13px;
 border-right:1px solid #e0e8f1;
 border-bottom:1px solid #e0e8f1
}

.srfspec:nth-child(3n){
 border-right:0
}

.srfspec span{
 display:block;
 color:#738096;
 font-size:12px
}

.srfspec b{
 display:block;
 color:#12243d;
 margin-top:3px;
 overflow-wrap:anywhere
}

.srfdesc p{
 color:#526176;
 line-height:1.7;
 white-space:pre-line
}


/* POPUP BUTTONS */

.srfmacts{
 display:grid;
 grid-template-columns:repeat(3,1fr);
 gap:10px;
 padding:0 24px 24px
}

.srfmacts .srfbtn{
 min-height:50px
}


/* MOBILE */

@media(max-width:700px){

 .srfov{
  padding:0;
  align-items:flex-end
 }

 .srfmodal{
  width:100%;
  max-height:96vh;
  border-radius:22px 22px 0 0
 }

 .srfhead{
  padding:16px
 }

 .srfgallery{
  padding:12px
 }

 .srfmain{
  height:54vw;
  min-height:230px;
  max-height:390px
 }

 .srfdetails{
  padding:15px 12px
 }

 .srfspecs{
  grid-template-columns:repeat(2,1fr)
 }

 .srfspec:nth-child(3n){
  border-right:1px solid #e0e8f1
 }

 .srfspec:nth-child(2n){
  border-right:0
 }

 .srfmacts{
  grid-template-columns:1fr;
  padding:0 12px 14px;
  position:sticky;
  bottom:0;
  background:#fff;
  z-index:30;
  border-top:1px solid #e7edf4
 }

 .srfcard .srfimg{
  height:210px
 }

 .srffacts{
  grid-template-columns:repeat(2,1fr)
 }
}
`;

 document.head.appendChild(s)
}


/* CREATE POPUP */

function modal(){

 if($("srfov"))return;

 let o=document.createElement("div");

 o.id="srfov";
 o.className="srfov";

 o.innerHTML=
 '<div class="srfmodal"><div id="srfm"></div></div>';

 o.onclick=e=>{
  if(e.target===o)closePropertyDetails()
 };

 document.body.appendChild(o);

 document.addEventListener("keydown",e=>{
  if(e.key=="Escape")closePropertyDetails();

  if(active&&e.key=="ArrowLeft")
   changePhoto(-1);

  if(active&&e.key=="ArrowRight")
   changePhoto(1)
 })
}


/* PROPERTY CARD */

function card(r,i){

 let p=photos(r)[0],
 b=V(r.bedrooms,r.bedroom,"—"),
 ba=V(r.bathrooms,r.bathroom,"—"),
 f=V(r.furnished,r.furnishing,"—"),
 a=V(r.area,r.area_sqft,r.size,"—");

 return`
 <article class="srfcard">

  <div class="srfphoto srfimg">

   ${
    p
    ?
    `<img src="${E(p)}"
          alt="${E(title(r))}"
          loading="lazy">

     <span class="srfwm">
      ${WM}
     </span>`
    :""
   }

  </div>

  <div class="srfbody">

   <h3>${E(title(r))}</h3>

   <div class="srfloc">
    📍 ${E(loc(r))}
   </div>

   <div class="srfprice">
    ${E(price(r))}
   </div>

   <div class="srffacts">

    <div class="srffact">
     <b>${E(b)}</b>
     Bed
    </div>

    <div class="srffact">
     <b>${E(ba)}</b>
     Bath
    </div>

    <div class="srffact">
     <b>${E(f)}</b>
     Furnished
    </div>

    <div class="srffact">
     <b>${E(a)}</b>
     Area
    </div>

   </div>

   <div class="srfactions">

    <button
      class="srfbtn srfdark"
      data-v="${i}">
      View Full Details
    </button>

    <button
      class="srfbtn srfwa"
      data-w="${i}">
      🟢 Enquire on WhatsApp
    </button>

    <button
      class="srfbtn"
      data-iq="${i}">
      ✉️ Send Inquiry
    </button>

   </div>

  </div>

 </article>
 `
}


/* RENDER LISTINGS */

function render(a){

 let g=$("listingGrid");

 if(!g)return;

 shown=a;

 if(!a.length){

  g.innerHTML=
  '<div class="srf-empty"><b>No matching properties found.</b><br>Try another location or property type.</div>';

  return
 }

 g.innerHTML=a.map(card).join("");

 g.querySelectorAll("[data-v]").forEach(b=>{
  b.onclick=()=>{
   openPropertyDetails(shown[+b.dataset.v])
  }
 });

 g.querySelectorAll("[data-w]").forEach(b=>{
  b.onclick=()=>{
   window.open(
    wa(shown[+b.dataset.w]),
    "_blank",
    "noopener"
   )
  }
 })

 g.querySelectorAll("[data-iq]").forEach(b=>{
  b.onclick=()=>openInquiryModal(shown[+b.dataset.iq])
 })
}


/* REFRESH POPUP */

function refresh(){

 if(!active)return;

 let ps=photos(active),
 p=ps[pi]||"";

 let f=[

  ["Bedrooms",V(active.bedrooms,active.bedroom,"—")],

  ["Bathrooms",V(active.bathrooms,active.bathroom,"—")],

  ["Furnished",V(active.furnished,active.furnishing,"—")],

  ["Area",V(active.area,active.area_sqft,active.size,"—")],

  ["Property ID",V(active.property_id,active.id,active.slug,"—")],

  ["Owner",owner(active)],

  ["Posted",V(
   active.posted_date,
   active.created_at,
   "Recently posted"
  )]

 ];

 $("srfm").innerHTML=`

 <div class="srfhead">

  <button
   class="srfclose"
   onclick="closePropertyDetails()">
   ×
  </button>

  <small>
   ${E(type(active))}
  </small>

  <h2>
   ${E(title(active))}
  </h2>

  <div class="srfsub">

   <span>
    📍 ${E(loc(active))}
   </span>

   <span class="srfmprice">
    ${E(price(active))}
   </span>

  </div>

 </div>


 <div class="srfgallery">

  <div class="srfphoto srfmain">

   ${
    p
    ?
    `<img
      src="${E(p)}"
      alt="${E(title(active))}">

     <span class="srfwm">
      ${WM}
     </span>`
    :
    "<div style='height:100%;display:grid;place-items:center'>No photo</div>"
   }


   ${
    ps.length>1
    ?
    `
     <button
      class="srfarr srfprev"
      onclick="changePhoto(-1)">
      ‹
     </button>

     <button
      class="srfarr srfnext"
      onclick="changePhoto(1)">
      ›
     </button>

     <span class="srfcount">
      ${pi+1} / ${ps.length}
     </span>
    `
    :
    ""
   }

  </div>


  ${
   ps.length>1
   ?
   `
   <div class="srfthumbs">

    ${ps.map((x,i)=>`

     <button
      class="srfthumb ${i==pi?"on":""}"
      onclick="setPhoto(${i})">

      <img
       src="${E(x)}"
       alt="Property photo">

     </button>

    `).join("")}

   </div>
   `
   :
   ""
  }

 </div>


 <div class="srfdetails">

  <div class="srfspecs">

   ${f.map(x=>`

    <div class="srfspec">

     <span>
      ${E(x[0])}
     </span>

     <b>
      ${E(x[1])}
     </b>

    </div>

   `).join("")}

  </div>


  <div class="srfdesc">

   <h3>
    Description
   </h3>

   <p>
    ${E(dE(active))}
   </p>

  </div>

 </div>


 <div class="srfmacts">

  <button
   class="srfbtn srfwa"
   onclick="sendPropertyWhatsApp()">

   🟢 WhatsApp Owner

  </button>

  <button
   class="srfbtn"
   onclick="openInquiryModal(active)">

   ✉️ Send Inquiry

  </button>


  <button
   class="srfbtn srfdark"
   onclick="viewPropertyLocation()">

   📍 View Location

  </button>


  <button
   class="srfbtn"
   onclick="shareCurrentProperty()">

   ↗ Share Property

  </button>

 </div>
 `
}


/* GLOBAL FUNCTIONS */

window.openPropertyDetails=r=>{
 active=r;
 pi=0;
 modal();
 refresh();

 $("srfov").classList.add("open");

 document.body.style.overflow="hidden"
};

window.closePropertyDetails=()=>{
 $("srfov")?.classList.remove("open");
 document.body.style.overflow="";
 active=null
};

window.setPhoto=i=>{
 pi=i;
 refresh()
};

window.changePhoto=d=>{
 let p=photos(active);

 if(p.length>1){
  pi=(pi+d+p.length)%p.length;
  refresh()
 }
};

window.sendPropertyWhatsApp=()=>{
 if(active)
  window.open(
   wa(active),
   "_blank",
   "noopener"
  )
};

window.viewPropertyLocation=()=>{
 if(active)
  window.open(
   map(active),
   "_blank",
   "noopener"
  )
};

window.shareCurrentProperty=async()=>{

 if(!active)return;

 try{

  if(navigator.share){

   await navigator.share({

    title:title(active),

    text:
     `${title(active)} - ${loc(active)} - ${price(active)}`,

    url:location.href

   });

  }else{

   await navigator.clipboard.writeText(
    location.href
   );

   alert("Property link copied.")

  }

 }catch{}

};


/* SEARCH */

window.filterProperties=()=>{

 let q=String(
  $("filterSearch")?.value||""
 ).toLowerCase().trim();

 let t=String(
  $("filterType")?.value||""
 ).toLowerCase().trim();

 render(

  rows.filter(r=>
   (!q||
    `${title(r)} ${type(r)} ${loc(r)} ${dE(r)}`
    .toLowerCase()
    .includes(q)
   )
   &&
   (!t||
    type(r).toLowerCase()==t
   )
  )

 )
};



/* PROPERTY INQUIRY */
function inquiryCss(){
 if($("srfInquiryStyle"))return;
 const st=document.createElement("style");st.id="srfInquiryStyle";
 st.textContent=`.srf-inq-overlay{position:fixed;inset:0;background:rgba(2,20,45,.58);z-index:100000;display:none;align-items:center;justify-content:center;padding:16px}.srf-inq-overlay.open{display:flex}.srf-inq-box{width:min(520px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:20px;box-shadow:0 18px 60px rgba(0,0,0,.22)}.srf-inq-box h2{margin:0 0 5px;color:#071a33}.srf-inq-box p{color:#637187;font-size:13px}.srf-inq-form{display:grid;gap:11px}.srf-inq-form label{display:grid;gap:5px;color:#243750;font-size:12px;font-weight:800}.srf-inq-form input,.srf-inq-form textarea{width:100%;box-sizing:border-box;border:1px solid #ccd8e6;border-radius:10px;padding:11px;font:inherit}.srf-inq-actions{display:flex;gap:8px;justify-content:flex-end}.srf-inq-actions button{border:0;border-radius:9px;padding:11px 14px;font-weight:800;cursor:pointer}.srf-inq-cancel{background:#edf2f7;color:#243750}.srf-inq-send{background:#0879e8;color:#fff}.srf-inq-msg{min-height:18px;font-size:12px;font-weight:800}@media(max-width:600px){.srf-inq-box{padding:16px;border-radius:16px}}`;
 document.head.appendChild(st);
}
function inquiryModal(){
 inquiryCss();
 if($("srfInquiryOverlay"))return;
 const d=document.createElement("div");d.id="srfInquiryOverlay";d.className="srf-inq-overlay";
 d.innerHTML=`<div class="srf-inq-box"><h2>Send Property Inquiry</h2><p id="srfInquiryProperty"></p><form id="srfInquiryForm" class="srf-inq-form"><label>Your Name<input id="inqName" required placeholder="Your name"></label><label>Phone / WhatsApp<input id="inqPhone" required inputmode="tel" placeholder="98XXXXXXXX"></label><label>Message<textarea id="inqMessage" rows="4" placeholder="I am interested in this property. Please contact me."></textarea></label><div id="inqMsg" class="srf-inq-msg"></div><div class="srf-inq-actions"><button type="button" class="srf-inq-cancel" id="inqCancel">Cancel</button><button class="srf-inq-send" type="submit">Send Inquiry</button></div></form></div>`;
 document.body.appendChild(d);
 $("inqCancel").onclick=()=>{d.classList.remove("open");document.body.style.overflow=""};
 $("srfInquiryForm").onsubmit=sendInquiry;
}
function openInquiryModal(r){
 active=r;
 inquiryModal();
 $("srfInquiryProperty").textContent=title(r)+" • "+loc(r);
 $("inqMsg").textContent="";$("inqName").value="";$("inqPhone").value="";$("inqMessage").value="I am interested in this property. Please contact me.";
 $("srfInquiryOverlay").classList.add("open");document.body.style.overflow="hidden";
}
async function sendInquiry(e){
 e.preventDefault();if(!active)return;
 const msg=$("inqMsg");msg.style.color="#52708f";msg.textContent="Sending...";
 const payload={owner_id:active.owner_id||null,property_title:title(active),name:$("inqName").value.trim(),phone:$("inqPhone").value.trim(),message:$("inqMessage").value.trim(),status:"new"};
 if(!payload.name||!payload.phone){msg.style.color="#b42318";msg.textContent="Please enter your name and phone.";return}
 try{
  const res=await fetch(`${U}/rest/v1/inquiries`,{method:"POST",headers:{apikey:K,Authorization:`Bearer ${K}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(payload)});
  if(!res.ok){const t=await res.text();throw new Error(t||"Inquiry could not be sent.")}
  msg.style.color="#16834f";msg.textContent="Inquiry sent successfully.";
  setTimeout(()=>{$("srfInquiryOverlay")?.classList.remove("open");document.body.style.overflow=""},900);
 }catch(err){msg.style.color="#b42318";msg.textContent="Inquiry could not be sent. Please try WhatsApp."}
}
\n/* PUBLIC SPONSORS / ADVERTISEMENTS */
function sponsorIsActive(s){
  const status=String(s.status||"").trim().toLowerCase();
  if(status!=="active")return false;
  const today=new Date(); today.setHours(0,0,0,0);
  if(s.start_date){const d=new Date(s.start_date+"T00:00:00"); if(today<d)return false;}
  if(s.end_date){const d=new Date(s.end_date+"T00:00:00"); if(today>d)return false;}
  return true;
}
async function loadSponsors(){
  const old=document.getElementById("srf-public-sponsors");
  if(old)old.remove();
  try{
    const res=await fetch(`${U}/rest/v1/sponsors?select=id,sponsor_name,title,description,image_url,link_url,phone,position,status,start_date,end_date&status=eq.active&order=created_at.desc`,{
      headers:{apikey:K,Accept:"application/json"},cache:"no-store"
    });
    if(!res.ok)throw new Error("Sponsors "+res.status);
    const data=await res.json();
    const sponsors=(Array.isArray(data)?data:[]).filter(sponsorIsActive);
    if(!sponsors.length)return;
    const grid=$( "listingGrid" );
    const hero=document.querySelector(".hero");
    const main=document.querySelector("main");
    const target=grid?.parentNode||hero||main;
    if(!target)return;
    const wrap=document.createElement("section");
    wrap.id="srf-public-sponsors";
    wrap.className="srf-public-sponsors";
    wrap.innerHTML='<div class="srf-sponsor-heading"><span>Sponsored</span><h2>Featured</h2></div>'+
      '<div class="srf-sponsor-grid">'+sponsors.map(s=>{
        const title=E(s.title||s.sponsor_name||"Sponsored");
        const image=s.image_url||"";
        const link=s.link_url||"";
        const phone=String(s.phone||"").replace(/\D/g,"");
        return `<article class="srf-sponsor-card">
          ${image?`<img src="${E(image)}" alt="${title}" loading="lazy">`:""}
          <div class="srf-sponsor-body">
            <span class="srf-sponsor-badge">Sponsored</span>
            <h3>${title}</h3>
            ${s.sponsor_name?`<p class="srf-sponsor-name">${E(s.sponsor_name)}</p>`:""}
            ${s.description?`<p>${E(s.description)}</p>`:""}
            <div class="srf-sponsor-actions">
              ${link?`<a href="${E(link)}" target="_blank" rel="noopener noreferrer">View Ad</a>`:""}
              ${phone?`<a class="wa" href="https://wa.me/${phone}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`:""}
            </div>
          </div>
        </article>`;
      }).join("")+'</div>';
    if(grid&&grid.parentNode) grid.parentNode.insertBefore(wrap,grid);
    else if(hero&&hero.parentNode) hero.parentNode.insertBefore(wrap,hero.nextSibling);
    else if(main) main.insertBefore(wrap,main.firstChild);
  }catch(e){
    console.warn("Sponsors unavailable:",e);
  }
}


/* LOAD FROM SUPABASE */

async function load(){

 let g=$("listingGrid");

 if(!g)return;

 g.innerHTML=
 '<div class="srf-empty">Loading properties...</div>';

 try{

  let res=await fetch(

   `${U}/rest/v1/room?select=*&order=created_at.desc`,

   {
    headers:{
     apikey:K,
     Accept:"application/json"
    },
    cache:"no-store"
   }

  );

  if(!res.ok)
   throw Error("Supabase "+res.status);

  let d=await res.json();

  rows=
   Array.isArray(d)
   ?
   d.filter(ok)
   :
   [];

  window.SastoRoomFinderListings=rows;

  filterProperties()

 }catch(e){

  console.error(e);

  g.innerHTML=
   '<div class="srf-empty"><b>Properties could not be loaded.</b><br>Please refresh the page.</div>'

 }
}


/* INITIALIZE */

function init(){

 css();
 inquiryModal();
 modal();

 $("filterSearch")
  ?.addEventListener(
   "input",
   filterProperties
  );

 $("filterType")
  ?.addEventListener(
   "change",
   filterProperties
  );

 const menuButton=document.querySelector(".menu");
 const nav=document.querySelector("nav");

 if(menuButton&&nav){
  menuButton.addEventListener("click",()=>{
   const open=!nav.classList.contains("srf-menu-open");
   nav.classList.toggle("srf-menu-open",open);
   menuButton.setAttribute("aria-expanded",String(open));
  });
 }

 load().then(loadSponsors);
}

document.readyState=="loading"
?
document.addEventListener(
 "DOMContentLoaded",
 init,
 {once:true}
)
:
init();

})();
