const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const config = {
    host: 'surya.mysql.database.azure.com',
    user: 'uday',
    password: 'Thanmai@2003',
    database: 'uday',
    port: 3306,
    ssl: {
      ca: fs.readFileSync(path.join(__dirname,'DigiCertGlobalRootCA.crt.pem'))
    }
};

const bot = new TelegramBot('6153617635:AAF1Byd7jCBe59HIzlqAvtxesabf6EInibE', {polling: true});

const conn = mysql.createConnection(config);

conn.connect((err) => {
    if (err) {
        console.log('!!! Cannot connect !!! Error:');
        throw err;
    } else {
        console.log('Connection established.');
    }
});

bot.onText(/\/timetable (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const id = match[1];
    const query = 'SELECT * FROM timetable WHERE id = ?';

    conn.query(query, [id], (err, results, fields) => {
        if (err) throw err;
        if (results.length > 0) {
            // Create a new canvas element and set its size
            const canvas = createCanvas(400, 200);
            const ctx = canvas.getContext('2d');

            // Load an image to use as a background
            loadImage('white.jpg').then((image) => {
                // Draw the background image onto the canvas
                ctx.drawImage(image, 0, 0, 400, 200);

                // Set the font and text color for the timetable information
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#000';

                // Draw the timetable information onto the canvas
                ctx.fillText(`Timetable for ID ${id}:`, 10, 30);
                ctx.fillText(`Course Code: ${results[0].course_code}`, 10, 60);
                ctx.fillText(`Start Time: ${results[0].start_time}`, 10, 90);
                ctx.fillText(`End Time: ${results[0].end_time}`, 10, 120);
                ctx.fillText(`Location: ${results[0].location}`, 10, 150);

                // Convert the canvas to a buffer and save it as an image file
                const buffer = canvas.toBuffer('image/png');
                fs.writeFileSync('timetable.png', buffer);

                // Send the image file to the user
                bot.sendPhoto(chatId, 'timetable.png');
            });
        } else {
            bot.sendMessage(chatId, `No timetable found for ID ${id}`);
        }
    });
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Send me /timetable followed by your ID to get your timetable.');
});
