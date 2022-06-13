import { Utils } from "./utils";
import { Views } from "./views";
 
export class AudioPlayer {
    static player = new Audio();
    static isActive;
    static playerView;
    static playerCurTimeView;
    static playerTotalTimeView;
    static controls = {};
    static curPlaylist;
    static curPlaylistId;
    static curPlaylistSize;
    static curTrackIdx;
    static curPlaylistDomArr;
  

    //Helper functions
    static initSeekbar() {
        AudioPlayer.controls.seekbar.min = 0;
        AudioPlayer.controls.seekbar.max = Math.floor(AudioPlayer.curPlaylist[AudioPlayer.curTrackIdx].duration);
        AudioPlayer.controls.seekbar.step = 1;
        AudioPlayer.controls.seekbar.value = 0;
    }

    static resetPlayerTimerView() {
        AudioPlayer.playerCurTimeView.textContent = '00:00';
        AudioPlayer.playerTotalTimeView.textContent = '00:00';
    }

    static initPrevTrackBtn() {
        if(AudioPlayer.curTrackIdx < 1){
            AudioPlayer.controls.prevTrackBtn.parentElement.classList.add('disabled');
            AudioPlayer.controls.prevTrackBtn.parentElement.style = "cursor: default;"
            AudioPlayer.controls.prevTrackBtn.removeEventListener('click', AudioPlayer.prevTrackHandler);
            return;
        }

        if(AudioPlayer.controls.prevTrackBtn.parentElement.classList.contains('disabled')) {
            AudioPlayer.controls.prevTrackBtn.parentElement.classList.remove('disabled'); 
        }
        AudioPlayer.controls.prevTrackBtn.parentElement.style = "cursor: pointer;"
        AudioPlayer.controls.prevTrackBtn.addEventListener('click', AudioPlayer.prevTrackHandler);
    }

    static initNextTrackBtn() {
        if(AudioPlayer.curTrackIdx === AudioPlayer.curPlaylistSize - 1) {
            AudioPlayer.controls.nextTrackBtn.parentElement.classList.add('disabled');
            AudioPlayer.controls.nextTrackBtn.parentElement.style = "cursor: default;"
            AudioPlayer.controls.nextTrackBtn.removeEventListener('click', AudioPlayer.nextTrackHandler);
            return;
        }

        if(AudioPlayer.controls.nextTrackBtn.parentElement.classList.contains('disabled')) {
            AudioPlayer.controls.nextTrackBtn.parentElement.classList.remove('disabled'); 
        }
        AudioPlayer.controls.nextTrackBtn.parentElement.style = "cursor: pointer;"
        AudioPlayer.controls.nextTrackBtn.addEventListener('click', AudioPlayer.nextTrackHandler);
    }

    static setPlayBtnView() {
        if(AudioPlayer.controls.playPauseBtn.classList.contains('fa-pause')) {
            AudioPlayer.controls.playPauseBtn.classList.replace('fa-pause', 'fa-play');
        }
    }

    static setPauseBtnView() {
        if(AudioPlayer.controls.playPauseBtn.classList.contains('fa-play')) {
            AudioPlayer.controls.playPauseBtn.classList.replace('fa-play', 'fa-pause');
        }
    }

    static updatePlayer() {
        
        const trackCoverView = AudioPlayer.playerView.querySelector('#playerView__info-thumbnail-pic');
        const trackTitleView = AudioPlayer.playerView.querySelector('#playerView__infometa-title');
        const trackArtistView = AudioPlayer.playerView.querySelector('#playerView__infometa-artist');
        const imgBackdropView = AudioPlayer.playerView.querySelector('.img-backdrop');

        const curTrack = AudioPlayer.curPlaylist[AudioPlayer.curTrackIdx];
        Views.activeTrack = curTrack._id;

        trackCoverView.src = curTrack.cover;
        trackCoverView.alt = `${curTrack.title}-cover`;
        trackTitleView.textContent = Utils.formatTrackTitleString(curTrack.title);
        trackArtistView.textContent = Utils.formatArtistString(curTrack.artists);
        imgBackdropView.style = 'display: flex;'

        Views.renderActiveTrackView();
        AudioPlayer.initSeekbar();
        AudioPlayer.initPrevTrackBtn();
        AudioPlayer.initNextTrackBtn();
        AudioPlayer.setPlayBtnView();
        AudioPlayer.resetPlayerTimerView();

        AudioPlayer.player.src = curTrack.sourceFile;
    }

    

    //Player event handlers
    static onReadyToPlayHandler() {
        AudioPlayer.playerView.querySelector('.img-backdrop').style = 'display: none;';
        AudioPlayer.playerTotalTimeView.textContent = Utils.parseDuration(AudioPlayer.controls.seekbar.max);
        AudioPlayer.setPauseBtnView();
    }

    static onTimeUpdateHandler() {
        AudioPlayer.playerCurTimeView.textContent = Utils.parseDuration(AudioPlayer.player.currentTime);
        AudioPlayer.controls.seekbar.value = AudioPlayer.player.currentTime;
    }

    static onPlayHandler() {
        AudioPlayer.setPauseBtnView();
    }

    static onPauseHandler() {
        AudioPlayer.setPlayBtnView();
    }


    
    //Player Control Buttons Handler
    static playPauseHandler() {
        if(AudioPlayer.player.paused) {
            AudioPlayer.player.play();
            return;
        }
        AudioPlayer.player.pause();
    }

    static prevTrackHandler() {
        if((AudioPlayer.curTrackIdx - 1) < 0) return;
        AudioPlayer.curTrackIdx--;
        AudioPlayer.updatePlayer();
        
    }

    static nextTrackHandler() {
        if(AudioPlayer.curTrackIdx === (AudioPlayer.curPlaylistSize - 1)) return AudioPlayer.setPlayBtnView();
        if((AudioPlayer.curTrackIdx + 1) >= AudioPlayer.curPlaylistSize) return;
        AudioPlayer.curTrackIdx++;
        AudioPlayer.updatePlayer();
    }

    static onSeekingHandler() {
        AudioPlayer.player.removeEventListener('canplay', AudioPlayer.onReadyToPlayHandler);
        AudioPlayer.player.removeEventListener('timeupdate', AudioPlayer.onTimeUpdateHandler);
        AudioPlayer.player.pause();
        AudioPlayer.setPlayBtnView();
    }

    static async onSeekedHandler(e) {
        AudioPlayer.player.currentTime = e.target.value;
        await AudioPlayer.player.play();
        AudioPlayer.setPauseBtnView();
        AudioPlayer.player.addEventListener('canplay', AudioPlayer.onReadyToPlayHandler);
        AudioPlayer.player.addEventListener('timeupdate', AudioPlayer.onTimeUpdateHandler);
    }

    static initPlayer(playerView, curPlaylistDomArr, curPlaylistId, curPlaylist, curTrackIdx, autoPlay) {
        
        /**
         * Highlight the current playing track
         */
        Views.renderActiveTrackView();


        /**
         * Mark the player as active
         */
        AudioPlayer.isActive = true;


        /**
         * Initialize the player and its components view
         */
        AudioPlayer.playerView = playerView;
        
        AudioPlayer.playerTotalTimeView = AudioPlayer.playerView.querySelector('#totalTimeView');
        AudioPlayer.playerCurTimeView = AudioPlayer.playerView.querySelector('#curTimeView');

        

        /**
         * Initialize current playlist and current track index related variables
         */
        AudioPlayer.curPlaylist = curPlaylist;
        AudioPlayer.curPlaylistId = curPlaylistId;
        AudioPlayer.curPlaylistSize = AudioPlayer.curPlaylist.length;
        AudioPlayer.curTrackIdx = curTrackIdx; 
        AudioPlayer.curPlaylistDomArr = curPlaylistDomArr;


        /**
         * Initialize the player control variables
         */
        AudioPlayer.controls.playPauseBtn = AudioPlayer.playerView.querySelector('#playPauseBtn');
        AudioPlayer.controls.prevTrackBtn = AudioPlayer.playerView.querySelector('#prevTrackBtn');
        AudioPlayer.controls.nextTrackBtn = AudioPlayer.playerView.querySelector('#nextTrackBtn');
        AudioPlayer.controls.seekbar = AudioPlayer.playerView.querySelector('#seekbar');
        AudioPlayer.controls.likeSongBtn = AudioPlayer.playerView.querySelector('#likeSongBtn');
        
        

        /**
         * Setup player control buttons
         */

        //Setup previous and next control handlers
        AudioPlayer.initPrevTrackBtn();
        AudioPlayer.initNextTrackBtn();

        //Setup play and pause control handlers
        AudioPlayer.controls.playPauseBtn.addEventListener('click', AudioPlayer.playPauseHandler);
        
        //Setup seekbar control handler
        AudioPlayer.controls.seekbar.addEventListener('input', AudioPlayer.onSeekingHandler);
        AudioPlayer.controls.seekbar.addEventListener('change', AudioPlayer.onSeekedHandler);
        AudioPlayer.initSeekbar();

        //TODO: Setup like song button handler


        /**
         * Setup player playback related event handlers
         */
        AudioPlayer.player.addEventListener('canplay', AudioPlayer.onReadyToPlayHandler);
        AudioPlayer.player.addEventListener('timeupdate', AudioPlayer.onTimeUpdateHandler);
        AudioPlayer.player.addEventListener('seeking', AudioPlayer.onSeekStartHandler);
        AudioPlayer.player.addEventListener('seeked', AudioPlayer.onSeekEndHandler);
        AudioPlayer.player.addEventListener('ended', AudioPlayer.nextTrackHandler)
        AudioPlayer.player.addEventListener('play', AudioPlayer.onPlayHandler);
        AudioPlayer.player.addEventListener('pause', AudioPlayer.onPauseHandler);


        /**
         * Setup player properties
         */
        AudioPlayer.player.autoplay = autoPlay;


        /**
         * Setup player source
         */
        AudioPlayer.player.src = AudioPlayer.curPlaylist[AudioPlayer.curTrackIdx].sourceFile;

        
    }

}