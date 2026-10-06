/* Heavenly Visions: language loader. English is the default and loads nothing extra.
   Arabic loads rtl.css and i18n-ar.js (the dictionary and the translator) before the first screen is drawn.
   The language is kept in localStorage hv_lang. Changing it reloads the app so every screen starts clean. */
(function(){
const get=()=>{try{return localStorage.getItem("hv_lang")||"en"}catch{return "en"}};
window.hvLang=get;
window.hvSetLang=function(v){try{localStorage.setItem("hv_lang",v)}catch{}location.reload()};
const l=get();
document.documentElement.lang=l;
if(l==="ar"){
  document.documentElement.dir="rtl";document.documentElement.classList.add("ar");
  document.write('<link rel="stylesheet" href="rtl.css?v=1"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap"><script src="i18n-content.js?v=1"><\/script><script src="i18n-ar.js?v=1"><\/script>');
}
})();
