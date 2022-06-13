import { Alert } from './alert';
import { Loader } from './loader';
import { Utils } from './utils';
import { API } from './api';

export class Authenticator {

    static errorHandler = (errMsg, time) => {
        /**
         * Add setTimeout inside catch block to render the modals properly
         * Without setTimeout, the catch block will be executed instantly.
         * This will not render modals (like alert or loader) properly 
         * and can cause unexpected behaviours.
         */ 
        return Utils.dispatchTimer(() => {
            Loader.hideLoader();
            Alert.showAlert('error', errMsg);
        }, time);
    }

    static forgotPassword = async email => {
        Loader.showLoader('Sending Verification Email...');
        try {
            const res = await API.getForgotPassword(email);
            if(res.data.status === 'success') {
                Utils.dispatchTimer(() => {
                    Loader.hideLoader();
                    Alert.showAlert('success', res.data.message);
                }, 1000);
            }

        } catch (err) {
            Authenticator.errorHandler(err.response.data.message, 1000);
        }
    }

    static resetPassword = async (resetToken, ...data) => {
        Loader.showLoader('Updating Password...')
        try {
            const res = await API.getResetPassword(resetToken, data);
            if(res.data.status === 'success') {
                Utils.dispatchTimer(() => {
                    Loader.hideLoader();
                    Loader.showAlert('success', `${res.data.message} Redirecting...`);
                    Utils.dispatchTimer(() => {
                        location.assign('/login')
                    }, 2000);
                }, 1000);
            }

        } catch (err) {
            Authenticator.errorHandler(err.response.data.message, 1000);
        }
    }

    static login = async (email, password) => {
        try {
            Loader.showLoader('Logging in...');
            const res = await API.getLogin(email, password);

            if(res.data.status === 'success') {
                Utils.dispatchTimer(() => {
                    Loader.hideLoader();
                    Alert.showAlert('success', 'Logged in successfully! Redirecting...');
                    if(res.data.data.user.role === 'admin') {
                        return Utils.dispatchTimer(() => location.assign('/admin'), 2000);
                    }
                    Utils.dispatchTimer(() => location.assign('/'), 2000);   
                }, 1000);
            }

        } catch (err) {
            Authenticator.errorHandler(err.response.data.message, 1000);
        }
    }

    static logout = async () => {
        try {
            Loader.showLoader('Logging out...');
            const res = await API.getLogout();
            if(res.data.status === 'success') {          
                Utils.dispatchTimer(() => location.assign('/login'), 2000);
            }

        } catch (err) {
            Authenticator.errorHandler(err.response.data.message, 1000);
        }
    }

    static signupVerify = async email => {
        try {
            Loader.showLoader('Sending Confirmation Email...');
            const res = await API.getSignupVerify(email);
            if(res.data.status === 'success') {
                Utils.dispatchTimer(() => {
                    Loader.hideLoader(); 
                    Alert.showAlert('success', res.data.message);
                }, 1000);
            }

        } catch (err) {
            Authenticator.errorHandler(err.response.data.message, 1000);
        }
    }

    static signup = async (tempUserId, verificationToken, ...data) => {
        try {
            Loader.showLoader('Signing Up...')
            const res = await API.getSignup(tempUserId, verificationToken, data);
            if(res.data.status === 'success') {
                Utils.dispatchTimer(() => {
                    Loader.hideLoader();
                    Alert.showAlert('success', 'Registered successfully! Redirecting...');
                    Utils.dispatchTimer(() => location.assign('/'), 2000);
                });
            }

        } catch (err) {
            Authenticator.errorHandler(err.response.data.message, 1000);
        }
    }

}