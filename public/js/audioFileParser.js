import * as mm from 'music-metadata/lib/core';

export class AudioFileParser {
    
    static parseAudioMeta = async audioFile => await mm.parseBuffer(Buffer.from(await audioFile.arrayBuffer()));
    
    static parseAudioFile = async audioFile => {
        const parsedFileData = {};
        const meta = await AudioFileParser.parseAudioMeta(audioFile);
        parsedFileData.title = (meta.common.title || audioFile.name.split('.mp3')[0]).replace(/(?:downloadming|mahamp3)\.?[\w]*/gmi,'Audiofy');
        parsedFileData.duration =  meta.format.duration;
        parsedFileData.year = meta.common.year || 'NOT AVAILABLE';
        parsedFileData.album = (meta.common.album || 'NOT AVAILABLE').replace(/(?:downloadming|mahamp3)\.?[\w]*/gmi,'');
        parsedFileData.artists = (meta.common.artist || 'NOT AVAILABLE').replace(/(?:downloadming|mahamp3)\.?[\w]*/gmi,'');;
        parsedFileData.genre = meta.common.genre !== undefined ? meta.common.genre.toString().replace(/(?:downloadming|mahamp3)\.?[\w]*/gmi,'Bollywood') : 'Bollywood';
        if(meta.common.picture || meta.common.picture.length > 0) {
            parsedFileData.cover = meta.common.picture[0].data;
        }
        parsedFileData.sourceFile = audioFile;

        return parsedFileData;
    }

    static parseAllAudioFiles = async files => {
        const parsedAudioFilesArr = [];
        for(const file of files) {
            parsedAudioFilesArr.push(await AudioFileParser.parseAudioFile(file));
        }
        return parsedAudioFilesArr;
    }

    static filterFiles = parsedAudioFiles => {
        const filteredFilesArr = [];
        for (let i = 0; i < parsedAudioFiles.length; i++) { 
            if(!parsedAudioFiles[i]) continue;
            const filterObj = {};
            filterObj.name = parsedAudioFiles[i].album;
            filterObj.year = parsedAudioFiles[i].year;
            filterObj.genre = parsedAudioFiles[i].genre;
            filterObj.cover = parsedAudioFiles[i].cover
            filterObj.contributingArtists = [];
            filterObj.tracks = [];
            filterObj.tracks.push({
                title: parsedAudioFiles[i].title,
                duration: parsedAudioFiles[i].duration,
                artists: parsedAudioFiles[i].artists,
                sourceFile: parsedAudioFiles[i].sourceFile
            });
            filterObj.contributingArtists.push(parsedAudioFiles[i].artists);
            
            for (let j = i + 1; j < parsedAudioFiles.length; j++) {
                if(!parsedAudioFiles[j]) continue;
                if((parsedAudioFiles[i].album === parsedAudioFiles[j].album)) {
                    filterObj.tracks.push({
                        title: parsedAudioFiles[j].title,
                        duration: parsedAudioFiles[j].duration,
                        artists: parsedAudioFiles[j].artists,
                        sourceFile: parsedAudioFiles[j].sourceFile
                    });
                    filterObj.contributingArtists.push(parsedAudioFiles[j].artists)
                    parsedAudioFiles[j] = undefined;
                }
            }

            filteredFilesArr.push(filterObj);
        }
        return filteredFilesArr;
    }
}
