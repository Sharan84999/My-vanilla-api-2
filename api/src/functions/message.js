const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

app.http('message', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

            const containerName = 'containerforswa';
            const blobName = 'message.txt';

            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobClient = containerClient.getBlobClient(blobName);

            let counter = 0;
            try {
                const downloadBlockBlobResponse = await blobClient.download(0);
                const downloaded = await streamToText(downloadBlockBlobResponse.readableStreamBody);
                counter = parseInt(downloaded, 10) || 0;

            } catch(BlobReadError) {
                context.log('Blob not found, initializing counter to 0.');
                counnter = 0;
            }
            counter += 1;
            await blobClient.upload(counter.toString(), counter.toString().length, {overwrite: true});

            return {body: `This page has been viewed ${counter} times!`};
        } catch (error) {
            context.log.error('Error:', error.message);
            return {status: 500, body: `Error: ${error.message}`};
        }       
    }
});

async function streamToText(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
        data += chunk;
    }
    return
}