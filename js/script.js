// console.log("Java Script");
let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMMSS(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(2); // Keep two decimal places

  // Pad minutes and seconds with leading zeros if needed
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedIntSeconds = Math.floor(remainingSeconds)
    .toString()
    .padStart(2, "0"); // Use only integer part

  return `${formattedMinutes}:${formattedIntSeconds}`;
}


async function getsongs(folder) {
  currfolder = folder;
  try {
    let a = await fetch(`/${folder}/`);
    
    if (!a.ok) {
      console.error(`Failed to fetch folder: ${folder}`, a.status);
      return [];
    }
    
    let response = await a.text();
    // console.log("HTML Response:", response);
    
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      let href = decodeURIComponent(element.href); // Decode %5C to \
      href = href.replace(/\\/g, "/"); // Convert backslashes to forward slashes
      
      if (href.endsWith("mp3")) {
        let songName = href.split(`/${folder}/`)[1];
        if (songName) {
          songs.push(songName);
        }
      }
    }
    
    // console.log("Songs found:", songs);
    
    if (songs.length === 0) {
      console.warn(`No MP3 files found in ${folder}`);
      return [];
    }
    
    let songul = document
      .querySelector(".songlist")
      .getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    
    for (const song of songs) {
      songul.innerHTML +=
        `<li> <img src="musicc.svg" alt="">
          <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>song artist</div>
          </div>
          <div class="playnow">
            <span>play now</span>
            <img src="play.svg" alt="">
          </div></li>`;
    }
    
    Array.from(
      document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((element) => {
      element.addEventListener("click", (e) => {
        playmusic(
          element.querySelector(".info").firstElementChild.innerHTML.trim()
        );
      });
    });
    
    return songs;
  } catch (error) {
    console.error("Error in getsongs():", error);
    return [];
  }
}



// async function getsongs(folder) {
//   currfolder = folder;
//   let a = await fetch(`/${folder}/`);
//   let response = await a.text();
//   console.log(response.json)
//   let div = document.createElement("div");
//   div.innerHTML = response;
//   let as = div.getElementsByTagName("a");
//   songs = [];
//   for (let index = 0; index < as.length; index++) {
//     const element = as[index];
//     if (element.href.endsWith("mp3")) {
//       songs.push(element.href.split(`/${folder}/`)[1]);
//     }
//   }
//   let songul = document
//     .querySelector(".songlist")
//     .getElementsByTagName("ul")[0];
//   songul.innerHTML = "";
//   for (const song of songs) {
//     songul.innerHTML =
//       songul.innerHTML +
//       `<li> <img src="musicc.svg" alt="">
//                             <div class="info">
//                                 <div>${song.replaceAll("%20", " ")}</div>
//                                 <div>song artist</div>
//                              </div>
//                              <div class="playnow">
//                                 <span>play now</span>
//                                 <img src="play.svg" alt="">
//                             </div></li>`;
//   }
//   Array.from(
//     document.querySelector(".songlist").getElementsByTagName("li")
//   ).forEach((element) => {
//     element.addEventListener("click", (e) => {
//       console.log(element.querySelector(".info").firstElementChild.innerHTML);
//       playmusic(
//         element.querySelector(".info").firstElementChild.innerHTML.trim()
//       );
//     });
//   });
//   return songs;
// }

const playmusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};




async function displayalbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    let href = decodeURIComponent(e.href); // Decode %5C to \
    href = href.replace(/\\/g, "/"); // Convert backslashes to forward slashes
    
    if (href.includes("/songs") && !href.includes(".htaccess")) {
      let folder = href.split("/").filter(x => x).slice(-1)[0]; // Get last folder name
      console.log("Folder found:", folder); // Debug
      
      try {
        //get metadata of folders
        let infoResponse = await fetch(`/songs/${folder}/info.json`);
        if (!infoResponse.ok) {
          console.warn(`Could not fetch info.json for ${folder}`);
          continue;
        }
        let response = await infoResponse.json();
        
        cardcontainer.innerHTML +=
          ` <div data-folder="${folder}" class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
                <circle cx="18" cy="18" r="18" fill="#1fdf64" />
                <path d="M14 25L24 18L14 11V25Z" fill="black" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.JPEG" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
      } catch (error) {
        console.error(`Error loading album ${folder}:`, error);
      }
    }
  }
  
  //load the playlist when the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      if (songs.length > 0) {
        playmusic(songs[0]);
      }
    });
  });
}









// async function displayalbums() {
//   let a = await fetch(`/songs/`);
//   let response = await a.text();
//   // console.log(response.json)
//   let div = document.createElement("div");
//   div.innerHTML = response;
//   let anchors = div.getElementsByTagName("a");
//   let cardcontainer = document.querySelector(".cardcontainer");
//   let array = Array.from(anchors);
//   for (let index = 0; index < array.length; index++) {
//     const e = array[index];
//     if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
//       let folder = e.href.split("/").slice(-2)[0];
//       //get metadata of folders
//       let a = await fetch(`/songs/${folder}/info.json`);
//       let response = await a.json();
//       cardcontainer.innerHTML =
//         cardcontainer.innerHTML +
//         ` <div data-folder="${folder}" class="card">
//                         <div class="play">
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
//                                 <circle cx="18" cy="18" r="18" fill="#1fdf64" />
//                                 <path d="M14 25L24 18L14 11V25Z" fill="black" />
//                             </svg>
//                         </div>
//                         <img src="/songs/${folder}/cover.JPEG" alt="">
//                         <h2>${response.title}</h2>
//                         <p>${response.description}</p>
//                     </div>`;
//     }
//   }
//   //load the playlist when the card is clicked
//   Array.from(document.getElementsByClassName("card")).forEach((e) => {
//     e.addEventListener("click", async (item) => {
//       songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
//       playmusic(songs[0]);
//     });
//   });
// }

async function main() {
  //get all songs
  await getsongs("songs/ncs");
  playmusic(songs[0], true);
  displayalbums();
  //display all the albums cards

  //attach an eventlistner to playbar
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });
  currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMMSS(
      currentsong.currentTime
    )}/${secondsToMMSS(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  //add event listener to seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    currentsong.currentTime =
      (currentsong.duration *
        (e.offsetX / e.target.getBoundingClientRect().width) *
        100) /
      100;
  });
  //add event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add eventlistener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  //add eventlistener to previous and next

  next.addEventListener("click", () => {
    console.log("next clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    console.log(songs, index);
    if (index + 1 < songs.length) playmusic(songs[index + 1]);
  });
  prev.addEventListener("click", () => {
    console.log("next clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    console.log(songs, index);
    if (index - 1 >= 0) playmusic(songs[index - 1]);
  });
  //add eventlistener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(e, e.target, e.target.value);
      currentsong.volume = parseInt(e.target.value) / 100;
      if (currentsong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });
  //add event listner to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentsong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentsong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
