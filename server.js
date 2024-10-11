const express = require('express');
const multer = require('multer');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');

const app = express();

// Use the /tmp directory for uploads in serverless environments
const upload = multer({ dest: '/tmp/uploads/' });

async function removeImageBackground(imgPath) {
    console.log("Starting background removal...");
    const blob = await removeBackground(imgPath);
    const buffer = Buffer.from(await blob.arrayBuffer());
    console.log("Background removal complete.");
    return buffer;
}

app.post('/remove-background', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded.');
    }

    try {
        console.log("Image received, starting processing...");
        const resultBuffer = await removeImageBackground(req.file.path);
        
        // Clean up the uploaded file
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
