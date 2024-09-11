console.log("Lets write Javascript");
let currSong = new Audio();
let songs;
let currfolder;
// second to minutes
function secondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSceonds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSceonds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let res = await a.text();
  // console.log(res);
  let div = document.createElement("div");
  div.innerHTML = res;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all the songs in the playlist

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li class="flex items-center" >
                            <img src="img/music.svg" alt="musicLogo">
                            <div class="info">
                                <div>${song
                                  .replaceAll("%20", " ")
                                  .slice(0, -4)}</div>
                                <div>by Deepak Baghel</div>
                            </div>
                            <div class="playNow">
                                <img class="invert"src="img/playSong.svg" alt="">
                            </div>
                        </li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".info").getElementsByTagName("div")[0].innerHTML)
      PlayMusic(
        e.querySelector(".info").getElementsByTagName("div")[0].innerHTML,
        false,
        "songs"
      );
    });
  });
}

const PlayMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/"+track+".mp3")
  currSong.src = `${currfolder}/` + track + ".mp3";
  if (!pause) {
    // audio.play()
    currSong.play();
    play.src = "img/pause.svg";
  }
  let songinfo = document.querySelector(".songInfo");
  songinfo.innerHTML = decodeURI(track);
  let songduration = document.querySelector(".songTime");
  songduration.innerHTML = `00:00 / 00:00`;
};

async function getAlbums(folder) {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let res = await a.text();
  let div = document.createElement("div");
  div.innerHTML = res;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let res = await a.json();
      console.log(res);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
                        <div class="circle-container">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="black" fill="black" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="${res.image}" alt="">
                        <h2>${res.title}</h2>
                        <p>${res.description}</p>
                    </div>`;
    }
  }
}

async function main() {
  // list of all songs
  await getSongs("songs/dump");
  PlayMusic(songs[0].slice(0, -4), true);

  // Display all the albums in the page
  await getAlbums();

  // Attach and event listner to play
  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "img/pause.svg";
    } else {
      currSong.pause();
      play.src = "img/playSong.svg";
    }
  });
  // Add an eventlistner to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    if (index - 1 < 0) {
      index = songs.length;
    }
    PlayMusic(songs[index - 1].slice(0, -4));
  });

  // Add an eventlistner to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
    PlayMusic(songs[(index + 1) % songs.length].slice(0, -4));
  });

  // Listen for time update event
  let updateTime = () => {
    // songinfo.innerHTML = currSong.currentTime
    // console.log(currSong.currentTime)
    document.querySelector(".songTime").innerHTML = `${secondsToMinutes(
      currSong.currentTime
    )} / ${secondsToMinutes(currSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  };
  currSong.addEventListener("timeupdate", updateTime);

  // Add an eventlisten to seek bar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currSong.currentTime = (percent / 100) * currSong.duration;
  });

  // Add an eventlisten for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0px";
  });
  // Add close eventlistner for close buttom
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currSong.volume = parseInt(e.target.value) / 100;
      document.querySelector(".volume").getElementsByTagName("img")[0].src =
        "img/volume.svg";
    });
  document
    .querySelector(".volume")
    .getElementsByTagName("img")[0]
    .addEventListener("click", () => {
      if (currSong.volume != 0) {
        currSong.volume = 0;
        document.querySelector(".volume").getElementsByTagName("img")[0].src =
          "img/muteVolume.svg";
      } else {
        currSong.volume = 1;
        document.querySelector(".volume").getElementsByTagName("img")[0].src =
          "img/volume.svg";
      }
    });

  // Load the playList whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}
main();
