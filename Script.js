console.log("JAVA SCRIPT");
let currentSong = new Audio();
let plybtn = document.getElementById("play1");
var songsol;
var songs;
var currentFolder;

function SecToMinSec(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid time"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatedMinute = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formatedMinute}:${formatedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;

    try {
        let response = await fetch(`./${folder}/info.json`);
        if (!response.ok) throw new Error("info.json not found");

        let data = await response.json();

        let songs = data.songs.map(songName => `./${folder}/${songName}`);
        return songs;
    } catch (err) {
        console.error(`Error loading songs from ${folder}:`, err);
        return [];
    }
}


const playMusic = (track, pause = false) => {
    if (!pause) {
        currentSong.play();
        plybtn.src = "pause.svg";
    }
    currentSong.src = track;
    currentSong.play().catch(err => console.error("Play error:", err));
    plybtn.src = "pause.svg";

    const fileName = decodeURIComponent(track.split(`/${currentFolder}/`)[1].replace(".mp3", ""));
    document.querySelector(".songdtls").innerHTML = fileName;

    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
    const albumFolders = ["Arijit Singh" , "bollywood" , "Diljit Dosang" , "Divine" , "Guru Randhava"]; // Add your album folder names here
    const baseFolder = "songs";
    const container = document.querySelector(".card-container");

    // Loop through each album folder manually
    albumFolders.forEach(async folder => {
        const fullFolder = `${baseFolder}/${folder}`;

        try {
            const data = await fetch(`./${fullFolder}/info.json`).then(r => r.json());

            container.innerHTML += `
                <div data-folder="${fullFolder}" class="card">
                    <div class="playbtn">
                        <img src="playbutton.svg" alt="playbutton">
                    </div>
                    <div class="card-image">
                        <img src="./${fullFolder}/cover.jpg" alt="image">
                    </div>
                    <h4>${data.title}</h4>
                    <p>${data.discription}</p>
                </div>`;
        } catch (err) {
            console.warn(`Missing or bad info.json in ${folder}`, err);
        }
    });

    // Wait a moment for all cards to render, then attach click listeners
    setTimeout(() => {
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                const folder = item.currentTarget.dataset.folder;
                songs = await getSongs(folder);
                currentFolder = folder;

                songsol.innerHTML = "";
                for (const song of songs) {
                    let fileName = song.split(`/${currentFolder}/`)[1].replaceAll("%20", " ").replace(".mp3", "");
                    songsol.innerHTML += `
                    <li>
                        <div class="IconCard">
                            <img src="songIcon.svg" alt="songIcon" style="width:20px; filter:invert(1);">
                            <div class="details">
                                <b>${fileName}</b><br>Album
                            </div>
                            <div class="miniPlayButton">
                                <img src="playbutton.svg" alt="play" style="width:20px; filter:invert(1); position:absolute; right:5px; top:10px;">
                            </div>
                        </div>
                    </li>`;
                }

                document.querySelector(".left").style.left = "0%";

                const items = document.querySelectorAll(".songList li");
                items.forEach((li, i) => {
                    setTimeout(() => li.classList.add("show"), i * 50);
                });

                items.forEach(li => {
                    li.addEventListener("click", () => {
                        const name = li.querySelector(".details b").innerHTML.trim();
                        const trackUrl = `./${currentFolder}/${name}.mp3`;
                        playMusic(trackUrl);
                    });
                });
            });
        });
    }, 500);
}


async function main() {

    songs = await getSongs("bollywood");
    songsol = document.querySelector(".songList ol");

    // display albums
    await displayAlbums();

    // playMusic(songs[0],true);

    for (const song of songs) {
        let fileName = song.split(`/${currentFolder}/`)[1].replaceAll("%20", " ");

        // Skip spam/ads
        // if (fileName.toLowerCase().includes("pagla")) continue;

        fileName = fileName.replace(".mp3", ""); // optional: remove extension

        songsol.innerHTML += `
        <li>
            <div class="IconCard">
                <img src="songIcon.svg" alt="songIcon" style="width:20px; filter:invert(1);">
                <div class="details">
                    <b>${fileName}</b><br>Album
                </div>
                <div class="miniPlayButton">
                <img src="playbutton.svg "alt="songIcon" style="width:20px; filter:invert(1); position:absolute ; right:5px; top:10px;">
                </div>
            </div>
        </li>
    `;
    }

    // attach event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const name = e.querySelector(".details b").innerHTML.trim(); //Get the filename
            // const trackUrl = `http://127.0.0.1:3000/${currentFolder}/${name}.mp3`; 
            const trackUrl = `./${currentFolder}/${name}.mp3`;

            playMusic(trackUrl);
        });

    });

    plybtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            plybtn.src = "pause.svg";
        } else {
            currentSong.pause();
            plybtn.src = "playbutton.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".songtime").innerHTML =
            `${SecToMinSec(currentSong.currentTime)}:${SecToMinSec(currentSong.duration)}`;

        document.querySelector(".seekbar-fill").style.width = percent + "%";
        document.querySelector(".circle").style.left = percent + "%";
    });


    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.offsetX );
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = (percent * currentSong.duration) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    document.querySelector(".closebtn").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    document.getElementById("previous").addEventListener("click", () => {
        let currentIndex = songs.findIndex(song => song === currentSong.src);

        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        }

    })
    document.getElementById("next").addEventListener("click", () => {

        let currentIndex = songs.findIndex(song => song === currentSong.src);

        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1]);
        }
    })

    document.getElementsByClassName("range")[0]
        .getElementsByTagName("input")[0]
        .addEventListener("input", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
        })

    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");

    let isDragging = false;

    circle.addEventListener("mousedown", () => isDragging = true);
    document.addEventListener("mouseup", () => isDragging = false);
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        let rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let percent = Math.max(0, Math.min(offsetX / rect.width, 1));

        document.querySelector(".seekbar-fill").style.width = percent * 100 + "%";
        circle.style.left = percent * 100 + "%";
        currentSong.currentTime = percent * currentSong.duration;
    });
    seekbar.addEventListener("click", (e) => {
        let rect = e.target.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;

        document.querySelector(".seekbar-fill").style.width = percent * 100 + "%";
        circle.style.left = percent * 100 + "%";
        currentSong.currentTime = percent * currentSong.duration;
    });

    document.getElementById("home").addEventListener("click", () => {
        location.reload(); // This reloads the current page
    });


    document.getElementById('search').addEventListener('click', () => {
        console.log("Search clicked");
        // Add search box focus or navigation
    });

}
main();

