const roles=[
 {name:"Dev",price:250000,icon:"code-2"},
 {name:"Own",price:80000,icon:"crown"},
 {name:"Moderator",price:70000,icon:"shield-check"},
 {name:"Partner",price:60000,icon:"flame"},
 {name:"Admin",price:50000,icon:"settings-2"},
 {name:"Reseller",price:40000,icon:"shopping-bag"},
 {name:"VIP",price:30000,icon:"diamond"},
 {name:"Mem",price:15000,icon:"user"}
];
const rupiah=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const cards=document.getElementById("cards");
cards.innerHTML=roles.map((r,i)=>`<article class="card">
  <div class="role-icon"><i data-lucide="${r.icon}"></i></div>
  <h3>${r.name}</h3><div class="price">${rupiah(r.price)} <small>/ role</small></div>
  <button class="order" onclick="openModal(${i})"><i data-lucide="shopping-cart"></i> Order ${r.name}</button>
</article>`).join("");
lucide.createIcons();
let selected=null;
function openModal(i){selected=roles[i];document.getElementById("modalRole").textContent=selected.name;document.getElementById("modalPrice").textContent=rupiah(selected.price);document.getElementById("modal").classList.add("show");}
function closeModal(){document.getElementById("modal").classList.remove("show")}
function submitOrder(){
 const u=document.getElementById("username").value.trim(), c=document.getElementById("contact").value.trim();
 if(!u||!c){toast("Lengkapi username dan kontak.");return}
 closeModal();toast(`Order ${selected.name} berhasil dibuat. Backend belum terhubung.`);
 document.getElementById("username").value="";document.getElementById("contact").value="";
}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3200)}
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
