/* Welcome email. Sent right after a profile is created, by the small mailer script that belongs to heavenlyvisions25@gmail.com
   (apps-script/welcome-mailer.gs). Paste its web app URL below. While MAILER is empty, nothing is sent.
   Never send from morcos.genius. */
(function(){
const MAILER="https://script.google.com/macros/s/AKfycbwh3W7xXno21PVNYYyW2ghLk5wIFgGxFCgHGgPITGY5TCRVi5oyiZCc_LCFIYKhiQXlFA/exec";
const TOKEN="3178bfbb66c717402f06ee24";
window.hvWelcome=async function(first,church,email,role){
  if(!MAILER||!email)return;
  try{await fetch(MAILER,{method:"POST",body:JSON.stringify({token:TOKEN,to:email,first:first,church:church,role:role})})}catch{}};
/* "Your access is ready" email. The mail data is signed by the games backend, so the mailer only sends it for a real grant. */
window.hvGranted=async function(mail){
  if(!MAILER||!mail)return;
  try{await fetch(MAILER,{method:"POST",body:JSON.stringify({token:TOKEN,kind:"granted",mail:mail})})}catch{}};
})();
