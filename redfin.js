
var street = document.getElementsByClassName("street-address");
if(street && street.length > 0)
{
    var address = street[0].textContent;
    address = address.replace(/(\r\n|\n|\r)/gm, "");

    chrome.runtime.sendMessage(
        {contentScriptQuery: "lookup", search: address, site: "redfin"},
        result => console.log("HubZone:", result));
}
else
{
    var cards = document.getElementsByClassName("bp-Homecard__Address");
    if(cards && cards.length > 0)
    {
        for(var i=0; i<cards.length; i++)
        {
            var address = cards[i].textContent;
            address = address.replace(/(\r\n|\n|\r)/gm, "");

            chrome.runtime.sendMessage(
                {contentScriptQuery: "lookup", search: address, site: "redfin"},
                result => console.log("HubZone:", result));
        }
    }
}
