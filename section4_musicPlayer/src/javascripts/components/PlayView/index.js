import EventEmitter from "../common/EventEmitter.js";

export default class PlayView extends EventEmitter {
  constructor() {
    super();
    this.rootElement = PlayView.createRenderElement();
    this.audio = new Audio();

    // 현재 음악을 담당할 변수
    this.playViewMusic = null;
    // 반복할지 여부
    this.repeat = false;

    this.random = false;

    this.bindEvents();
  }

  static createRenderElement() {
    const playViewWrapper = document.createElement("article");
    playViewWrapper.classList.add("play-view");

    return playViewWrapper;
  }

  bindEvents() {
    this.audio.addEventListener("ended", () => {
      const fromPauseToPlay = this.rootElement.querySelector(".control-play");
      const fromPlayToPause = this.rootElement.querySelector(".control-pause");
      fromPlayToPause.classList.add("hide");
      fromPauseToPlay.classList.remove("hide");
      this.emit("musicEnded", { repeat: this.repeat, random: this.random });
    });

    /**
     * 플레이 시간을 옮길 때 (레인지 인풋) 충돌이 있어 인터벌을 주어 레인지 인풋 이벤트가 충분히 발생할 수 있도록 한다.
     * 시간이 지날 때마다 레인지 인풋을 옮긴다.
     * 레인지 인풋으로 쓴 이유는 이벤트 처리가 간단해서 사용하였다.
     * CSS를 할때는 더 난이도가 있다.
     * div를 활용한 css 는 처리가 쉽지만 이벤트를 붙이기가 곤란하다. 시험이 나온다면 일반적으로는 레인지 인풋으로 하게 할 가능성이 좀더 높다.
     */
    let intervaler = 0;
    this.audio.addEventListener("timeupdate", () => {
      // 타임 업데이트를 잠시 멈추고 진행상황을 업데이트합니다.
      intervaler++;
      if (intervaler % 3 !== 0) {
        return;
      }

      // 오디오의 현재 시간 / 오디오의 전체 시간을 나누기 계산하여 현재 진행율을 확인합니다.
      const audioProgress =
        (this.audio.currentTime / this.audio.duration) * 100;
      // 100 이 혹시 넘는 경우 처리를 해줍니다. (보통은 그럴 일이 없긴 합니다.)
      const controlProgress = audioProgress > 100 ? 100 : audioProgress;
      // 루트 엘리먼트로부터 재생하는 인풋 레인지 엘리먼트를 찾습니다.
      const progressBarElement = this.rootElement.querySelector(".progress");
      // 레인지를 1000으로 해주었기 때문에 10씩 곱해줍니다. 1000으로 한 이유는 100씩 하면 1%씩 움직여서 뚝뚝 끊어지는 느낌이 납니다.
      progressBarElement.value = controlProgress ? controlProgress * 10 : 0;
    });
  }

  playMusic(payload) {
    this.pause();

    if (payload) {
      const { musics, musicIndex } = payload;
      this.audio.src = musics[musicIndex].source;
      this.playViewMusic = musics[musicIndex];
      this.renderMusicContainer();
    }
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  renderMusicContainer() {
    const { artists, cover, title } = this.playViewMusic;
    this.rootElement.innerHTML = `
            <div class="play-view-container">
                <h2 class="invisible-text">Play View</h2>
                <button class="back-button">
                    <i class="icon-controller-back"></i>
                </button>
                <div class="cover-wrapper">
                    <img src="http://localhost:3000${cover}" />
                </div>
                <div class="music-information">
                    <h3 class="music-title">${title}</h3>
                    <span class="music-artist-name">${artists.join(", ")}</span>
                </div>
                <div class="play-view-controller">
                    <div class="controller-container">
                        <button class="control-button control-repeat ${
                          this.repeat ? "on" : ""
                        }">
                            <i class="icon-controller-repeat"></i>
                        </button>
                        <button class="control-button control-backward">
                            <i class="icon-controller-backward"></i>
                        </button>
                        <button class="control-button control-play hide">
                            <i class="icon-controller-play"></i>
                        </button>
                        <button class="control-button control-pause">
                            <i class="icon-controller-pause"></i>
                        </button>
                        <button class="control-button control-forward">
                            <i class="icon-controller-forward"></i>
                        </button>
                        <button class="control-button control-rotate" ${
                          this.random ? "on" : ""
                        }>
                            <i class="icon-controller-rotate"></i>
                        </button>
                    </div>
                    <div class="progress-container">
                        <input class="progress" type="range" min="0" max="1000" value="0">
                        <div class="progress-time">
                            <div class="current-time">1:43</div>
                            <div class="end-time">3:16</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    const backButton = this.rootElement.querySelector(".back-button");
    const playButton = this.rootElement.querySelector(".control-play");
    const pauseButton = this.rootElement.querySelector(".control-pause");
    const backward = this.rootElement.querySelector(".control-backward");
    const forward = this.rootElement.querySelector(".control-forward");
    const repeat = this.rootElement.querySelector(".control-repeat");
    const random = this.rootElement.querySelector(".control-rotate");
    const progress = this.rootElement.querySelector(".progress");

    playButton.addEventListener("click", () => {
      this.playMusic();
      playButton.classList.add("hide");
      pauseButton.classList.remove("hide");
    });

    pauseButton.addEventListener("click", () => {
      this.pause();
      pauseButton.classList.add("hide");
      playButton.classList.remove("hide");
    });

    repeat.addEventListener("click", () => {
      this.repeat = !this.repeat;
      if (this.repeat) {
        repeat.classList.add("on");
      } else {
        repeat.classList.remove("on");
      }
    });

    random.addEventListener("click", () => {
      this.random = !this.random;
      if (this.random) {
        random.classList.add("on");
      } else {
        random.classList.remove("on");
      }
    });

    backButton.addEventListener("click", () => {
      this.hide();
    });

    backward.addEventListener("click", () => {
      this.emit("backward");
    });

    forward.addEventListener("click", () => {
      this.emit("forward");
    });

    progress.addEventListener("change", (event) => {
      const targetTime =
        (this.audio.duration * Number(event.target.value)) / 1000;
      this.audio.currentTime = targetTime;
    });
  }

  show() {
    document.body.append(this.rootElement);
  }

  hide() {
    document.body.removeChild(this.rootElement);
  }
}
