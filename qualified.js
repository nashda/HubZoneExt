const src = chrome.runtime.getURL("images/roundCheck.png");

function injectHubzone()
{
  if(!document.getElementById("hubzone"))
  {
    console.log("Inject");
    var iDiv = document.createElement('div');
    iDiv.id = 'hubzone';
    var image = document.createElement("img");
    image.src = src; 
    image.setAttribute("alt","Qualified HubZone");
    console.log("Received URL" + image.src);
    image.style.height = '20px';
    image.style.width = '20px';
    iDiv.innerHTML = '&nbsp;&nbsp;'
    iDiv.appendChild(image);
    var addr = document.getElementsByClassName("homeAddress-variant");
    if(addr && addr.length > 0)
    {
      addr[0].appendChild(iDiv);
    }
  }
}

window.onload = injectHubzone(); // same as window.addEventListener('load', (event) => {};

window.setInterval(() => { injectHubzone() }, 1000);