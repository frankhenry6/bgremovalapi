const express = require('express');
const multer = require('multer');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');

const app = express();

// Set the RESOURCE_PATH to the correct location for the resources.json file
process.env.RESOURCE_PATH = path.join(__dirname, 'node_modules/@imgly/background-removal-node/dist/resources.json');

// Use the /tmp directory for uploads in serverless environments like Vercel
const upload = multer({ dest: '/tmp/uploads/' });

async function removeImageBackground(imgPath) {
    try {
        console.time("Background Removal"); // Start timing
        const blob = await removeBackground(imgPath);
        const buffer = Buffer.from(await blob.arrayBuffer());
        console.timeEnd("Background Removal"); // End timing
        return buffer;
    } catch (error) {
        throw new Error('Error removing background: ' + error.message);
    }
}

app.post('/remove-background', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded.');
    }

    try {
        console.log("Image received, starting background removal...");
        const resultBuffer = await removeImageBackground(req.file.path);
        
        // Clean up the uploaded file from the /tmp directory
        fs.unlinkSync(req.file.path);

        // Set the appropriate headers
        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', 'attachment; filename="result.png"');

        // Send the result
        res.send(resultBuffer);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Error processing image: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
