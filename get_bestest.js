// run on cinema genre page (like comedy) on the 6006.json object, should be ~50kB. Right click -> copy value -> copy response. myobj = ctrl+v in console
function getIDs(cineJson) {
    return cineJson?.strates?.map(x=>x?.contents?.map(y=>y.type == "VoD" && y.contentID || undefined)).flat().filter(x=>x) // not undefined
}

function getRatings(vodJson) {
    let reviews = vodJson.detail.reviews
    let ratings = reviews?.map(x=>(x.rating.type.startsWith("tele") ? 5/4 : 1) * x.rating.value) // correct for telerama/telecable being out of 4
    // the "right" way to do this would be to do it by percentile for each of the rating sites
    return ratings?.length > 0 ? ratings?.reduce((l,r) => l+r) / ratings?.length : undefined
}

async function getDetails(ID) {
    return (await fetch(`https://hodor.canalplus.pro/api/v2/mycanal/detail/${API_KEY}/okapi/${ID}.json?detailType=detailPage&objectType=unit&displayLogo=true&dsp=detailPage&sdm=show&featureToggles=detailV5`)).json()
}

function details2Human(details) {
    let ratings = getRatings(details)
    let countries = details.detail?.productionNationalities[0]?.productionNationalitiesList.map(x=>x.title).join(", ")
    return {title: details.detail.title, details: details.detail.editorialTitle, countries, ratings}
}

// no lets because in console
API_KEY = "your key here" // changes ... sometimes? get from the 6006 json request
myobjs = await (await fetch(`https://hodor.canalplus.pro/api/v2/mycanal/page/${API_KEY}/6006.json?aegon=true&get=14`)).json() // needs to run on e.g. comedie page. no idea what get=14 does?
// myobjs = await (await fetch(`https://hodor.canalplus.pro/api/v2/mycanal/contentGrid/${API_KEY}/creplay_chaine_paramountplus_menu_films.json?objectType=list&dsp=detailPage&sdm=show&previousContextDetail=mycanal-chaines__apps-chaines-paramount%2B-2-contentrow_%28no_title%29-contentrow-creplay_chaine_paramountplus_menu&discoverMode=true&displayNBOLogo=true&logoChannelBackgroundColor=black&displayLogo=true`)).json() // paramount, seems to be limited to 100 though
myIDs = getIDs(myobjs) ?? myobjs?.contents?.map(y=>y.type == "VoD" && y.contentID || undefined).filter(x=>x) // not undefined
detailsArray = await Promise.all(myIDs.slice(0,1000).map(x=>getDetails(x)))
humanDetailsArray = detailsArray.map(x=>details2Human(x))

noDups = []
map = new Map()
for (const item of humanDetailsArray) {
    if(!map.has(item.title + item.details)){
        map.set(item.title + item.details, true)
        noDups.push(item)
    }
}

// Play with the object down here
noDups.filter(x=>!isNaN(x.ratings) && x.countries.includes("France")).sort((l,r) => l.ratings < r.ratings)
//humanDetailsArray.filter(x=>!isNaN(x.ratings)).sort((l,r) => l.ratings < r.ratings)
// humanDetailsArray.filter(x => x.title.contains("isages"))
// new Set(humanDetailsArray.map((x) => x.countries.split(",").map(x=>x.trim())).flat().sort())
