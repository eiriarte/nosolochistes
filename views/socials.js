!function(){function e(e){if(a.classList.contains("visible")){var n=e.key||e.keyCode;27===n||"Escape"===n?t():9!=n&&"Tab"!==n||(e.shiftKey?document.activeElement===p&&(e.preventDefault(),m.focus()):document.activeElement===m&&(e.preventDefault(),p.focus()))}}function t(){a.classList.remove("visible"),l.classList.remove("visible"),s.focus()}function n(){u.select(),document.execCommand("copy")&&(d.setAttribute("aria-hidden","false"),d.setAttribute("role","alert"),d.classList.add("visible"),setTimeout(function(){d.classList.remove("visible"),d.setAttribute("aria-hidden","true"),d.removeAttribute("role")},2e3),ga("send",{hitType:"event",eventCategory:c(u.value),eventAction:"Copiar Enlace",eventLabel:u.value.split("/").pop()||"feti-chistes.es"}))}function o(e){var t,n,o=(e.parentElement.dataset.url||window.location.href).replace(/\/pag\/\d+|\?.*$/g,""),i=c(o),a=o.split("/").pop()||"feti-chistes.es";o=o+"?"+f[e.title],o=h[e.title].replace("%url%",encodeURIComponent(o)),n=e.parentElement.classList.contains("share-item")?e.parentElement.parentElement.parentElement.querySelector(".text").textContent:e.parentElement.id?document.querySelector(".text").textContent:document.title,t=n,t.length>228&&(t=t.slice(0,225)+"[…]"),o=o.replace("%tw_text%",encodeURIComponent(t)),o=o.replace("%text%",encodeURIComponent(n)),window.open(o,"_blank"),ga("send",{hitType:"event",eventCategory:i,eventAction:"Compartir en "+e.title,eventLabel:a})}function i(e){var t,n=e.parentElement.dataset.url||window.location.href;s=document.activeElement||e,t=e.parentElement.classList.contains("share-item")?e.parentElement.parentElement.parentElement.querySelector(".title").textContent:document.title,r.textContent=t,u.value=n.replace(/\/pag\/\d+|\?.*$/g,""),a.classList.add("visible"),l.classList.add("visible"),m.focus()}function c(e){return-1!==e.indexOf("/chiste/")?"Chiste":-1!==e.indexOf("/chistes")||e.length<=24?"Categoría":"Blog"}var a,l,s,r,u,m,p,d,h={Twitter:"https://twitter.com/intent/tweet?text=%tw_text%&url=%url%&via=feti_chistes&hashtags=chistes",Facebook:"https://www.facebook.com/sharer/sharer.php?u=%url%","Google+":"https://plus.google.com/share?url=%url%",WhatsApp:"https://api.whatsapp.com/send?text=%text%%20%url%"},f={Twitter:"utm_source=twitter&utm_medium=social&utm_campaign=fchtoolbar",Facebook:"utm_source=facebook&utm_medium=social&utm_campaign=fchtoolbar","Google+":"utm_source=gplus&utm_medium=social&utm_campaign=fchtoolbar",WhatsApp:"utm_source=whatsapp&utm_medium=social&utm_campaign=fchtoolbar"};document.addEventListener("DOMContentLoaded",function(){a=document.querySelector(".popup-bg"),l=document.querySelector(".popup"),d=document.querySelector(".msg-copied"),m=document.querySelector(".btn-copy-link"),p=document.querySelector(".btn-close-copy"),r=document.getElementById("link-title"),u=document.getElementById("link-input"),m.onclick=n,p.onclick=t,document.body.onkeydown=e,document.querySelectorAll(".btn-social").forEach(function(e){e.onclick="Copiar enlace"===e.title?function(){i(e)}:function(){o(e)}})})}();