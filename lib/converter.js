const fsSync = require('fs');
const fs = fsSync.promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const crypto = require('crypto');

ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Convert audio buffer to MP3
 * @param {Buffer} buffer 
 * @param {string} ext 
 * @returns {Promise<Buffer>}
 */
async function toAudio(buffer, ext) {
    const tmpDir = path.join(__dirname, '../temp');
    if (!fsSync.existsSync(tmpDir)) await fs.mkdir(tmpDir, { recursive: true });
    
    const id = crypto.randomBytes(8).toString('hex');
    const inputPath = path.join(tmpDir, `${id}_in.${ext}`);
    const outputPath = path.join(tmpDir, `${id}_out.mp3`);
    
    try {
        await fs.writeFile(inputPath, buffer);
        
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });
        
        const outputBuffer = await fs.readFile(outputPath);
        return outputBuffer;
    } finally {
        // Cleanup
        try {
            if (fsSync.existsSync(inputPath)) await fs.unlink(inputPath);
            if (fsSync.existsSync(outputPath)) await fs.unlink(outputPath);
        } catch (e) {
            console.error('Cleanup error:', e);
        }
    }
}

async function tagMp3(buffer, metadata = {}) {
    const tmpDir = path.join(__dirname, '../temp');
    if (!fsSync.existsSync(tmpDir)) await fs.mkdir(tmpDir, { recursive: true });
    const id = crypto.randomBytes(8).toString('hex');
    const inputPath = path.join(tmpDir, `${id}_tag_in.mp3`);
    const outputPath = path.join(tmpDir, `${id}_tag_out.mp3`);
    const clean = value => String(value || '').replace(/[\r\n]/g, ' ').slice(0, 200);
    try {
        await fs.writeFile(inputPath, buffer);
        await new Promise((resolve, reject) => {
            const command = ffmpeg(inputPath)
                .outputOptions('-c:a copy')
                .outputOptions('-id3v2_version 3')
                .outputOptions('-metadata', `title=${clean(metadata.title)}`)
                .outputOptions('-metadata', `artist=${clean(metadata.artist)}`)
                .outputOptions('-metadata', `album=${clean(metadata.album)}`)
                .toFormat('mp3')
                .on('end', resolve)
                .on('error', reject);
            command.save(outputPath);
        });
        return await fs.readFile(outputPath);
    } finally {
        try {
            if (fsSync.existsSync(inputPath)) await fs.unlink(inputPath);
            if (fsSync.existsSync(outputPath)) await fs.unlink(outputPath);
        } catch (error) {
            console.error('Metadata cleanup error:', error);
        }
    }
}

module.exports = {
    toAudio,
    tagMp3
};
