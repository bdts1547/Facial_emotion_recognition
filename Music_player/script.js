
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'ND_PLAYER'
const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const progress = $('#progress')
const playBtn = $('.btn-toggle-play')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')

const nameSongs = document.cookie.split(',')
const songs = []


nameSongs.forEach(function (name, i) {
    name = name.replace(/\s/g, '')
    if (name) {
        const obj = {
            name: name,
            singer: "Unknown",
            path: './assets/songs/' + name + '.mp3',
            image: "Unknown"
        }
        songs.push(obj)
    }
})

console.log(songs)


const app = {
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isLoadConfigProgress: true,
    currentIndex: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    
    songs: songs,
    
    // songs: [
    //     {
    //         name: "Từng thương",
    //         singer: "Phan Duy Anh",
    //         path: "./assets/playlists/music/song1.mp3",
    //         image: "./assets/img/song1.png"
    //     },
    //     {
    //         name: "Chơi vơi",
    //         singer: "Trung Quân",
    //         path: "./assets/playlists/music/song2.mp3",
    //         image: "./assets/img/song2.png"
    //     },
    //     {
    //         name: "Đế vương",
    //         singer: "Đình Vũ",
    //         path: "./assets/playlists/music/song3.mp3",
    //         image: "./assets/img/song3.png"
    //     },
    //     {
    //         name: "Gửi Em",
    //         singer: "Hoa Vinh",
    //         path: "./assets/playlists/music/song4.mp3",
    //         image: "./assets/img/song4.png"
    //     },
    //     {
    //         name: "Tâm sự tuổi 30",
    //         singer: "Trịnh Thăng Bình",
    //         path: "./assets/playlists/music/song5.mp3",
    //         image: "./assets/img/song5.png"
    //     },
    //     {
    //         name: "Bac phan",
    //         singer: "Jack 5tr",
    //         path: "./assets/playlists/music/song6.mp3",
    //         image: "./assets/img/song6.png"
    //     },
    //     {
    //         name: "Song gio",
    //         singer: "Jack 5tr",
    //         path: "./assets/playlists/music/song7.mp3",
    //         image: "./assets/img/song6.png"
    //     },
    //     {
    //         name: "Ve ben anh",
    //         singer: "Jack 5tr",
    //         path: "./assets/playlists/music/song8.mp3",
    //         image: "./assets/img/song6.png"
    //     }
    // ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                    <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                        <div class="thumb"
                            style="background-image: url(${song.image});">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>
            `
        })
        playList.innerHTML = htmls.join('\n')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Quay cd / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10s
            iteration: Infinity
        })
        cdThumbAnimate.pause()

        // Phóng to / thu nhỏ cd
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth - scrollTop

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth
        }

        // Khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi audio play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khu audio pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            // this la` audio
            if (this.duration) {
                const progressPercent = (this.currentTime / this.duration * 100)
                progress.value = progressPercent
                _this.setConfig('currentTime', this.currentTime)
            }
        }

        // Khi tua bai hat
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
            _this.setConfig('currentIndex', _this.currentIndex)
        }

        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
            _this.setConfig('currentIndex', _this.currentIndex)
        }

        // Bật / tắt random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Lặp lại bài hót
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        audio.onended = function() {
            if (_this.isRepeat) {
                this.play()
            } else {
                nextBtn.click()
            }
        }

        // Play khi click vào bài hát
        playList.onclick = function(e) {
            const nodeSong = e.target.closest('.song:not(.active)')
            console.log(nodeSong)
            if (nodeSong || e.target.closest('.option')) {
                if (nodeSong) {
                    _this.currentIndex = nodeSong.dataset.index
                    _this.loadCurrentAudio()
                    _this.render()
                    _this.setConfig('currentIndex', _this.currentIndex)
                    audio.play()
                }
                if (e.target.closest('.option')) {
                    // pass
                }

            }

        }

    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 200)
    },
    _loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        this.currentIndex = this.config.currentIndex
        audio.currentTime = this.config.currentTime
        // console.log(typeof this.config.currentTime)

        // Object.assign(this, this.config)
        // render config
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    },
    get loadConfig() {
        return this._loadConfig
    },
    set loadConfig(value) {
        this._loadConfig = value
    },
    loadCurrentAudio: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentAudio()
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex === this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentAudio()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentAudio()
    },
   
    start: function() {
        this.loadConfig()
        this.render()
        this.defineProperties()
        this.handleEvents()
        this.loadCurrentAudio()

        
    }
}

app.start()

