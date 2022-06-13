export class Loader {
    static showLoader = msg => {
        $('#loader-text').text(msg)
        $('#loader').modal('show');
    }

    static hideLoader = () => {
        $('#loader').modal('hide');
    }
}

