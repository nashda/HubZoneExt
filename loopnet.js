
var street = document.getElementsByClassName("breadcrumbs__crumb-title");
if(street && street.length > 0)
{
    var address = street[0].textContent;
    address = address.replace(/(\r\n|\n|\r)/gm, "");

    chrome.runtime.sendMessage(
        {contentScriptQuery: "lookup", search: address, site: "loopnet"},
        result => console.log("HubZone:", result));
}

