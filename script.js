const API_URL = '/api/now-playing';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const movieGrid = document.getElementById('movie-grid');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const header = document.querySelector('.header');

async function fetchNowPlayingMovies() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
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
  }
}

window.addEventListener('scroll', () => {
  header.classList.toggle('header--scrolled', window.scrollY > 50);
});

init();
