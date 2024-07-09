const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]"); 

const userContainer = document.querySelector(".weather-container");

const GrantAccessContainer = document.querySelector(".grant-location-container");

const searchForm = document.querySelector("[data-searchForm]");

const loadingScreen = document.querySelector(".loading-container"); 
const userInfoContainer = document.querySelector(".user-info-container");


const errorImg = document.querySelector(".error");



let oldTab = userTab;
const API_KEY = "3cab8c5f4d3466655ddce63f460f76bc";
oldTab.classList.add("current-tab");

getfromSessionStorage(); // Ek kaam ur pending hai??? 

// function for switch tab
function switchTab(newTab){

    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        // search form container is invisible? if yes then make it visible 
        if(!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            GrantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // main pehle search weather wale tab per tha, ab your weather tab visible karna h
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active"); 
            // ab mai your weather tab mein aa gya hu, toh weather v display karna pdega, so let's check local storage
            // for coordinates, if we have saved them there,
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);

});

// check if coordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // agar local coordinate nahi mile
        GrantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates); 
        fetchUserWeatherInfo(coordinates);  
    }
}

 async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grant container invisible
    GrantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");

    // API CALL
    try{
        const response = await fetch (`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // rendering function for showing the UI
        renderWeatherInfo(data);

    }
    catch(err){

        loadingScreen.classList.remove("active");
        // HW
    }
}

function renderWeatherInfo(weatherInfo) {
    // firstly we have to fetch the element

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it UI elements

    cityName.innerText = weatherInfo?.name;
    countryIcon.src =  `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText =`${(weatherInfo?.main?.temp - 273.15).toFixed(2)} °C`; // their is extra code from my side
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`; //adding m/s
    humidity.innerText =`${weatherInfo?.main?.humidity} %` ; //adding %
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;  //adding %
}     










function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        // HW show on alert for no geolocation support available
        
    }
}

function showPosition(position) {
     const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
     }

     sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
     fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


let searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;


    if (cityName === "")
        return;
    else
    fetchSearchWeatherInfo(cityName);

});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    GrantAccessContainer.classList.remove("active");

    try{
        const response  = await fetch (
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
        );
        console.log(response)
        if(!response.ok){
            throw new Error("error in data fetching...")
        }
        const imageDiv=document.getElementsByClassName("errorDiv"); 
        imageDiv[0].style.display="none";
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove("active");
        const imageDiv=document.getElementsByClassName("errorDiv"); 
        imageDiv[0].style.display="inline";
        document.getElementById("paragraph").innerText="Sorry, the page you are looking for does not exist...";
        document.getElementById("paragraph").style.marginLeft="36%";
    }

}

