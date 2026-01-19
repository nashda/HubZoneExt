
var street = document.getElementsByClassName("street-address");
if(street && street.length > 0)
{
    // Find address on full listing page
    var address = street[0].textContent;

    // https://maps.certify.sba.gov/hubzone/map/search?utf8=%E2%9C%93&locale=en&query_date=2021-05-23&search=575+Cricklewood+Dr%2C+Suwanee%2C+GA+30024&button=
    // https://maps.certify.sba.gov/hubzone/map/search?utf8=%E2%9C%93&locale=en&query_date=2021-05-23&search=575+Cricklewood+Dr%2C+Suwanee%2C+GA+30024
    // https://maps.certify.sba.gov/hubzone/map/search?utf8=%E2%9C%93&locale=en&query_date=2021-05-23&search=622+Ansley+Circle+Northeast%2C+Atlanta%2C+GA%2C+USA


    address = address.replace(/(\r\n|\n|\r)/gm, "");

    chrome.runtime.sendMessage(
        {contentScriptQuery: "lookup", search: address, qualified: 'redfin-qualified.js', redesignated: 'redfin-redesignated.js'},
        hubzone => console.log(hubzone));
}
else
{
    var cards = document.getElementsByClassName("bp-Homecard__Address");
    if(cards && cards.length > 0)
    {
        /*
        <a class="bp-Homecard__Address flex align-center color-text-primary font-body-xsmall-compact" 
        href="/FL/Winter-Garden/15107-Kirsty-Aly-34787/home/112768651" 
        target="_blank">15107 Kirsty Aly, Winter Garden, FL 34787</a>
        */
        for(var i=0; i<cards.length; i++)
        {
            var address = cards[i].textContent;

            address = address.replace(/(\r\n|\n|\r)/gm, "");
            var href = cards[i].getAttribute("href");
            chrome.runtime.sendMessage(
                {contentScriptQuery: "search", search: address, href: href,  qualified: 'redfin-qualified.js', redesignated: 'redfin-redesignated.js'},
                hubzone => console.log(hubzone));
        }
    }
}
