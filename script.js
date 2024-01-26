let currentSong = new Audio();
let songs;
let currfolder;

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        songplay.src = "pause.svg";
    }
    document.querySelector(".songinformation").innerHTML = decodeURIComponent(track).replace(/\.mp3$/, '');
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function getSongs(folder, callback) {
    currfolder = folder;
    let a = await fetch(`https://github.com/hkhurana1602/My-Music-Website/tree/master/Songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = " ";
    for (const song of songs) {
        let songName = song.replaceAll("%20", " ").replace(/\.mp3$/, '');
        let listItem = document.createElement("li");
        listItem.innerHTML = `<img src="music.svg" alt="MusicImage">    
            <div class="songinfo">
                <div>${songName}</div>
                <div></div>
            </div>
            <div class="playing">
                <img class="invert" src="songplay.svg" alt="">
            </div>`;

        listItem.addEventListener("click", () => {
            playMusic(song);
        });

        songUL.appendChild(listItem);
    }

    if (callback) {
        callback();
    }
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML +=`<div data-folder="${folder}" class="card ">
            <div class="play">
                <img src="play.svg" alt="">
            </div>
            <img height = "200" src="/songs/${folder}/cover.jpeg" alt="lofi beats">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`, () => {
            });
        });
    })
}

async function main() {
    await getSongs("songs/ncs", () => {
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            currentSong.volume = (parseInt(e.target.value) / 100);
        })

        displayAlbums();

        songplay.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                songplay.src = "pause.svg";
            } else {
                currentSong.pause();
                songplay.src = "songplay.svg";
            }
        })

        previous.addEventListener("click", () => {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if (index - 1 >= 0) {
                playMusic(songs[index - 1]);
            }
        })

        next.addEventListener("click", () => {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if (index + 1 <= songs.length - 1) {
                playMusic(songs[index + 1]);
            }
        })

        currentSong.addEventListener("timeupdate", () => {
            const currentTime = formatTime(currentSong.currentTime);
            const totalDuration = currentSong.duration || 0;
            const totalDurationFormatted = formatTime(totalDuration);

            document.querySelector(".songtime").innerHTML = `${currentTime}/${totalDurationFormatted}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / totalDuration) * 100 + "%";
        });

        document.querySelector(".seekbar").addEventListener("click", (e) => {
            let newtime = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = newtime + "%";
            currentSong.currentTime = (newtime / 100) * currentSong.duration;
        })

        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = 0;
        })

        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-150%";
        })

        document.querySelector(".volume>img").addEventListener("click" , (event)=>{
            if(event.target.src.includes("volume.svg")){
                event.target.src = event.target.src.replace("volume.svg" , "mute.svg");
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            }
            else{
                event.target.src = event.target.src.replace("mute.svg" , "volume.svg");
                currentSong.volume = 0.4;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 40;
            }
        })
    });
}

main();


