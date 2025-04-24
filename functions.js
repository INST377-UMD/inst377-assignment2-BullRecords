function endVoiceControl() {
  if (annyang) {
    annyang.abort();
  }
}

function startVoiceControl() {
  if (annyang) {
    // Let's define our first command. First the text we expect, and then the function it should call
    var commands = {
      "navigate to home": () => (window.location.href = "home.html"),
      "navigate to stocks": () => (window.location.href = "stocks.html"),
      "navigate to dogs": () => (window.location.href = "dogs.html"),
      hello: () => alert("Hello World"),
      "change the color to :color": (color) =>
        (document.body.style.backgroundColor = color),
      "Lookup :stock": (stock) => (
        (document.getElementById("tickerName").value = stock),
        (document.getElementById("days").value = 30),
        getTickerChart()
      ),
      "Load dog breed :breed": (breed) => loadDogContainer(breed),
    };

    // Add our commands to annyang
    annyang.addCommands(commands);

    // Start listening. You can call this here, or attach this call to an event, button, etc.
    annyang.start();
    console.log("Voice Control Starting");
  }
}

function getRandomQuote() {
  fetch("https://zenquotes.io/api/random/")
    .then((result) => result.json())
    .then((resultJson) => {
      console.log(resultJson);
      console.log(resultJson[0].q);
      console.log(resultJson[0].a);
      document.getElementById("quote").innerHTML = resultJson[0].q;
      document.getElementById("author").innerHTML = resultJson[0].a;
    });
}

async function callStockAPI() {
  const tickerName = document.getElementById("tickerName").value;
  const tickerDays = document.getElementById("days").value;
  const key = "kHuj82Ig6DWkE35EtphiAEERYksfVQsu";

  const today = Date.now();
  const pastDate = today - tickerDays * 24 * 60 * 60 * 1000;

  const stockData = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${tickerName}/range/1/day/${pastDate}/${today}?adjusted=true&sort=asc&limit=120&apiKey=${key}`
  ).then((result) => result.json());

  return stockData;
}

async function getTickerChart() {
  const ctx = document.getElementById("tickChart");

  const labels = [];
  const data = [];

  const stockData = await callStockAPI();

  stockData["results"].forEach((element) => {
    data.push(element.c);
    labels.push(new Date(element.t).toLocaleDateString());
  });

  new Chart(ctx, {
    type: "line", //Type of Chart
    data: {
      labels: labels, //All the labels for the values
      datasets: [
        {
          label: "Currency Rate in USD",
          data: data, //All the value to be shown
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function getRedditTickers() {
  const redditTable = document.getElementById("redditTable");

  fetch("https://tradestie.com/api/v1/apps/reddit?date=2022-04-03")
    .then((result) => result.json())
    .then((resultJson) => {
      for (var i = 0; i < 5; i++) {
        const tr = document.createElement("tr");
        for (var r = 0; r < 3; r++) {
          const td = document.createElement("td");
          if (r == 0) {
            const tickName = resultJson[i].ticker;
            const link = document.createElement("a");
            link.textContent = tickName;
            link.href = `https://finance.yahoo.com/quote/${tickName}`;
            td.appendChild(link);
          } else if (r == 1) {
            td.innerHTML = resultJson[i].no_of_comments;
          } else {
            const pic = document.createElement("img");
            if (resultJson[i].sentiment == "Bullish") {
              pic.src = "bull.jpg";
            } else {
              pic.src = "bear.jpg";
            }
            td.appendChild(pic);
          }
          tr.appendChild(td);
        }
        redditTable.appendChild(tr);
      }
    });
}

async function doggieAPI() {
  const dogPics = await fetch(
    "https://dog.ceo/api/breeds/image/random/10"
  ).then((result) => result.json());

  return dogPics;
}

async function randomDoggies() {
  const dogPics = await doggieAPI();
  const sliderChildren = [];
  const container = document.getElementById("mySlider");

  simpleslider.getSlider();

  for (var i = 0; i < 10; i++) {
    document.getElementById(`dog${i}`).src = dogPics.message[i];
  }
}

function Dog(breed, description, minLife, maxLife) {
  this.breed = breed;
  this.description = description;
  this.minimumLife = minLife;
  this.maximumLife = maxLife;
}

async function getDogAPI() {
  const dogData = await fetch("https://dogapi.dog/api/v2/breeds").then(
    (result) => result.json()
  );

  return dogData;
}

const dogs = [];

async function getDogButtons() {
  const area = document.getElementById("dogButtons");

  const dogData = await getDogAPI();

  dogData.data.forEach((dog) => {
    const dogButt = document.createElement("button");
    dogButt.setAttribute("class", "button-27");
    dogButt.innerHTML = dog.attributes.name;
    area.appendChild(dogButt);
    dogs.push(
      new Dog(
        dog.attributes.name,
        dog.attributes.description,
        dog.attributes.life.min,
        dog.attributes.life.max
      )
    );
    dogButt.setAttribute(
      "onclick",
      `loadDogContainer("${dog.attributes.name}")`
    );
  });
  console.log(dogs);
}

function loadDogContainer(breed) {
  const area = document.getElementById("dogContainer");
  const dogName = document.getElementById("dogName");
  const dogDesc = document.getElementById("dogDesc");
  const dogMin = document.getElementById("dogMin");
  const dogMax = document.getElementById("dogMax");

  dogName.innerHTML = `Name: ${breed}`;
  dogDesc.innerHTML = `Description: ${
    dogs.find((dog) => dog.breed == breed).description
  }`;
  dogMin.innerHTML = `Minimum LifeSpan: ${
    dogs.find((dog) => dog.breed == breed).minimumLife
  } years`;
  dogMax.innerHTML = `Maximum LifeSpan: ${
    dogs.find((dog) => dog.breed == breed).maximumLife
  } years`;

  area.setAttribute("style", "display: block");
}

window.onload = function initialize() {
  // Run startVoiceControl on all pages
  startVoiceControl();
  // Run getRandomQuote only on home.html
  if (
    window.location.pathname === "/home.html" ||
    window.location.pathname === "/home"
  ) {
    getRandomQuote();
  } else if (
    window.location.pathname === "/stocks.html" ||
    window.location.pathname === "/stocks"
  ) {
    getRedditTickers();
  } else if (
    window.location.pathname === "/dogs.html" ||
    window.location.pathname === "/dogs"
  ) {
    randomDoggies();
    getDogButtons();
  }
};
