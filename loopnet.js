
var street = document.getElementsByClassName("breadcrumbs__crumb-title");
if(street && street.length > 0)
{
    var address = street[0].textContent;

    console.log(address);

    address = address.replace(/(\r\n|\n|\r)/gm, "");

    chrome.runtime.sendMessage(
        {contentScriptQuery: "lookup", search: address, qualified: 'loopnet-qualified.js', redesignated: 'loopnet-redesignated.js'},
        hubzone => console.log(hubzone));
}

