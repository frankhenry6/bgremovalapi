const express = require('express');
const multer = require('multer');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

async function removeImageBackground(imgPath) {
    try {
        const blob = await removeBackground(imgPath);
        const buffer = Buffer.from(await blob.arrayBuffer());
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