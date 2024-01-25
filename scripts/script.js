document.addEventListener("DOMContentLoaded", function () {
  displayAlert();
  handleNextSceneBtn();
});

function displayAlert() {
  alert(
    "Voor de beste ervaring van deze applicatie is toestemming tot de bewegingsgegevens van uw apparaat vereist. Deze toestemming verloopt na deze sessie."
  );
}

// volgorde van de scenes
const scenes = [
  `<section id="section-1" >
    <button class="start-btn" id="request-btn">
      Click to give access
    </button>
    <button class="start-btn next-scene-btn" id="click-to-start-btn">
      Click to start
    </button>
  </section>`,

  `<section id="section-2" class="map">
    <img
      id="bohios"
      src="/assets/images/begin-bohios.png"
      alt="Afbeelding van de bohios: woonplek van de Kogui."
    />
    <div id="swipe-container">
      <img
        id="swipe-image"
        src="/assets/images/bohios-planten1.png"
        alt="Swipe Image"
        draggable="false"
        class="begin-planten begin-plant1 draggable"
      />
      <img
        id="swipe-image"
        src="/assets/images/bohios-planten2.png"
        alt="Swipe Image"
        draggable="false"
        class="begin-planten begin-plant2 draggable"
      />
      <img
        id="swipe-image"
        src="/assets/images/bohios-planten3.png"
        alt="Swipe Image"
        draggable="false"
        class="begin-planten begin-plant3 draggable"
      />
    </div>
    <div class="next-scene-btn drag-next-button"></div>
  </section>`,

  `<div id="container">
    <div class="map" id="map">
      <img id="hologram" src="/assets/images/hut-geen-tekst.jpeg" />
      <img class="marker hangmat"  src="/assets/images/hangmat-tekst.png"/>
      <img class="marker pan" src="/assets/images/pan-tekst.png"/>
      <img class="hangmat-hint hint" src="/assets/images/hint-dark-green.png"/>
      <img class="pan-hint hint" src="/assets/images/hint-dark-green.png"/>
    </div>
    <div class="next-scene-btn hut-next-button"></div>
  </div>`,

  `<section id="section-4">
  <img src="/assets/images/einde-kogui.jpg" alt="Background Image" class="background-image">
  <button class="next-scene-btn">Next</button>
</section>`,
];

let currentScene = 0;

function transitionScenes() {
  currentScene++;

  if (currentScene < scenes.length) {
    const mainElement = document.querySelector("main");
    mainElement.innerHTML = scenes[currentScene];

    if (currentScene === 1) {
      const draggable = document.querySelectorAll(".draggable");

      draggable.forEach((draggable) => {
        Draggable.create(draggable, {
          type: "x,y",
          edgeResistance: 0.65,
          onDragEnd: function () {
            if (this.x > window.innerWidth || this.y > window.innerHeight) {
              gsap.to(draggable, {
                x: window.innerWidth + 100,
                y: window.innerHeight + 100,
                ease: "power2.inOut",
                duration: 0.5,
              });
            }
          },
        });
      });
    }

    if (currentScene === 2) {
      initializeZoomAndVisibility();
    }

    if (currentScene === 3) {
      history.scrollRestoration = "manual";
      window.scrollTo(0, document.body.scrollHeight);
    }
  }
  handleNextSceneBtn();
}

function handleNextSceneBtn() {
  const nextSceneBtns = document.querySelectorAll(".next-scene-btn");
  nextSceneBtns.forEach((btn) => {
    btn.addEventListener("click", () => transitionScenes());
  });
}

// zoom function & device motion
function initializeZoomAndVisibility() {
  var zoomer = panzoom(document.querySelector("#container"), {
    maxZoom: 20,
    minZoom: 1,
    onTouch: (event) =>
      event.target.classList.contains("next-scene-btn") ? false : true,
  });

  let timeout;

  zoomer.on("zoom", (event) =>
    document.querySelectorAll(".marker[data-visible]").forEach(checkIfZoomed)
  );

  function checkIfZoomed(marker) {
    let treshold = 0.7;
    let markerSize = marker.getBoundingClientRect();
    if (markerSize.width / window.innerWidth > treshold) {
      if (!marker.hasAttribute("data-active")) {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          marker.toggleAttribute("data-active");
          console.log("Activated", marker.id);

          const hints = document.querySelectorAll(".hint");
          hints.forEach((hint) => {
            hint.style.display = "none";
          });
        }, 2000);
      }
    } else {
      if (marker.hasAttribute("data-active")) {
        clearTimeout(timeout);

        marker.setAttribute("data-active", "");
        console.log("De-activated", marker.id);
      }
    }
  }

  let observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.toggleAttribute("data-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.5 }
  );

  document
    .querySelectorAll(".marker")
    .forEach((element) => observer.observe(element));
}

// device motion event
function permission() {
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response == "granted") {
          window.addEventListener("devicemotion", (e) => {});
        }
      })
      .catch(console.error);
  } else {
    alert("Accept the Device Motion Event to use this application.");
  }
}

const btn = document.getElementById("request");
btn.addEventListener("click", function () {
  const accessContainer = document.querySelector("#access-container");
  const startButton = document.querySelector(".start-btn");
  accessContainer.style.display = "none";
  startButton.style.display = "inline-block";
});

btn.addEventListener("click", permission);

window.addEventListener("deviceorientation", (evt) => {
  const angle = -evt.gamma;
  const rotation = Math.min(75, Math.max(-75, angle));

  const map = document.querySelector(".map");

  if (map) {
    map.style.transform = `translateX(${-rotation}vw)`;
  }
});
