
var street = document.getElementById("ds-chip-property-address");
if(street)
{
    var address = street.textContent;
    address = address.replace(/(\r\n|\n|\r)/gm, "");

    chrome.runtime.sendMessage(
        {contentScriptQuery: "lookup", search: address, site: "zillow"},
        result => console.log("HubZone:", result));
}

