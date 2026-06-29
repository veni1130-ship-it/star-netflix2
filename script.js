const LOCAL_BACKEND = 'http://localhost:3000';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const movieGrid = document.getElementById('movie-grid');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('error-message');
const header = document.querySelector('.header');

function getApiEndpoints() {
  const relative = '/api/now-playing';
  const local = `${LOCAL_BACKEND}/api/now-playing`;

  const servedByBackend =
    window.location.port === '3000' ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app');

  if (servedByBackend) {
    return [relative];
  }

  return [local, relative];
}

async function fetchNowPlayingMovies() {
  const endpoints = getApiEndpoints();
  let lastError = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        lastError = new Error(`API 요청 실패: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (!Array.isArray(data.results)) {
        lastError = new Error(data.error || '영화 목록 형식이 올바르지 않습니다.');
        continue;
      }

      return data.results;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('API 요청 실패');
}

function createMovieCard(movie) {
  const card = document.createElement('article');
  card.className = 'movie-card';

  const posterWrap = document.createElement('div');
  posterWrap.className = 'movie-card__poster-wrap';

  if (movie.poster_path) {
    const img = document.createElement('img');
    img.className = 'movie-card__poster';
    img.src = `${IMAGE_BASE}${movie.poster_path}`;
    img.alt = movie.title;
    img.loading = 'lazy';
    posterWrap.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'movie-card__poster movie-card__poster--placeholder';
    placeholder.textContent = '포스터 없음';
    posterWrap.appendChild(placeholder);
  }

  const overlay = document.createElement('div');
  overlay.className = 'movie-card__overlay';
  const rating = document.createElement('span');
  rating.className = 'movie-card__rating';
  const score = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '-';
  rating.textContent = `★ ${score}`;
  overlay.appendChild(rating);
  posterWrap.appendChild(overlay);

  const info = document.createElement('div');
  info.className = 'movie-card__info';

  const title = document.createElement('h4');
  title.className = 'movie-card__title';
  title.textContent = movie.title;

  const date = document.createElement('p');
  date.className = 'movie-card__date';
  date.textContent = movie.release_date || '개봉일 미정';

  info.appendChild(title);
  info.appendChild(date);

  card.appendChild(posterWrap);
  card.appendChild(info);

  return card;
}

function renderMovies(movies) {
  movieGrid.innerHTML = '';

  movies.forEach((movie) => {
    movieGrid.appendChild(createMovieCard(movie));
  });
}

function setStatus(status) {
  loadingEl.hidden = status !== 'loading';
  errorEl.hidden = status !== 'error';
}

async function init() {
  setStatus('loading');

  try {
    const movies = await fetchNowPlayingMovies();

    if (!Array.isArray(movies) || movies.length === 0) {
      throw new Error('영화 목록이 비어 있습니다.');
    }

    renderMovies(movies);
    setStatus('success');
  } catch (err) {
    console.error(err);
    movieGrid.innerHTML = '';
    setStatus('error');

    const needsServer =
      window.location.protocol === 'file:' ||
      (window.location.port && window.location.port !== '3000');

    if (needsServer && err instanceof TypeError) {
      errorMessageEl.textContent =
        '백엔드 서버에 연결할 수 없습니다. 터미널에서 npm start 실행 후 http://localhost:3000 으로 접속해 주세요.';
    } else if (needsServer) {
      errorMessageEl.textContent =
        '영화 정보를 불러오지 못했습니다. npm start 로 서버를 실행했는지 확인해 주세요.';
    } else {
      errorMessageEl.textContent =
        '영화 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }
}

window.addEventListener('scroll', () => {
  header.classList.toggle('header--scrolled', window.scrollY > 50);
});

init();
