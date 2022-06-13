import { Utils }  from './utils';
export class Views {

    //Current pages can have values like HOME,ALBUMS,TRACKS,USER_ACCOUNT
    static activePage;
    static activeTrack;

    static renderHeadingView = headingTitle => {
        return `<div class='row'>
                    <div class='col-12'>
                        <h5 class='display-4 mb-2 ml-2'>${headingTitle}</h5>
                        <hr class='bg-light mt-0 mb-4'>
                    </div>
                </div>`;    
    }

    static renderAlbumCardView = album => {
        return `<a href='#' class='list-group-item list-group-item-action albumItem' data-uid='${album._id}'>
                    <div class='d-flex w-100 justify-content-start'>
                        <img class='mr-3 align-self-center' src='${album.cover}' alt='${album.name}-cover' style='max-width: 60px; max-height: 60px'>
                        <div>
                            <h5 class='card-title mb-1'>${album.name}</h5>
                            <p class='mb-0'>${album.year} | ${album.tracks.length} Songs</p>
                            <p class='mb-0'>${album.genre}</p>
                        </div>
                    </div>
                </a>`;        
    }

    static renderAlbumView = albums => {
        if(albums.length === 0) return Views.renderNoContentView();
        let markup = `<div class='list-group mb-4 albumsView cc-animation-slideIn-1x'>`;
        albums.forEach(album => {
            markup += Views.renderAlbumCardView(album);
        });
        markup += `</div>`;
        return markup;
    }

    static renderNoContentView = () => {
        return `<div class='row pl-1 pr-1 pl-md-3 pr-md-3 cc-animation-slideIn-1x'>
                    <div class='col-12 text-center'>
                        <i class='fas fa-sad-tear fa-4x mb-1'></i>
                        <p class='display-4'> Nothing Found! </p>
                    </div>
                </div>`;
    }

    static renderPaginationEl = (page, active) => {
        return `<li class='page-item c-link${active ? ' active' : ''}' id='${page}'>
                    <a class='page-link' tabindex='-1'>${page}</a>
                </li>`;
    }

    static renderPaginationGroup = (curPage, lowerBound, upperBound) => {
        let markup = '';
        for(let i = lowerBound; i <= upperBound; i++) {
            if(i === curPage) markup += Views.renderPaginationEl(i, true);
            else markup += Views.renderPaginationEl(i, false);
        } 
        return markup;
    }

    static renderPaginationView = (curPage, totalPageCount) => {
        
        let markup = '';

        if(curPage % 5 === 1) {
            markup += Views.renderPaginationGroup(curPage, curPage, Math.min((curPage + 4), totalPageCount));  
        } else {
            const [min, max] = Utils.getPaginationRange(curPage);
            markup += Views.renderPaginationGroup(curPage, min, Math.min(max, totalPageCount));
        }


        return `<nav>
                    <ul class='pagination pagination-sm justify-content-center pagination__main'>
                        <li class='page-item${curPage === 1 ? ' disabled' : ' c-link'}' id='prev'>
                            <a class='page-link' tabindex='-1'>Previous</a>
                        </li>
                        ${markup}
                        <li class='page-item${(curPage === totalPageCount) ? ' disabled' : ' c-link'}' id='next'>
                            <a class='page-link' tabindex='-1'>Next</a>
                        </li>
                    </ul>
                </nav>`;
    }

    static renderSearchBarView = () => {
        return `<div class='row mb-3 cc-animation-slideIn-1x'>
                    <div class='col-12'>
                        <div class='input-group'>
                            <input class='form-control no-inset-outline' type='text' placeholder='Search' id='main__search-input'>
                            <div class='input-group-append'>
                                <select class='form-control c-form-control no-inset-outline' id='main__search-select'>
                                    <option value='0'>By Album</option>
                                    <option value='1'>By Artist</option>
                                    <option value='2'>By Year</option>
                                </select>
                                <button class='btn btn-primary text-light main__search-btn type='button'>
                                    <span class='fas fa-search'></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
    }

    static renderAlbumSearchView = albums => {
        return `<div id='searchView'>
                    <div class='row${ albums.length === 0 ? ' mb-5' : ''}'>
                        <div class='col-12'>
                            <button class='btn btn-transparent text-light mb-2' id='searchViewBackBtn'>
                                <i class='fas fa-chevron-left'></i> Albums
                            </button>
                        </div>
                    </div>
                    ${ albums.length === 0 ? Views.renderNoContentView() : Views.renderAlbumView(albums) }
                </div>`;
    } 

    static renderTrackListItemView(track) {
        return `<a style='cursor: pointer' class='list-group-item list-group-item-action trackItem' data-uid='${track._id}'>
                    <div class='d-flex w-100 justify-content-between'>
                        <div>
                            <p class='mb-1'><strong>${track.title}</strong></p>
                            <p class='mb-1'>${track.artists}</p>
                            <small>${ Utils.parseDuration(track.duration) }</small>
                        </div>
                        <button class='btn btn-transparent align-self-center optionsBtn'><i class='fas fa-ellipsis-v'></i></button>
                    </div>   
                </a>`;
    }

    static renderTrackListView(targetAlbum) {
        return `<div class='row cc-animation-slideIn-1x tracksView mb-4'>
                    <div class='col-12'>
                        <button class='btn btn-transparent text-light mb-2' id='tracksViewBackBtn'>
                            <i class='fas fa-chevron-left'></i> Back
                        </button>
                    </div>
                    <div class='col-12 col-sm-6 col-md-4'>
                        <div class='card text-center cc-rounded'>
                            <div class='card-body text-secondary'>
                                <img src='${targetAlbum.cover}' alt='${targetAlbum.name}-cover' class='cc-rounded' style='max-width: 100%;'>
                                <h5 class='card-title mt-3 mb-1'>${targetAlbum.name}</h5>
                                <p class='card-text mb-1'>${targetAlbum.genre}</p>
                                <p class='card-text mb-0'>${targetAlbum.year}</p>
                            </div>
                        </div>
                    </div>
                    <div class='col-12 col-sm-6 mt-3 mt-sm-0'>
                         <div class="list-group cc-rounded">
                            ${targetAlbum.tracks.map(track => Views.renderTrackListItemView(track)).join('')}
                        </div>
                    </div>
                </div>`;
    }

    static renderPlayerView(albumCover, albumName, trackTitle, trackArtists) {
        return  `<div class="playerView cc-animation-slideUp-1x">
                    <div class="playerView__info">
                        <div class="playerView__info-thumbnail">
                            <img src="${albumCover}" alt="${albumName}-cover" id="playerView__info-thumbnail-pic">
                            <div class="img-backdrop">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="sr-only">Loading...</span>
                                </div>
                            </div>
                        </div>
                        <div class="playerView__infometa ml-3 text-secondary">
                            <p class="mb-0"><strong id="playerView__infometa-title">${Utils.formatTrackTitleString(trackTitle)}</strong></p>
                            <p class="small mb-0" id="playerView__infometa-artist">${Utils.formatArtistString(trackArtists)}</p>
                        </div>
                    </div>
                    <div class="playerView__content text-center">
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-transparent"><i id="prevTrackBtn" class="fas fa-step-backward"></i></button>
                            <button type="button" class="btn btn-transparent"><i id="playPauseBtn" class="fas fa-play"></i></button>
                            <button type="button" class="btn btn-transparent"><i id="nextTrackBtn" class="fas fa-step-forward"></i></button>
                            <button type="button" class="btn btn-transparent"><i id="likeSongBtn" class="far fa-heart"></i></button>
                        </div>
                        <div class="playerView__content-seekbarView text-dark d-flex">
                            <span class="small mr-2" id="curTimeView">00:00</span>
                            <input type="range" class="form-range" id="seekbar">
                            <span class="small ml-2" id="totalTimeView">00:00</span>
                        </div>
                    </div>
                </div>`;
    }

    static renderUploadTrackView = tracks => {
        return tracks.map((track, idx) => {
                    return `<div class="form-group">
                                <label for="trackDetails">Track #${(idx + 1)}</label>
                                <div id="trackDetails">
                                    <input type="text" class="form-control r-bl-0 r-br-0 bb-0 trackTitleInput" value="${track.title}" required>
                                    <input type="text" class="form-control r-tl-0 r-tr-0 trackArtistsInput" value="${track.artists}" required>
                                </div>
                            </div>`;
                }).join('');
    }

    static renderUploadAlbumView = album => {
        return `<div class='col-12 col-md-6 col-lg-4'>
                    <div class="card mb-2">
                        <div class="card-body">
                            <form class="text-dark">
                                <img id="albumUpload__cover" class="img-thumbnail bb-0 r-bl-0 r-br-0" src="data:image/jpg;base64,${album.cover.toString('base64')}" alt="${album.name}-cover">
                                <div class="custom-file mb-3">
                                    <input type="file" class="custom-file-input" id="albumCoverSelector" accept='image/*'>
                                    <label class="custom-file-label r-tl-0 r-tr-0" for="albumCoverSelector">Choose album cover</label>
                                </div>
                                <div class="form-group">
                                    <label for="albumName">Name: </label>
                                    <input type="text" class="form-control" id="albumName" value="${album.name}" required>
                                </div>
                                <div class="form-group">
                                    <label for="albumGenre">Genre: </label>
                                    <input type="text" class="form-control" id="albumGenre" value="${album.genre}" required>
                                </div>
                                <div class="form-group">
                                    <label for="albumYear">Released In: </label>
                                    <input type="text" class="form-control" id="albumYear" value="${album.year}" required>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-6 col-lg-4 mt-2 mt-md-0">
                    <div class="card">
                        <div class="card-body">
                            <form class="text-dark">
                                ${Views.renderUploadTrackView(album.tracks)}
                                <input class="btn btn-primary btn-sm btn-block mt-3 form__upload-final--btn bg-primary" type="button" value="Upload"> 
                                <input class="btn btn-primary btn-sm btn-block mt-2 form__upload-cancel--btn bg-primary" type="button" value="Cancel">
                            </form>
                        </div>
                    </div>
                </div>`;
    }
    
    static resetActiveTrackView() {
        return Array.from(document.querySelectorAll('.trackItem')).map(el => {
            el.classList.remove('active')
            return el;
        })
    }

    static renderActiveTrackView() {
        if(this.activeTrack && this.activePage === Utils.getPageId.tracks) {
            this.resetActiveTrackView().forEach(el => {
                if(el.dataset.uid === this.activeTrack) {
                    el.classList.add('active');
                }
            });
        }
    }

    

}