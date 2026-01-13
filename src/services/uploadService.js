import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/redoqcms';
// const API_BASE_URL = 'https://showcase.kuickstudio.dinetestapi.com/api/redoqcms';
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadFile = async (file, onProgress) => {
    try {
        const config = {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // 1. Start Upload
        const startResponse = await axios.post(`${API_BASE_URL}/start-upload`, {
            fileName: file.name,
            contentType: file.type,
            size: file.size
        }, config);

        const { uploadId } = startResponse.data;

        if (!uploadId) {
            console.error("No uploadId received", startResponse.data);
            throw new Error("Failed to start upload: No uploadId received");
        }

        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadedParts = [];
        let uploadedBytes = 0;

        for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
            const start = (partNumber - 1) * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            // 2. Get Upload URL for this part
            const urlResponse = await axios.post(`${API_BASE_URL}/get-upload-url`, {
                uploadId,
                partNumber
            }, config);

            const { url } = urlResponse.data;
            if (!url) {
                throw new Error(`Failed to get upload URL for part ${partNumber}`);
            }
            console.log("step 2", urlResponse)

            // 3. Upload the chunk
            const chunkResponse = await axios.put(url, chunk, {
                headers: {
                    'Content-Type': file.type
                },
                onUploadProgress: (progressEvent) => {
                    const chunkProgress = progressEvent.loaded;
                    const currentTotal = uploadedBytes + chunkProgress;
                    const percentCompleted = Math.round((currentTotal * 100) / file.size);
                    onProgress(percentCompleted);
                }
            });

            console.log("step 3", chunkResponse)

            // Capture ETag from headers
            const eTag = chunkResponse.headers['etag'];

            uploadedParts.push({
                partNumber,
                eTag: eTag ? eTag.replace(/"/g, '') : undefined // Remove quotes
            });
            uploadedBytes += chunk.size;
        }

        // 4. Complete Upload
        uploadedParts.sort((a, b) => a.partNumber - b.partNumber);

        const completeResponse = await axios.post(`${API_BASE_URL}/complete-upload`, {
            uploadId,
            parts: uploadedParts
        }, config);
        
        console.log("step 4",completeResponse )
        return completeResponse.data;

    } catch (error) {
        console.error('Upload failed:', error);
        
        throw error;
    }
};
