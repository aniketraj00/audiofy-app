export class Utils {

    static formatTrackTitleString = title => {
        let fTitle = title.split('Audiofy')[0];
        if(fTitle.length > 15) {
            fTitle = fTitle.substr(0, 15);
            if(fTitle.charAt(fTitle.length - 1) === '-') fTitle = fTitle.substr(0, fTitle.length - 1);
            fTitle = fTitle + '...';
        }
        return fTitle;
    }

    static formatArtistString = str => {
        if(str.length > 20) {
            str = str.substr(0, 20);
            if(str.charAt(str.length - 1) === '-') str = str.substr(0, str.length - 1);
            str = str + '...';
        }
        return str;
    }

    static parseDuration = dur => {
        const durationInt = Math.floor(dur);
        let minutes = Math.floor (durationInt / 60);
        let seconds = durationInt % 60;
        if(`${minutes}`.length === 1) minutes = `0${minutes}`;
        if(`${seconds}`.length === 1) seconds = `0${seconds}`;
        return `${minutes}:${seconds}`;
    }

    static dispatchTimer = (fn, time) => {
        return setTimeout(fn, time);
    }

    static formatAlbumTitle = albumTitle => {
        const title = albumTitle.split('-')[0];
        if(title.length > 15) return `${title.substr(0, 15)}...`
        return title;
    }

    static getPaginationRange = page => {
        let min = page;
        let max = page;
        while(min % 5 !== 1) min--;
        while(max % 5 !== 0) max++;
        return [min, max];
    }

    static calcPercent = (val, total) => Math.floor((val / total) * 100);

    static getPageId = {
        index: 0,
        albums: 1,
        tracks: 2,
        user_account: 3,
        search: 4
    }
}

