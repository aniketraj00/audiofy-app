export class ProgressBar {

    static showProgress = (msg, percent) => {
        $('#progress-text').text(msg);
        $('.progress-bar').attr('style', `width: ${percent}%`);
        $('.progress-bar').text(`${percent}%`)
        $('#progress').modal('show');
    }   

    static hideProgress = () => {
        $('#progress').modal('hide');
    }

}

