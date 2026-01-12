import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Metadata map to store upload info
const uploads = new Map();

app.use(cors({
    origin: true,
    credentials: true,
    exposedHeaders: ['ETag'] // frontend to read ETag
}));

app.use(express.json());

// if uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOADS_DIR);

// 1. Start Upload
app.post('/api/redoqcms/start-upload', (req, res) => {
    const { fileName, contentType, size } = req.body;
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a temp directory for this upload
    const uploadDir = path.join(UPLOADS_DIR, uploadId);
    fs.ensureDirSync(uploadDir);

    uploads.set(uploadId, {
        fileName,
        contentType,
        totalSize: size,
        uploadDir,
        parts: new Set()
    });

    console.log(`[Start] Upload initiated: ${uploadId} for file: ${fileName}`);
    res.json({ uploadId });
});

// 2. Get Upload URL
app.post('/api/redoqcms/get-upload-url', (req, res) => {
    const { uploadId, partNumber } = req.body;

    if (!uploads.has(uploadId)) {
        return res.status(404).json({ error: 'Upload ID not found' });
    }

    // Return a local URL that points to our PUT endpoint
    const url = `http://localhost:${PORT}/upload-part/${uploadId}/${partNumber}`;
    console.log(`[Get URL] Generated URL for part ${partNumber} of ${uploadId}`);

    res.json({ url });
});

// 3. Upload Chunk
app.post('/upload-part/:uploadId/:partNumber', express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
    const { uploadId, partNumber } = req.params;

    if (!uploads.has(uploadId)) {
        return res.status(404).json({ error: 'Upload ID not found' });
    }

    const uploadInfo = uploads.get(uploadId);
    const partPath = path.join(uploadInfo.uploadDir, `part_${partNumber}`);

    try {
        await fs.writeFile(partPath, req.body);

        // Generate a simple ETag (e.g., hash of content or just specific string)
        const eTag = `"${uploadId}_part${partNumber}_etag"`;

        console.log(`[Chunk] Received part ${partNumber} for ${uploadId}. Size: ${req.body.length} bytes`);

        res.setHeader('ETag', eTag);
        res.status(200).send();
    } catch (err) {
        console.error('Error saving part:', err);
        res.status(500).json({ error: 'Failed to save part' });
    }
});

// 4. Complete Upload
app.post('/api/redoqcms/complete-upload', async (req, res) => {
    const { uploadId, parts } = req.body;

    if (!uploads.has(uploadId)) {
        return res.status(404).json({ error: 'Upload ID not found' });
    }

    const uploadInfo = uploads.get(uploadId);
    console.log(`[Complete] Finalizing upload ${uploadId} with ${parts.length} parts`);

    // In a real server, we would verify ETags and concatenate files.
    // Here we will just concatenate them to valid the file content.

    const finalPath = path.join(UPLOADS_DIR, `FINAL_${uploadInfo.fileName}`);
    const writeStream = fs.createWriteStream(finalPath);

    // Sort parts to ensure order
    const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

    try {
        for (const part of sortedParts) {
            const partPath = path.join(uploadInfo.uploadDir, `part_${part.partNumber}`);
            if (fs.existsSync(partPath)) {
                const data = await fs.readFile(partPath);
                writeStream.write(data);
            } else {
                console.warn(`Part ${part.partNumber} missing!`);
            }
        }
        writeStream.end();

        console.log(`[Success] File saved to: ${finalPath}`);

        // Cleanup temp parts
        fs.removeSync(uploadInfo.uploadDir);
        uploads.delete(uploadId);

        res.json({
            success: true,
            message: 'Upload completed successfully',
            location: finalPath
        });

    } catch (err) {
        console.error('Error completing upload:', err);
        res.status(500).json({ error: 'Failed to stitch file' });
    }
});

app.listen(PORT, () => {
    console.log(`Mock Upload Server running at http://localhost:${PORT}`);
    console.log(`Uploads will be saved to ${UPLOADS_DIR}`);
});
