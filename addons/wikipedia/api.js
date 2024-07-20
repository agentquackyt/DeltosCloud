async function search() {
    let search = Cloud.window.getValue("search_field");

    let url = "https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&prop=info&inprop=url&utf8=&format=json&srsearch="+search;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });
    const first_hit = (await response.json()).query.search[0];
    console.log(first_hit.title);
    console.log(first_hit)
    Cloud.window.getElement("answer_field").innerHTML = "<a href='https://en.wikipedia.org/wiki/"+first_hit.title+"'>"+first_hit.title+"</a><p>"+first_hit.snippet+"</p>";
    
}

export {
    search
};