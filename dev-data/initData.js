require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const mm = require('music-metadata');
const Track = require('../models/Track');
const Album = require('../models/Album');


const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASS);

const parseAudioFile = async audioFile => {
    const parsedFileData = {};
    const meta = await mm.parseFile(`${__dirname}/../public/files/${audioFile.name}`);
    parsedFileData.title = meta.common.title || audioFile.name.split('.mp3')[0];
    parsedFileData.duration =  meta.format.duration;
    parsedFileData.sourceFile = audioFile.name;
    parsedFileData.year = meta.common.year || 'NOT AVAILABLE';
    parsedFileData.album = meta.common.album || 'NOT AVAILABLE';
    parsedFileData.artists = meta.common.artists || ['NOT AVAILABLE'];
    parsedFileData.genre = meta.common.genre || ['NOT AVAILABLE'];
    if(meta.common.picture) {
        if(meta.common.picture[0] && meta.common.picture[0].data) {
            parsedFileData.cover = meta.common.picture[0].data;
        }
    }

    return parsedFileData;
}

const readAllFilesFromDir = dirPath => fs.readdirSync(dirPath, { withFileTypes: true });

const parseAllAudioFiles = async files => {
    const parsedAudioFilesArr = [];
    for(const file of files) {
        if(file.isFile()) {
            parsedAudioFilesArr.push(await parseAudioFile(file));
        }
    }
    return parsedAudioFilesArr;
}

const filterFiles = parsedAudioFiles => {
    
    const filteredFilesArr = [];
    for (let i = 0; i < parsedAudioFiles.length; i++) { 
        if(!parsedAudioFiles[i]) continue;
        const filterObj = {};
        filterObj.name = parsedAudioFiles[i].album;
        filterObj.year = parsedAudioFiles[i].year;
        filterObj.genre = parsedAudioFiles[i].genre;
        filterObj.cover = parsedAudioFiles[i].cover
        filterObj.tracks = [];
        filterObj.tracks.push({
            title: parsedAudioFiles[i].title,
            duration: parsedAudioFiles[i].duration,
            artists: parsedAudioFiles[i].artists,
            sourceFile: parsedAudioFiles[i].sourceFile
        });
        
        for (let j = i + 1; j < parsedAudioFiles.length; j++) {
            if(!parsedAudioFiles[j]) continue;
            if((parsedAudioFiles[i].album === parsedAudioFiles[j].album)) {
                filterObj.tracks.push({
                    title: parsedAudioFiles[j].title,
                    duration: parsedAudioFiles[j].duration,
                    artists: parsedAudioFiles[j].artists,
                    sourceFile: parsedAudioFiles[j].sourceFile
                });
                parsedAudioFiles[j] = undefined;
            }
        }

        filteredFilesArr.push(filterObj);
    }
    return filteredFilesArr;
}

const loadData = async () => {
    try {
        console.log('Uploading data to the server...');
        
        const albums = filterFiles(await parseAllAudioFiles(readAllFilesFromDir(`${__dirname}/../public/files`)));
        for(const album of albums) {
            const contributingArtists = [];
            album.tracks.forEach(track => {
                track.artists.forEach(artist => {
                    contributingArtists.push(artist);
                });
            });
            const tracks = (await Track.create(album.tracks)).map(el => el._id);
            album.tracks = tracks;
            album.contributingArtists = contributingArtists;
            let coverFileName = '';
            if(album.cover) {
                coverFileName = `${album.name}.png`;
                fs.writeFileSync(`${__dirname}/../public/img/${coverFileName}`, album.cover);
                album.cover = coverFileName;
            }
            await Album.create(album);
        }

        console.log('Uploaded successfully!');

    } catch (err) {
        console.log(err);
    }

    process.exit();
}

const deleteData = async () => {
    console.log('Deleting data from the database...')
    try {
        await Track.deleteMany();
        await Album.deleteMany();
        console.log('Data deleted successfully!')

    } catch (err) {
        console.log(err.message);
    }

    process.exit();
}


console.log('Connecting to the database...');

(async () => {
    try {
        await mongoose.connect(DB, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        console.log('Connected successfully!');

        if(process.argv[2] === '--load') loadData();
        else if(process.argv[2] === '--delete') deleteData();


    } catch(err) {
        console.log(err.message);
    }
 
})();