require('dotenv').config();

const fs = require('fs');

const puppeteer = require('puppeteer');

const Discord = require('discord.js');

if (!process.env.USERNAME || !process.env.PASSWORD || !process.env.WEBHOOK_ID || !process.env.WEBHOOK_TOKEN) return console.error("Les credentials ne sont pas défini (fichier '.env')")

const logCAS = async (browser, page) => {
	await page.goto('https://notes.iut-nantes.univ-nantes.fr/', { waitUntil: 'domcontentloaded' });

	await page.waitForSelector('input[name=username]');

	await page.evaluate(val => document.querySelector('input[name=username]').value = val, process.env.USERNAME);

	await page.waitForSelector('input[name=password]');

	await page.evaluate(val => document.querySelector('input[name=password]').value = val, process.env.PASSWORD);

	await Promise.all([
		page.click('input[type=submit]'),
		page.waitForNavigation({ waitUntil: 'networkidle0' }),
	]);
};


const getNotes = async (browser, page) => {
	const data = await page.evaluate(() => document.getElementById('contenu_deco').outerHTML);
	if (data == '') return;
	const id = process.env.WEBHOOK_ID;
	const token = process.env.WEBHOOK_TOKEN;

	if (fs.existsSync('page.html')) {
		const pred = fs.readFileSync('page.html', 'UTF-8');
		if (pred != data) {
			const webhookClient = new Discord.WebhookClient(id, token);

			const embed = new Discord.MessageEmbed()
				.setTitle('Il y a une nouvelle note bordel (si c\'est vrai on dit tous merci cidi)!')
				.setColor('#029bde')
				.setFooter('Thomas');

			webhookClient.send({
				username: 'Nouvelle Note!',
				avatarURL: 'https://pbs.twimg.com/profile_images/876722846730514432/Y3qGt5xx.jpg',
				content: 'https://tenor.com/view/mambo-oss-oss117-jean-dujardin-hubert-bonisseur-de-la-bath-gif-14643714',
				embeds: [embed],
			});
		}
	}

	fs.writeFileSync('page.html', data);

	// await page.screenshot({ path: 'screenshot.png' });
};


(async () => {
	const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']})
	const page = await browser.newPage();

	await logCAS(browser, page);
	await getNotes(browser, page);

	await browser.close();
})();