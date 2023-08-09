const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PlAYER_STORAGE_KEY = "F8_PLAYER";
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "A loi",
            singer: "2t",
            path: "/assets/music/song1.mp3",
            image: "/assets/img/song1.jpg",
        },
        {
            name: "Ve tinh",
            singer: "hieu thu 2",
            path: "/assets/music/song2.mp3",
            image: "/assets/img/song2.jpg",
        },
        {
            name: "Ngu 1 minh",
            singer: "hieu thu 2",
            path: "/assets/music/song3.mp3",
            image: "/assets/img/song3.jpg",
        },
        {
            name: "Hen gap em duoi anh trang",
            singer: "hieu thu 2, hurrykng",
            path: "/assets/music/song4.mp3",
            image: "/assets/img/song4.jpg",
        },
        {
            name: "Thang dien",
            singer: "Justatee",
            path: "/assets/music/song5.mp3",
            image: "/assets/img/song5.jpg",
        },
        {
            name: "Troi mang troi giau di",
            singer: "Amee",
            path: "/assets/music/song6.mp3",
            image: "/assets/img/song6.webp",
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                <div class="thumb" style="background-image: url('${song.image}');"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option"><i class="fas fa-ellipsis-h"></i></div>
            </div>`
        })

        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        // xử lý CD quay /dừng lại
        const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        });
        cdThumbAnimate.pause();
        // xử lý phóng to/ thu nhỏ 
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        //  xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {

                audio.play()
            }
        }
        // khi song dc play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // khi song bi pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercennt = Math.floor(this.currentTime / audio.duration * 100)
                progress.value = progressPercennt
            }
        }
        // xử lý khi tua song
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        // khi next song 
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()

            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // khi prev song 

        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {

                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }
        //xử lý bật tắt random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)

        }
        // xử lý bật tắt repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)

            repeatBtn.classList.toggle('active', _this.isRepeat)

        }
        // xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        //  lắng nghe hành vi click vào play list
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || !e.target.closest('option')) {
                // xử lý khi click vào song thì chuyển vào bài đó
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                if (!e.target.closest('option')) {

                }
            }
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 500)
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function () {

        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong();
    },
    start: function () {
        // gán cấu hình từ config vào ứng dụng
        this.loadConfig
        // Định nghĩa các thuộc tính 
        this.defineProperties();
        // Lắng nghe / xử lý các sư kiện (DOM event)
        this.handleEvents();
        // Tải thông tin bài hát đầu tiên khi chạy ứng dụng
        this.loadCurrentSong();
        //Render playlists
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
};

app.start();
