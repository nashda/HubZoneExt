
var street = document.getElementsByClassName("street-address");
if(street && street.length > 0)
{
    var city = document.getElementsByClassName("dp-subtext");
    if(city && city.length > 0)
    {
        var address = street[0].textContent + " " + city[0].textContent;

        // https://maps.certify.sba.gov/hubzone/map/search?utf8=%E2%9C%93&locale=en&query_date=2021-05-23&search=575+Cricklewood+Dr%2C+Suwanee%2C+GA+30024&button=
        // https://maps.certify.sba.gov/hubzone/map/search?utf8=%E2%9C%93&locale=en&query_date=2021-05-23&search=575+Cricklewood+Dr%2C+Suwanee%2C+GA+30024
        // https://maps.certify.sba.gov/hubzone/map/search?utf8=%E2%9C%93&locale=en&query_date=2021-05-23&search=622+Ansley+Circle+Northeast%2C+Atlanta%2C+GA%2C+USA


        address = address.replace(/(\r\n|\n|\r)/gm, "");

        chrome.runtime.sendMessage(
            {contentScriptQuery: "lookup", search: address},
            hubzone => console.log(hubzone));
    }
}

