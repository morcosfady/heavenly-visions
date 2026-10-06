/* Welcome email. Sent right after a profile is created, by the small mailer script that belongs to heavenlyvisions25@gmail.com
   (apps-script/welcome-mailer.gs). Paste its web app URL below. While MAILER is empty, nothing is sent.
   Never send from morcos.genius. */
(function(){
const MAILER="";
const TOKEN="3178bfbb66c717402f06ee24";
window.hvWelcome=async function(first,church,email,role){
  if(!MAILER||!email)return;
  try{await fetch(MAILER,{method:"POST",body:JSON.stringify({token:TOKEN,to:email,first:first,church:church,role:role})})}catch{}};
})();
