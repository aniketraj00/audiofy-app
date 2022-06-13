export class Alert {

    static showAlert = (type, msg) => {
        Alert.hideAlert();
        document.querySelector('#alert-body').classList.value = document.querySelector('#alert-body').classList.toString().replace(/bg-[\w]+/g, '')
        if (type === 'success') {
            document.querySelector('#alert-body').classList.add('bg-success');
        } else if(type === 'error') {
            document.querySelector('#alert-body').classList.add('bg-danger');
        }
        $('#alert-text').text(msg)
        $('#alert').modal('show');
    }

    static hideAlert = () => {
        $('#alert').modal('hide');
    }
}


