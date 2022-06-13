import axios from "axios";

export class API {

    static albumEndpoint = '/api/v1/albums';
    static trackEndpoint = '/api/v1/tracks';
    static userEndpoint = '/api/v1/users';
    static adminEndpoint = '/admin';

    static requestAPI = (url, method, data) => {
        return axios({
            url,
            method,
            data
        });
    }

    static getAlbums = async page => await API.requestAPI(`${API.albumEndpoint}?page=${page}`, 'GET', null);

    static getAlbumSearchResult = async (query, page) => await API.requestAPI(`${API.albumEndpoint}/search?${query}&page=${page}`, 'GET', null);
    

    static getAlbum = async id =>  await API.requestAPI(`${API.albumEndpoint}/${id}`, 'GET', null);
    
    static getForgotPassword = async email => await API.requestAPI(`${API.userEndpoint}/forgotPassword`, 'POST', { email });
    
    static getResetPassword = async (resetToken, data) => {
        return await API.requestAPI(`${API.userEndpoint}/resetPassword/${resetToken}`, 'POST', {
            password: data[0],
            passwordConfirm: data[1]
        });
    }

    static getLogin = async (email, password) => await API.requestAPI(`${API.userEndpoint}/login`, 'POST', { email, password });
    
    static getLogout = async () => await API.requestAPI(`${API.userEndpoint}/logout`, 'GET', null);  
    
    static getSignupVerify = async email => await API.requestAPI(`${API.userEndpoint}/signup`, 'POST', { email });

    static getSignup = async (tempUserId, verificationToken, data) => {
        API.requestAPI(`${API.userEndpoint}/signup/${tempUserId}/${verificationToken}`, 'POST', {
            name: data[0],
            password: data[1],
            passwordConfirm: data[2]
        });
    }

    static getSignAndUpload = async (file, fileName, fileType) => {
        try {
            const sign = await API.requestAPI(`${API.adminEndpoint}/auth/sign-s3`, 'POST', {
                fileName,
                fileType
            });
            const signedResponse = JSON.parse(sign.data.signedResponse);
            await API.requestAPI(signedResponse.signedUrl, 'PUT', file);
            return signedResponse.fileUrl;

        } catch (err) {
            throw new Error('Failed to upload the file!');
        }
    }

    static getUploadTrack = async (tracks) => await API.requestAPI(API.trackEndpoint, 'POST', tracks)

    static getUploadAlbum = async albumDoc => {
        try {
            albumDoc.tracks = (await API.getUploadTrack(albumDoc.tracks)).data.data.doc.map(el => el._id);
            return await API.requestAPI(API.albumEndpoint, 'POST', albumDoc);      
        } catch (err) {
            throw new Error('Failed to update the database!');
        }
    }

}