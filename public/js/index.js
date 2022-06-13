import '@babel/polyfill';

import { Authenticator } from "./authenticator";
import { Loader } from './loader';
import { Alert } from './alert';
import { Utils } from './Utils';
import { API } from './api';
import { Views } from './views';
import { AudioPlayer } from './player';

const sidebarOpenBtn = document.querySelector('.sidebar-toggler--open');
const sidebarCloseBtn = document.querySelector('.sidebar-toggler--close');
const sidebar = document.querySelector('.sidebar');
const sidebarMenu = document.querySelector('.sidebar-menu');
const sidebarHomeBtn = document.getElementById('sidebar__homeBtn');
const sidebarAlbumsBtn = document.getElementById('sidebar__albumBtn');
const sidebarUserAccountBtn = document.getElementById('sidebar__accountBtn');

const headingViewContainer = document.getElementById('headingContainer');
const searchBarViewContainer = document.getElementById('searchBarViewContainer');
const contentViewContainer = document.getElementById('contentViewContainer');
const paginationViewContainer = document.getElementById('paginationViewContainer');
const playerContainer = document.getElementById('playerContainer');

const passResetVerifyForm = document.querySelector('.form__passReset-verify');
const passResetForm = document.querySelector('.form__passReset');
const loginForm = document.querySelector('.form__login');
const logoutBtns = document.querySelectorAll('.logoutBtn');
const signupVerifyForm = document.querySelector('.form__signup-verify');
const signupForm = document.querySelector('.form__signup');


const changeDocTitle = title => {
    document.title = `Audiofy | Largest Music Library | ${title}`
}

const sidebarOpenEvtCallback = () => {
    sidebar.classList.add('slide-in');
}

const sidebarCloseEvtCallback = () => {
    sidebar.classList.remove('slide-in');
}

const toggleActiveTab = activeTab => {
    contentViewContainer.dataset.active = activeTab;
    Array.from(sidebarMenu.children).forEach(child => child.classList.remove('active'));
    switch(contentViewContainer.dataset.active) {
        case 'Albums': {
            changeDocTitle('Albums');
            sidebarAlbumsBtn.classList.add('active');
            break;
        }
        case 'Home': {
            changeDocTitle('Home')
            sidebarHomeBtn.classList.add('active');
            break;
        }
        case 'MyAccount': {
            changeDocTitle('User Account');
            sidebarUserAccountBtn.classList.add('active');
            break;
        }
    }
}

const clearPageView = () => {
    headingViewContainer.innerHTML = '';
    contentViewContainer.innerHTML = '';
    searchBarViewContainer.innerHTML = '';
    paginationViewContainer.innerHTML = '';
}



if(sidebarOpenBtn) sidebarOpenBtn.addEventListener('click', sidebarOpenEvtCallback);

if(sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', sidebarCloseEvtCallback);

if(sidebarHomeBtn) sidebarHomeBtn.addEventListener('click', () => { 
    loadIndexView();
});

if(sidebarAlbumsBtn) sidebarAlbumsBtn.addEventListener('click', () => { 
    loadAlbumView(1);
});

if(sidebarUserAccountBtn) sidebarUserAccountBtn.addEventListener('click', () => { 
    loadUserAccountView(); 
});



//Album and player related event listeners
const getPaginationEvtCallback = (curPage, totalPageCount, targetViewLoaderCallback) => {
    return event => {
        //Get the target page no.
        let pageId;
        if(event.target.tagName === 'LI') pageId = event.target.id;
        else if(event.target.tagName === 'A') pageId = event.target.parentElement.id;
        else return;

        //Load the target page view
        let tPage;
        if(pageId === 'prev') {
            if(curPage === 1) return;
            tPage = curPage - 1;
        }else if(pageId === 'next') {
            if(curPage === totalPageCount) return;
            tPage = curPage + 1;
        }else {
            tPage = Number.parseInt(pageId);
        }

        targetViewLoaderCallback(tPage);

    }
}

const getAlbumSearchEvtCallback = () => {
    return () => {
        
        //Build the query using the search string and search options.
        const searchOptions = {
            0: 'name', 
            1: 'artist', 
            2: 'year'
        };
        const searchVal = document.getElementById('main__search-input').value;
        const searchBy = searchOptions[document.getElementById('main__search-select').value];
        const query = `${searchBy}=${searchVal}`;
        
        //Return if search field is empty
        if(searchVal === '') return;

        //Save the query.
        document.body.dataset.qstr = query;

        //Load the search view.
        loadSearchView(1, query);
    }
}

const loadSearchBarView = () => {
    //Geneate search view.
    const searchView = Views.renderSearchBarView();

    //Insert the search view into its container.
    searchBarViewContainer.innerHTML = searchView;

    //Attach event listener to the search button.
    document.querySelector('.main__search-btn').addEventListener('click', getAlbumSearchEvtCallback());
}

const loadPlayer = targetAlbum => {
    return e => {
        //Save the event target object
        let targetEl = e.target;

        //Prevent loading the player in case the options button on the track DOM element is clicked
        if(targetEl.classList.contains('optionsBtn') || targetEl.parentElement.classList.contains('optionsBtn')) {
            return;
        }

        //Get the target track DOM element using event bubbling
        while(!targetEl.classList.contains('trackItem') && targetEl.tagName !== 'BODY') {
            targetEl = targetEl.parentElement;
        } 

        //Check if the target track DOM element was found after the bubbling phase was finished
        if(!targetEl.classList.contains('trackItem')) return;

        //Build the playlist i.e. array of the track DOM elements
        const playlistDOMArr = Array.from(document.querySelectorAll('.trackItem'));

        //Get the index of the target track DOM element from the tracks DOM array
        const idx = playlistDOMArr.indexOf(targetEl);
        
        //Build the playlist out of the current album
        const playlist = targetAlbum.tracks.map(track => {
            track.cover = targetAlbum.cover;
            track.albumName = targetAlbum.name;
            return track;
        });

        //Render the player view using the target track's metadata
        const playerView = Views.renderPlayerView(
            playlist[idx].cover, 
            playlist[idx].albumName, 
            playlist[idx].title, 
            playlist[idx].artists
        );
        playerContainer.innerHTML = playerView;

        //Initialize the player
        Views.activeTrack = playlist[idx]._id;
        AudioPlayer.initPlayer(playerContainer.firstChild, playlistDOMArr, targetAlbum._id, playlist, idx, true)
    }
}

const loadPaginationView = (curPage, totalPageCount, paginationEvtCallback) => {
    //Generate pagination view.
    const paginationView = Views.renderPaginationView(curPage, totalPageCount);

    //Insert pagination view into its container.
    paginationViewContainer.innerHTML = paginationView;

    //Add Event Listener
    paginationViewContainer.querySelector('.pagination__main').addEventListener('click', paginationEvtCallback);
}

const loadTrackView = (pageNo, parentViewLoaderCallback) => {
    return async e => {
        try {

            //Start by displaying the loading screen.
            Loader.showLoader('Please wait...');
            
            //Get the target album clicked using event bubbling.
            let targetEl = e.target
            while(!targetEl.classList.contains('albumItem') && targetEl.tagName !== 'BODY') targetEl = targetEl.parentElement;
            if(!targetEl.classList.contains('albumItem')) return;

            //Fetch the data.
            const res = await API.getAlbum(targetEl.dataset.uid);

            //Change page title
            changeDocTitle(res.data.data.doc.name);

            //Add 1 sec latency in case the loading of data finishes before the loader animation.
            Utils.dispatchTimer(() => {
                
                //Hide the loading screen.
                Loader.hideLoader();

                //Clear the previous page view.
                clearPageView();

                //Set the active page id.
                Views.activePage = Utils.getPageId.tracks;

                //Render track list view.
                contentViewContainer.innerHTML = Views.renderTrackListView(res.data.data.doc);

                //Render active track view.
                Views.renderActiveTrackView();

                //Add back button event listener
                contentViewContainer.querySelector('#tracksViewBackBtn').addEventListener('click', () => parentViewLoaderCallback(pageNo));

                //Add event listener to each of the track element.
                contentViewContainer.querySelectorAll('.trackItem').forEach(el => el.addEventListener('click', loadPlayer(res.data.data.doc)));
                

            }, 1000)

        } catch (err) {
            //Hide the loading screen.
            Loader.hideLoader();

            //Show the error message.
            Alert.showAlert('error', 'Failed to load the page! Please try again. 😨😨');

            console.log(err);
        }
    }
}

const loadAlbumView = async (pageNo = 1) => {
    try {

        //Close the sidebar in case it is open
        sidebarCloseEvtCallback();

        //Mark the albums tab as active.
        toggleActiveTab('Albums');

        //Clear previous page view.
        clearPageView();

        //Set the active page id.
        Views.activePage = Utils.getPageId.albums;

        //Start by displaying the loading screen.
        Loader.showLoader('Please wait...');

        //Fetch the data.
        const res = await API.getAlbums(pageNo);

        //Add 1 sec latency in case the loading of data finishes before the loader animation.
        Utils.dispatchTimer(() => {

            //Hide the loading screen.
            Loader.hideLoader();

            //Render heading view only if albums exist.
            if(res.data.data.docs.length > 0) headingViewContainer.innerHTML = Views.renderHeadingView('Albums');
            
            //Render albums view.
            contentViewContainer.innerHTML = Views.renderAlbumView(res.data.data.docs);

            //Add the event listener to the album cards.
            contentViewContainer.querySelectorAll('.albumItem').forEach(el => el.addEventListener('click', loadTrackView(pageNo, loadAlbumView)));

            //Render other required views
            const totalPageCount = Math.ceil(res.data.total / 12)
            if(pageNo <= totalPageCount) {
                loadPaginationView(pageNo, totalPageCount, getPaginationEvtCallback(pageNo, totalPageCount, loadAlbumView));
                loadSearchBarView();
            }       
            
        }, 1000)

    } catch (err) {
        //Show error after adding 1 sec latency to finish the loader animation.
        Utils.dispatchTimer(() => {
            //Hide the loading screen.
            Loader.hideLoader();

            //Show the error message.
            Alert.showAlert('error', 'Failed to load the page! Please try again. 😨😨');

            console.log(err);
        }, 1000)
    }
}

const loadSearchView = async (pageNo = 1, query) => {

    try {
        //Mark the albums tab as active.
        toggleActiveTab('Albums');

        //Clear previous page view.
        clearPageView();

        //Set the active page id.
        Views.activePage = Utils.getPageId.search;

        //Start by displaying the loading screen.
        Loader.showLoader('Please wait...');

        //Start search request.
        if(!query) query = document.body.dataset.qstr;
        const res = await API.getAlbumSearchResult(query, pageNo);

        //Chnage page title
        changeDocTitle('Search Result');

        //Add 1 sec latency in case the loading of data finishes before the loader animation.
        Utils.dispatchTimer(() => {

            //Hide the loading screen.
            Loader.hideLoader();

            //Render heading view only if albums exist.
            if(res.data.data.albums.length > 0) headingViewContainer.innerHTML = Views.renderHeadingView(`Results (${res.data.total}) :)`);
        
            //Render the searched albums view.
            contentViewContainer.innerHTML = Views.renderAlbumSearchView(res.data.data.albums);

            //Add event listener to the album cards.
            contentViewContainer.querySelectorAll('.albumItem').forEach(el => el.addEventListener('click', loadTrackView(pageNo, loadSearchView)));
            
            //Add event listener to the back button.
            contentViewContainer.querySelector('#searchViewBackBtn').addEventListener('click', () => { loadAlbumView() });

            //Render pagination.
            const totalPageCount = Math.ceil(res.data.total / 12)
            if(pageNo <= totalPageCount) loadPaginationView(pageNo, totalPageCount, getPaginationEvtCallback(pageNo, totalPageCount, loadSearchView));   

        }, 1000)

    } catch (err) {
        //Show error after adding 1 sec latency to finish the loader animation.
        Utils.dispatchTimer(() => {
            //Hide the loading screen.
            Loader.hideLoader();

            //Show the error message.
            Alert.showAlert('error', 'Failed to load the page! Please try again. 😨😨');

            console.log(err);
        }, 1000)
    }

}



//TODO: Implement index page view
const loadIndexView = () => {

    //Close the sidebar manually.
    sidebarCloseEvtCallback();

    //Mark the active tab or page.
    toggleActiveTab('Home');

    //Clear the previous tab or page view.
    clearPageView();

    //Set active page id.
    Views.activePage = Utils.getPageId.index
}

//TODO: Implement user account page view
const loadUserAccountView = () => {

    //Close the sidebar manually.
    sidebarCloseEvtCallback();

    //Mark the active tab or page.
    toggleActiveTab('MyAccount');

    //Clear the previous tab or page view.
    clearPageView();

    //Set Active Page Id
    Views.activePage = Utils.getPageId.user_account
}

//Load the initial app view (TODO: later load index page here)
document.addEventListener('DOMContentLoaded', async () => {
    if(!contentViewContainer) return;
    loadAlbumView();
});




//Event Listeners for authentication related pages.
if(passResetVerifyForm) {
    passResetVerifyForm.addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('emailId');
        if(email.value) {
            await Authenticator.forgotPassword(email.value);
            email.value = '';
        }
    });
}

if(passResetForm) {
    passResetForm.addEventListener('submit', async e => {
        e.preventDefault();
        const pass = document.getElementById('pass');
        const cPass = document.getElementById('cpass');
        if(e.target.dataset.rtkn && pass.value && cPass.value) {
            await Authenticator.resetPassword(e.target.dataset.rtkn, pass.value, cPass.value);
            pass.value = '';
            cPass.value = '';
        }
    });
}

if(loginForm) {  
    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('emailId');
        const pass = document.getElementById('pass');
        if(email.value && pass.value) {
            await Authenticator.login(email.value, pass.value);
            email.value = '';
            pass.value = '';
        }
    });
}

if(logoutBtns) {
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async e => {
            e.preventDefault();
            await Authenticator.logout();
        });
    });
}


if(signupVerifyForm) {
    signupVerifyForm.addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('emailId');
        if(email.value) {
            await Authenticator.signupVerify(email.value);
            email.value = '';
        }
    });
}

if(signupForm) {
    signupForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('name');
        const pass = document.getElementById('pass');
        const cPass = document.getElementById('cpass');
        if(name.value && pass.value && cPass.value) {
            await Authenticator.signup(e.target.dataset.uid, e.target.dataset.vtkn, name.value, pass.value, cPass.value);
            name.value = '';
            pass.value = '';
            cPass.value = '';
        }   
    });
}
