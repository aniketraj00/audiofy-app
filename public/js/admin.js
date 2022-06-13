import { API } from './api';
import { Utils } from './utils';
import { Loader } from './loader';
import { Alert } from './alert';
import { ProgressBar } from './progressBar';
import { AudioFileParser } from './audioFileParser';
import { Views } from './views';
import { Strings } from './strings'; 

const adminSideBarToggler = document.querySelector('.sidebar__main--toggler > i');
const adminSideBarPanel = document.querySelector('.sidebar__main');
const adminSideBarTextPanel = document.querySelector('.sidebar__main--text');
const adminMainContentBody = document.querySelector('.content__main')
const formUploadBtn = document.querySelector('.form__upload-btn');
const fileSelector = document.querySelector('#fileSelector');
const albumInfoView = document.querySelector('.album__info');
const selectOneInput = document.querySelector('#fileSelectOne');
const selectMultipleInput = document.querySelector('#fileSelectMultiple');


const cancelUpload = () => location.assign('/admin');

const singleUploadErrorHandler = err => {
    albumInfoView.innerHTML = '';
    fileSelector.value = '';
    Loader.hideLoader();
    Alert.showAlert('error', err.message);
    console.log(err);
    return;
}

const multipleUploadErrorHandler = err => {
    fileSelector.value = '';
    hideProgress();
    showAlert('error', err.message);
    console.log(err);
    return;
}


const changeAlbumCoverView = async e => {
    e.preventDefault();
    if (!e.target.files || e.target.files.length === 0) return;
    const b64Str = Buffer.from(await e.target.files[0].arrayBuffer()).toString('base64');
    const src = `data:image/jpg;base64,${b64Str}`;
    document.querySelector('#albumUpload__cover').setAttribute('src', src);
}

const validateAllTextInputs = () => {
    const results = Array.from(document.querySelectorAll(`input[type='text']`)).map(el => el.value === '');
    for (const result of results) {
        if (result) return false;
    }
    
    return true;
}

const uploadSingleAlbum = album => {
    return async e => {
        //Check if all the required fields have been filled or kept default. Show error and return if left empty
        if (!validateAllTextInputs()) {
            Alert.showAlert('error', 'All fields are mandatory! You can enter your own values or leave the fields with its own default value.')
            return;
        }

        //Get the input value from the album info form (in case user changed any meta value)
        //1)Get the album data like name, year, genre, cover etc
        const albumName = document.querySelector('#albumName').value;
        const albumGenre = document.querySelector('#albumGenre').value;
        const albumYear = document.querySelector('#albumYear').value;

        //2)Get the album cover image (if the user provided) or use the default one from the album object passed into this callback
        const coverImageSelector = document.querySelector('#albumCoverSelector');
        if (coverImageSelector.files.length !== 0) {
            album.cover = coverImageSelector.files[0];
        }

        //3)Get the track info like title and artists data
        const titlesArr = Array.from(document.querySelectorAll('.trackTitleInput')).map(el => el.value);
        const artistsArr = Array.from(document.querySelectorAll('.trackArtistsInput')).map(el => el.value);

        //Update the album model (in case user changed any meta data)
        album.name = albumName;
        album.year = albumYear;
        album.genre = albumGenre;

        album.tracks.forEach((track, idx) => {
            track.title = titlesArr[idx];
            track.artists = artistsArr[idx];
        });

        //Upload the cover image and save its access url to album model
        try {
            Loader.showLoader('Uploading album cover...');
            album.cover = await API.getSignAndUpload(album.cover, `${album.name}.jpg`, 'image/jpeg');
        } catch (err) {
            singleUploadErrorHandler(err);
        }

        //Upload all the tracks and save their access urls to the album model;
        const files = fileSelector.files
        for (let i = 0; i < files.length; i++) {
            try {
                Loader.showLoader(`Uploading tracks (${i + 1}/${files.length})...`);
                album.tracks[i].sourceFile = await API.getSignAndUpload(files[i], files[i].name, files[i].type)

            } catch (err) {
                singleUploadErrorHandler(err);
            }
        }

        //Upload the tracks and save their ids in album model and then upload it to the database
        Loader.showLoader('Updating the database...');
        try {
            createAlbumReq = await API.getUploadAlbum(album);
            if (createAlbumReq.data.status === 'success') {
                albumInfoView.innerHTML = '';
                fileSelector.value = '';
                Loader.hideLoader();
                Alert.showAlert('success', 'Album uploaded successfully!');
            }
        } catch (err) {
            singleUploadErrorHandler(err);
        }
    }
}

const uploadMultipleAlbum = async (albumsArr, files) => {
    let count = 0;
    let totalSteps = (files.length + (2 * albumsArr.length));
    ProgressBar.showProgress('Uploading albums...', Utils.calcPercent(count, totalSteps));
    for (let album of albumsArr) {

        //Upload the cover if it exists
        try {
            album.cover = await API.getSignAndUpload(album.cover, `${album.name}.jpg`, 'image/jpeg');
            ProgressBar.showProgress('Uploading albums...', Utils.calcPercent(++count, totalSteps));
        } catch (err) {
            multipleUploadErrorHandler(err);
        }

        //Upload the tracks
        for (let track of album.tracks) {
            try {
                track.sourceFile = await API.getSignAndUpload(
                    track.sourceFile,
                    track.sourceFile.name,
                    track.sourceFile.type
                );
                ProgressBar.showProgress('Uploading albums...', Utils.calcPercent(++count, totalSteps));
            } catch (err) {
                multipleUploadErrorHandler(err);
            }
        }

        //Upload the album doc to the database
        try {
            createAlbumReq = await API.getUploadAlbum(album);
            if (createAlbumReq.data.status === 'success') {
                ProgressBar.showProgress('Uploading albums...', Utils.calcPercent(++count, totalSteps));
            }
        } catch (err) {
            multipleUploadErrorHandler(err);
        }

        //Show message and reset the view
        Utils.dispatchTimer(() => {
            fileSelector.value = '';
            ProgressBar.hideProgress();
            Alert.showAlert('success', 'All albums uploaded successfully!')
        }, 2000);
    }
}


//Admin album upload page related event listeners
if (selectMultipleInput) {
    selectMultipleInput.addEventListener('change', e => {
        albumInfoView.innerHTML = '';
        fileSelector.value = '';
        document.querySelector('.upload__album-h1').textContent = 'Multiple Upload';
        document.querySelector('.upload__album-p').textContent = Strings.multipleSelectInputStr;
        formUploadBtn.value = 'Upload';
    });
}

if (selectOneInput) {
    selectOneInput.addEventListener('change', e => {
        albumInfoView.innerHTML = '';
        fileSelector.value = '';
        document.querySelector('.upload__album-h1').textContent = 'Single Upload';
        document.querySelector('.upload__album-p').textContent = Strings.singleSelectInputStr;
        formUploadBtn.value = 'Next';
    });
}

if(fileSelector) {
    fileSelector.addEventListener('change', e => {
        if(!e.target.files || e.target.files.length === 0) {
            albumInfoView.innerHTML = '';
            fileSelector.value = '';
        }
    })
}

if (formUploadBtn) {
    formUploadBtn.addEventListener('click', async () => {
        //If no file is selected then display error alert and return 
        if (!fileSelector.files || fileSelector.files.length === 0) {
            Alert.showAlert('error', 'First select the files to be processed!');
            return;
        }

        //Process all the selected files by parsing them into album docs.
        Loader.showLoader('Processing files...')
        const files = fileSelector.files;
        let albumsArr;
        try {
            albumsArr = AudioFileParser.filterFiles(await AudioFileParser.parseAllAudioFiles(files));
        } catch (err) {
            return Utils.dispatchTimer(() => {
                fileSelector.value = '';
                Loader.hideLoader();
                Alert.showAlert('error', err.message);
                console.log(err);
            }, 2000);
        }

        //Check if it is single album upload request or multiple.
        if (selectOneInput.checked) {
            Utils.dispatchTimer(() => {
                //Hide the loader
                Loader.hideLoader();

                //Since we are doing single upload select the album at index 0.
                const album = albumsArr[0];

                //Generate the view along with the data parsed above so that user can change any data.         
                albumInfoView.innerHTML = '';
                albumInfoView.insertAdjacentHTML('beforeend', Views.renderUploadAlbumView(album));

                //Add the required event listener to the elements rendered above (if any).
                document.querySelector('#albumCoverSelector').addEventListener('change', changeAlbumCoverView);
                document.querySelector('.form__upload-cancel--btn').addEventListener('click', cancelUpload);
                document.querySelector('.form__upload-final--btn').addEventListener('click', uploadSingleAlbum(album));
            }, 2000);
        } else {
            //Since we are doing multiple uploads then upload albums one by one
            Utils.dispatchTimer(() => {
                Loader.hideLoader();
                uploadMultipleAlbum(albumsArr, files);
            }, 2000);
        }
    });
}


//Admin page sidebar related event listeners
if (adminSideBarToggler) {
    adminSideBarToggler.addEventListener('click', e => {
        e.preventDefault();
        adminSideBarPanel.classList.toggle('sidebar__main--slide');
        adminSideBarTextPanel.classList.toggle('sidebar__main--text-slide');
        e.target.parentElement.classList.toggle('sidebar__main--toggler-slide');
        adminMainContentBody.classList.toggle('content__main--slide');
        if (e.target.classList.contains('fa-bars')) {
            e.target.classList.remove('fa-bars');
            e.target.classList.add('fa-times');
        } else {
            e.target.classList.remove('fa-times');
            e.target.classList.add('fa-bars');
        }
    });
}
