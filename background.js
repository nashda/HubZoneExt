const begin = "var response = JSON.parse('";
const end = "');";

function parseResponse(tabId,response)
{
  const indexOfFirst = response.indexOf(begin);
  var cutRight = response.substr(indexOfFirst + begin.length);
  const indexOfFirstEnd = cutRight.indexOf(end);
  var cutLeft = cutRight.substr(0, indexOfFirstEnd)
  var json = JSON.parse(cutLeft);
  if(json.hubzone && json.hubzone.length > 0)
  {
    chrome.scripting.executeScript({
      target: {tabId: tabId, allFrames: true},
      files: ['inject.js'],
    });

    console.log(json.hubzone[0].current_status);
    return json.hubzone[0].current_status;
  }
  return false;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension Loaded');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received: " + request.contentScriptQuery);

    if (request.contentScriptQuery == "lookup") {

      var url = "https://maps.certify.sba.gov/hubzone/map/search?utf8=%E2%9C%93&locale=en&query_date=2021-05-23&search=" +
              encodeURIComponent(request.search);

      console.log(url);

      var myHeaders = new Headers();
      myHeaders.append("X-CSRF-Token", "GIxNgIvKNp3DIkOikmFym7E-0kJ7h18kjn7Hc51psLiAacagyCJMa9KEbmH-11sDjEDiq03Xjmj1IU9J_ylizg");
      myHeaders.append("X-Requested-With", "XMLHttpRequest");
      myHeaders.append("Cookie", "_hubzone_map_session=S3ZjL1p6MlJlR3JDbjVScDdDYXprVG00eHFzS2xrd1lpYzhhNmJ1cmNzR3JWZ0c4dEtpNFhYTXFHRkFiYndwV2t6VllOcU1uUWVUZ2JQYWwyaHNnUVd5Zk1pYzFFRnNHMkhKNiswNHltL04zWnNPTHZuUXB1ZE1Eb0J1YmJqSjhzNTBYVmVjaC9NbzZnT2hCK0dmWVdRPT0tLTRTRFdBYnFiSm5vSWdtWndURlhVY3c9PQ%3D%3D--dbffac863d1d4e338cd763d2422056880dfe9b66");
      
      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      fetch(url, requestOptions)
          .then(response => response.text())
          .then(text => parseResponse(sender.tab.id,text))
          .then(hubzone => sendResponse(hubzone))
          .catch(error => console.log(error))

      return true;  // Will respond asynchronously.
    }
  });
