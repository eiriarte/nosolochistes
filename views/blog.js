!function(){function e(){var e,t=document.querySelector(".toc");if(t){list=document.createElement("ol"),e=document.querySelectorAll("article>h2");for(var n=0;n<e.length;n++){var c=document.createElement("a");c.textContent=e[n].textContent,c.setAttribute("href","#"+e[n].id),list.appendChild(document.createElement("li")).appendChild(c)}t.appendChild(document.createElement("h2")).textContent=t.title,t.appendChild(list)}}function t(e,t){-1!==t.className.indexOf("open")?(t.className=t.className.replace(" open",""),e.className=e.className.replace(" open",""),e.setAttribute("aria-expanded","false"),t.setAttribute("aria-expanded","false")):(t.className+=" open",e.className+=" open",e.setAttribute("aria-expanded","true"),t.setAttribute("aria-expanded","true"))}function n(e,t,n){var c=new XMLHttpRequest;n?(c.open("POST",e,!0),c.setRequestHeader("Content-Type","application/json; charset=UTF-8"),t=JSON.stringify(t)):(n=t,t=null,c.open("GET",e,!0)),c.onload=function(){if(c.status>=200&&c.status<400)try{var e=JSON.parse(c.responseText);n(null,e)}catch(e){n(e)}else n(c.status)},c.onerror=function(){n("NETWORK_ERROR")},c.send(t)}document.addEventListener("DOMContentLoaded",function(){var c=document.querySelector(".cconsent"),a=document.getElementById("btn-menu"),o=document.getElementById("nav-menu");e(),a.onclick=function(){t(a,o)},localStorage&&localStorage.getItem("fch-cc")||n("https://d2pcbc801cuv3o.cloudfront.net/cconsent.json",function(e,t){t&&"europe"===t.location?(c.className+=" visible",document.querySelector(".cconsent .close").onclick=function(){c.className="cconsent",localStorage&&localStorage.setItem("fch-cc","1")}):localStorage&&localStorage.setItem("fch-cc","1")})})}();