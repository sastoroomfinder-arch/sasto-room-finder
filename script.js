/* Sasto Room Finder - responsive property cards + mobile popup + watermark
   + Sponsors / Ads + Public Inquiries
*/
(()=>{"use strict";

const U="https://amhrnahjshsgelacqzyl.supabase.co",
K="sb_publishable_f2morNcNVHaA4MhsellIRA_Mbgv0yFj",
ADMIN="9779818067008",
WM="sastoroomfinder pvt. ltd.";

let rows=[],shown=[],active=null,pi=0,inquiryRoom=null;
const $=id=>document.getElementById(id);

const V=(...a)=>{
  for(const x of a)
    if(x!=null&&String(x).trim())return x;
  return "";
};

const E=x=>String(x??"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

const J=x=>{
  try{return typeof x=="object"?x:JSON.parse(x)}
  catch{return null}
};

function photos(r){
  let p=V(r.photos,r.images,r.photo_urls,r.image_urls);

  if(typeof p=="string"){
    let j=J(p);
    p=Array.isArray(j)?j:p.includes(",")?p.split(","):[p];
  }

  if(!Array.isArray(p))p=[];

  p=p.map(x=>
    typeof x=="string"
      ?x.trim()
      :V(x?.url,x?.src,x?.path)
  ).filter(Boolean);

  let q=V(r.image_url,r.image,r.photo_url,r.thumbnail);

  if(!p.length&&q)p=[q];

  return [...new Set(p)];
}

const type=r=>String(
  V(r.property_type,r.type,r.category,"Property")
);

const title=r=>String(
  V(r.title,r.property_title,r.name,`${type(r)} for Rent`)
);

const loc=r=>String(
  V(r.location,r.address,r.area,r.city,"Kathmandu Valley")
);

function price(r){
  let p=V(r.price,r.rent,r.monthly_rent,r.amount);

  if(!p)return"Price on request";

  let n=String(p)
    .replace(/,/g,"")
    .replace(/[^\d.]/g,"");

  return n
    ?`Rs. ${Number(n).toLocaleString("en-IN")} / month`
    :String(p);
}

const desc=r=>String(
  V(
    r.description,
    r.details,
    r.about,
    r.content,
    "Contact the owner for more information and viewing details."
  )
);

const phone=r=>String(
  V(r.phone,r.owner_phone,r.contact,r.whatsapp,ADMIN)
);

const owner=r=>String(
  V(r.owner_name,r.owner,r.full_name,"Property Owner")
);

function wa(r){
  let p=String(phone(r)).replace(/\D/g,"");

  if(p.startsWith("0"))
    p="977"+p.slice(1);

  if(!p.startsWith("977")&&p.length==10)
    p="977"+p;

  return `https://wa.me/${p}?text=${encodeURIComponent(
`Hello Sasto Room Finder, I am interested in:

${title(r)}
Location: ${loc(r)}
Price: ${price(r)}`
  )}`;
}

const map=r=>V(
  r.google_maps_url,
  r.maps_url,
  r.map_url,
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc(r))}`
);

function ok(r){
  let s=String(r.status??"").trim().toLowerCase();
  let a=String(r.approval_status??"").trim().toLowerCase();

  return (!s||s=="available")&&(!a||a=="approved");
}

function css(){

  if($("srfcss"))return;

  let s=document.createElement("style");

  s.id="srfcss";

  s.textContent=`

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

/* SPONSORS */

.srf-sponsors{
display:grid;
gap:14px;
margin:0 0 18px
}

.srf-sponsor{
display:flex;
gap:14px;
align-items:center;
padding:14px;
border:1px solid #dce6f0;
border-radius:16px;
background:linear-gradient(135deg,#f8fbff,#fff);
text-decoration:none;
color:#071a33;
box-shadow:0 5px 18px #0b27400d
}

.srf-sponsor img{
width:92px;
height:72px;
object-fit:cover;
border-radius:10px;
background:#edf2f7;
flex:0 0 auto
}

.srf-sponsor-body h3{
margin:4px 0;
color:#071a33;
font-size:17px
}

.srf-sponsor-body p{
margin:0;
color:#637187;
font-size:13px;
line-height:1.45
}

.srf-sponsored-label{
font-size:10px;
text-transform:uppercase;
letter-spacing:.08em;
font-weight:900;
color:#0b66d6
}

/* INQUIRY */

.srf-inquiry-ov{
position:fixed;
inset:0;
z-index:1000000;
background:#031022b8;
backdrop-filter:blur(5px);
display:none;
align-items:center;
justify-content:center;
padding:16px
}

.srf-inquiry-ov.open{
display:flex
}

.srf-inquiry-box{
width:min(520px,100%);
background:#fff;
border-radius:20px;
padding:20px;
position:relative;
box-shadow:0 30px 90px #0005
}

.srf-inquiry-close{
position:absolute;
right:12px;
top:10px;
width:40px;
height:40px;
border:0;
border-radius:50%;
background:#071a33;
color:#fff;
font-size:22px;
cursor:pointer
}

.srf-inquiry-box h2{
margin:0 48px 5px 0;
color:#071a33
}

.srf-inquiry-box p{
color:#637187;
margin:0 0 14px
}

.srf-inquiry-box label{
display:block;
font-weight:700;
color:#17263c;
margin-top:10px
}

.srf-inquiry-box input,
.srf-inquiry-box textarea{
width:100%;
box-sizing:border-box;
padding:12px;
margin-top:5px;
border:1px solid #ccd7e3;
border-radius:10px;
font:inherit
}

.srf-inquiry-box textarea{
min-height:100px;
resize:vertical
}

.srf-inquiry-submit{
width:100%;
margin-top:14px;
min-height:48px;
border:0;
border-radius:10px;
background:#071a33;
color:#fff;
font:inherit;
font-weight:900;
cursor:pointer
}

.srf-inquiry-msg{
margin-top:10px;
font-weight:800
}

/* POPUP */

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

.srfmacts{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:10px;
padding:0 24px 24px
}

.srfmacts .srfbtn{
min-height:50px
}

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

  document.head.appendChild(s);
}

function ensureExtraPublicUI(){

  if(!$("srfSponsorWrap")){

    const g=$("listingGrid");

    if(g){

      const w=document.createElement("div");

      w.id="srfSponsorWrap";

      g.parentNode.insertBefore(w,g);
    }
  }

  if(!$("srfInquiryOv")){

    const o=document.createElement("div");

    o.id="srfInquiryOv";

    o.className="srf-inquiry-ov";

    o.innerHTML=`
<div class="srf-inquiry-box">

<button
class="srf-inquiry-close"
type="button"
aria-label="Close">×</button>

<h2>Send Property Inquiry</h2>

<p id="srfInquiryProperty"></p>

<form id="srfInquiryForm">

<label>
Name
<input id="srfInquiryName"
required
maxlength="100">
</label>

<label>
Phone
<input id="srfInquiryPhone"
required
maxlength="30"
inputmode="tel">
</label>

<label>
Message
<textarea
id="srfInquiryMessage"
required
maxlength="1000"></textarea>
</label>

<button
class="srf-inquiry-submit"
type="submit">
Send Inquiry
</button>

<div
id="srfInquiryMsg"
class="srf-inquiry-msg"
aria-live="polite"></div>

</form>

</div>`;

    document.body.appendChild(o);

    o.querySelector(".srf-inquiry-close")
      .onclick=closeInquiry;

    o.addEventListener("click",e=>{
      if(e.target===o)closeInquiry();
    });

    o.querySelector("#srfInquiryForm")
      .addEventListener("submit",submitInquiry);
  }
}

function openInquiry(r){

  ensureExtraPublicUI();

  inquiryRoom=r;

  $("srfInquiryProperty").textContent=
    `Property: ${title(r)} • ${loc(r)}`;

  $("srfInquiryMsg").textContent="";

  $("srfInquiryForm").reset();

  $("srfInquiryOv").classList.add("open");

  document.body.style.overflow="hidden";

  $("srfInquiryName").focus();
}

function closeInquiry(){

  $("srfInquiryOv")?.classList.remove("open");

  if(!$("srfov")?.classList.contains("open"))
    document.body.style.overflow="";

  inquiryRoom=null;
}

async function submitInquiry(e){

  e.preventDefault();

  if(!inquiryRoom)return;

  const msg=$("srfInquiryMsg");

  msg.style.color="#071a33";

  msg.textContent="Sending...";

  const payload={

    room_id:inquiryRoom.id||null,

    owner_id:inquiryRoom.owner_id||null,

    property_title:title(inquiryRoom),

    name:$("srfInquiryName").value.trim(),

    phone:$("srfInquiryPhone").value.trim(),

    message:$("srfInquiryMessage").value.trim(),

    status:"new"

  };

  try{

    const res=await fetch(
      `${U}/rest/v1/inquiries`,
      {
        method:"POST",
        headers:{
          apikey:K,
          Authorization:`Bearer ${K}`,
          "Content-Type":"application/json",
          "Prefer":"return=minimal"
        },
        body:JSON.stringify(payload)
      }
    );

    if(!res.ok)
      throw Error(await res.text());

    msg.style.color="#087d4d";

    msg.textContent="Inquiry sent successfully.";

    setTimeout(closeInquiry,900);

  }catch(err){

    console.error("Inquiry error:",err);

    msg.style.color="#b42318";

    msg.textContent=
      "Unable to send inquiry. Please try again.";
  }
}

async function loadSponsors(){

  ensureExtraPublicUI();

  const wrap=$("srfSponsorWrap");

  if(!wrap)return;

  try{

    const res=await fetch(
      `${U}/rest/v1/sponsors?select=*&status=eq.active&order=created_at.desc`,
      {
        headers:{
          apikey:K,
          Accept:"application/json"
        },
        cache:"no-store"
      }
    );

    if(!res.ok)
      throw Error("Sponsors "+res.status);

    const data=await res.json();

    const now=new Date();

    const active=(Array.isArray(data)?data:[])
      .filter(s=>{

        const from=s.start_date
          ?new Date(`${s.start_date}T00:00:00`)
          :null;

        const to=s.end_date
          ?new Date(`${s.end_date}T23:59:59`)
          :null;

        const pos=String(
          s.position||"homepage"
        ).toLowerCase();

        return(
          (!from||now>=from)&&
          (!to||now<=to)&&
          ["homepage","top","listing"].includes(pos)
        );
      });

    if(!active.length){

      wrap.innerHTML="";

      return;
    }

    wrap.innerHTML=`
<div class="srf-sponsors">

${active.map(s=>{

  const image=V(
    s.image_url,
    s.image,
    s.photo_url
  );

  const link=V(
    s.link_url,
    s.link
  );

  const body=`

<div class="srf-sponsor-body">

<div class="srf-sponsored-label">
Sponsored
</div>

<h3>
${E(
  V(
    s.title,
    s.sponsor_name,
    "Advertisement"
  )
)}
</h3>

${
  s.description
  ?`<p>${E(s.description)}</p>`
  :""
}

</div>`;

  return link

    ?`<a
class="srf-sponsor"
href="${E(link)}"
target="_blank"
rel="noopener">

${
  image
  ?`<img
src="${E(image)}"
alt="">`
  :""
}

${body}

</a>`

    :`<div class="srf-sponsor">

${
  image
  ?`<img
src="${E(image)}"
alt="">`
  :""
}

${body}

</div>`;

}).join("")}

</div>`;

  }catch(err){

    console.warn(
      "Sponsors unavailable:",
      err
    );

    wrap.innerHTML="";
  }
}

function modal(){

  if($("srfov"))return;

  let o=document.createElement("div");

  o.id="srfov";

  o.className="srfov";

  o.innerHTML=
    '<div class="srfmodal"><div id="srfm"></div></div>';

  o.onclick=e=>{
    if(e.target===o)
      closePropertyDetails();
  };

  document.body.appendChild(o);

  document.addEventListener("keydown",e=>{

    if(e.key=="Escape")
      closePropertyDetails();

    if(active&&e.key=="ArrowLeft")
      changePhoto(-1);

    if(active&&e.key=="ArrowRight")
      changePhoto(1);

  });
}

function card(r,i){

  let p=photos(r)[0];

  let b=V(
    r.bedrooms,
    r.bedroom,
    "—"
  );

  let ba=V(
    r.bathrooms,
    r.bathroom,
    "—"
  );

  let f=V(
    r.furnished,
    r.furnishing,
    "—"
  );

  let a=V(
    r.area,
    r.area_sqft,
    r.size,
    "—"
  );

  return`

<article class="srfcard">

<div class="srfphoto srfimg">

${
p
?`
<img
src="${E(p)}"
alt="${E(title(r))}"
loading="lazy">

<span class="srfwm">
${WM}
</span>
`
:""
}

</div>

<div class="srfbody">

<h3>
${E(title(r))}
</h3>

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
class="srfbtn"
data-q="${i}">
✉️ Send Inquiry
</button>

<button
class="srfbtn srfwa"
data-w="${i}">
🟢 Enquire on WhatsApp
</button>

</div>

</div>

</article>`;
}

function render(a){

  let g=$("listingGrid");

  if(!g)return;

  shown=a;

  if(!a.length){

    g.innerHTML=`
<div class="srf-empty">

<b>No matching properties found.</b>

<br>

Try another location or property type.

</div>`;

    return;
  }

  g.innerHTML=a.map(card).join("");

  g.querySelectorAll("[data-v]")
    .forEach(b=>
      b.onclick=()=>
        openPropertyDetails(
          shown[+b.dataset.v]
        )
    );

  g.querySelectorAll("[data-q]")
    .forEach(b=>
      b.onclick=()=>
        openInquiry(
          shown[+b.dataset.q]
        )
    );

  g.querySelectorAll("[data-w]")
    .forEach(b=>
      b.onclick=()=>
        window.open(
          wa(shown[+b.dataset.w]),
          "_blank",
          "noopener"
        )
    );
}

function refresh(){

  if(!active)return;

  let ps=photos(active);

  let p=ps[pi]||"";

  let f=[
    [
      "Bedrooms",
      V(
        active.bedrooms,
        active.bedroom,
        "—"
      )
    ],
    [
      "Bathrooms",
      V(
        active.bathrooms,
        active.bathroom,
        "—"
      )
    ],
    [
      "Furnished",
      V(
        active.furnished,
        active.furnishing,
        "—"
      )
    ],
    [
      "Area",
      V(
        active.area,
        active.area_sqft,
        active.size,
        "—"
      )
    ],
    [
      "Property ID",
      V(
        active.property_id,
        active.id,
        active.slug,
        "—"
      )
    ],
    [
      "Owner",
      owner(active)
    ],
    [
      "Posted",
      V(
        active.posted_date,
        active.created_at,
        "Recently posted"
      )
    ]
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
?`
<img
src="${E(p)}"
alt="${E(title(active))}">

<span class="srfwm">
${WM}
</span>
`
:
"<div style='height:100%;display:grid;place-items:center'>No photo</div>"
}

${
ps.length>1
?`

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
:""
}

</div>

${
ps.length>1
?`

<div class="srfthumbs">

${
ps.map((x,i)=>
`
<button
class="srfthumb ${i==pi?"on":""}"
onclick="setPhoto(${i})">

<img src="${E(x)}">

</button>
`
).join("")
}

</div>

`
:""
}

</div>

<div class="srfdetails">

<div class="srfspecs">

${
f.map(x=>
`
<div class="srfspec">

<span>
${E(x[0])}
</span>

<b>
${E(x[1])}
</b>

</div>
`
).join("")
}

</div>

<div class="srfdesc">

<h3>
Description
</h3>

<p>
${E(desc(active))}
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
`;
}

window.openPropertyDetails=r=>{
  active=r;
  pi=0;
  modal();
  refresh();
  $("srfov").classList.add("open");
  document.body.style.overflow="hidden";
};

window.closePropertyDetails=()=>{
  $("srfov")?.classList.remove("open");
  document.body.style.overflow="";
  active=null;
};

window.setPhoto=i=>{
  pi=i;
  refresh();
};

window.changePhoto=d=>{

  let p=photos(active);

  if(p.length>1){

    pi=(pi+d+p.length)%p.length;

    refresh();
  }
};

window.sendPropertyWhatsApp=()=>{
  active&&window.open(
    wa(active),
    "_blank",
    "noopener"
  );
};

window.viewPropertyLocation=()=>{
  active&&window.open(
    map(active),
    "_blank",
    "noopener"
  );
};

window.shareCurrentProperty=async()=>{

  if(!active)return;

  try{

    if(navigator.share)

      await navigator.share({
        title:title(active),
        text:`${title(active)} - ${loc(active)} - ${price(active)}`,
        url:location.href
      });

    else{

      await navigator.clipboard.writeText(
        location.href
      );

      alert("Pr
