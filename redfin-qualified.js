const src = chrome.runtime.getURL("images/checkbox-line.png");

function injectHubzone()
{
  if(!document.getElementById("hubzone"))
  {
    var iDiv = document.createElement('div');
    iDiv.id = 'hubzone';
    var image = document.createElement("img");
    image.src = src; 
    image.setAttribute("alt","Qualified HubZone");
    image.style.height = '20px';
    image.style.width = '20px';
    iDiv.innerHTML = '&nbsp;&nbsp;'
    iDiv.appendChild(image);
    var addr = document.getElementsByClassName("full-address");
    if(addr && addr.length > 0)
    {
      addr[0].appendChild(iDiv);
    }
  }
}

window.onload = injectHubzone(); // same as window.addEventListener('load', (event) => {};


// This is janky but the site was repainting after the onload() and removing the injected div
window.setInterval(() => { injectHubzone() }, 1000);