import {
  Intro,
  TabButtons,
  TopMusics,
  SearchView,
  PlayList,
  PlayView,
} from "./components/index.js";
import { fetchMusics } from "../APIs/index.js";
import removeAllChildNodes from "./utils/removeAllChildNodes.js";

export default class App {
  constructor(props) {
    this.props = props;
    this.currentMainIndex = 0;
    this.mainViewComponents = [];
  }

  async setup() {
    const { el } = this.props;
    this.rootElement = document.querySelector(el);
    this.intro = new Intro();
    this.tabButtons = new TabButtons();
    this.topMusics = new TopMusics();
    this.searchView = new SearchView();
    this.playList = new PlayList();
    this.playView = new PlayView();
    this.mainViewComponents = [this.topMusics, this.playList, this.searchView];

    this.bindEvents();
    // 음악 가져오기
    await this.fetchMusics();
    this.init();
  }

  bindEvents() {
    // 탭버튼 컴포넌트 이벤트
    this.tabButtons.on("clickTab", (payload) => {
      const { currentIndex = 0 } = payload;
      this.currentMainIndex = currentIndex;
      this.render();
    });

    // 탑뮤직 컴포넌트 이벤트
    this.topMusics.on("play", (payload) => {
      this.playView.playMusic(payload);
    });

    this.topMusics.on("pause", () => {
      this.playView.pause();
    });

    this.topMusics.on("addPlayList", (payload) => {
      const { musics, musicIndex } = payload;
      this.playList.add(musics[musicIndex]);
    });

    // 플레이리스트에서 음악요청이 오면 플레이뷰에게 음악 플레이 요청
    this.playList.on("play", (payload) => {
      this.playView.playMusic(payload);
      this.playView.show();
    });

    this.playList.on("pause", () => {
      this.playView.pause();
    });

    this.searchView.on("searchMusic", (query) => {
      if (!query) {
        return this.searchView.setSearchResult([]);
      }
      const searchedMusics = this.topMusics.musics.filter((music) => {
        const { artists, title } = music;
        const upperCaseQuery = query.toUpperCase();
        // 아티스트 찾기
        const filteringName = artists.some((artists) =>
          artists.toUpperCase().includes(upperCaseQuery)
        );
        // 제목을 찾기
        const filteringTitle = title.toUpperCase().includes(upperCaseQuery);

        return filteringName || filteringTitle;
      });

      // 찾은 결과를 검색뷰에 반환
      this.searchView.setSearchResult(searchedMusics);
    });

    this.searchView.on("play", (payload) => {
      this.playView.playMusic(payload);
    });

    this.searchView.on("pause", () => {
      this.playView.pause();
    });

    this.searchView.on("addPlayList", (payload) => {
      const { musics, musicIndex } = payload;
      this.playList.add(musics[musicIndex]);
    });

    this.playList.on("backward", () => {
      this.playList.playPrev();
    });

    this.playList.on("forward", () => {
      this.playList.playNext();
    });

    this.playList.on("musicEnd", (payload) => {
      this.playList.playNext(payload);
    });
  }

  async fetchMusics() {
    const responseBody = await fetchMusics();
    const { musics = [] } = responseBody;
    this.topMusics.setMusics(musics);
  }

  init() {
    this.intro.show();
    this.render();
    setTimeout(() => {
      this.intro.hide();
    }, 750);
  }

  renderMainView() {
    const renderComponent = this.mainViewComponents[this.currentMainIndex];
    return renderComponent ? renderComponent.render() : "";
  }

  render() {
    removeAllChildNodes(this.rootElement);
    const tabButtons = this.tabButtons.render();
    const mainView = this.renderMainView();
    this.rootElement.append(tabButtons);
    this.rootElement.append(mainView);
  }
}
