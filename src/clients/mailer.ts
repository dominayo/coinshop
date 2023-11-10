import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';
// import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

import { logger } from '../utils/logger';

export class EmailClient {
	async send(message: string, email: string, title: string): Promise<void> {
		try {

			// AWS.config.update({
			// 	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			// 	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			// 	region: process.env.AWS_REGION
			// });
			const sendGridSMTPServer = 'smtp.sendgrid.net';
			const userName = 'apikey';
			const password = process.env.SENDGRID_API_KEY;
			const port = 587;

			const options = {
				auth: {
						api_key: process.env.SENDGRID_API_KEY
				}
			}

			const mailer = nodemailer.createTransport(sgTransport(options));

			const emailTemplate = {
				to: [email],
				from: 'noreply.coinshop@gmail.com',
				subject: title,
				text: message,
		};

		mailer.sendMail(emailTemplate, function(err, res) {
			if (err) { 
					console.log(err) 
			}
			console.log(res);
		});


			// const transporter = nodemailer.createTransport({
			// 	SES: new AWS.SES({
			// 		apiVersion: '2010-12-01'
			// 	})
			// });

			// transporter.sendMail({
			// 	from: process.env.AWS_EMAIL_REGION,
			// 	to: email,
			// 	subject: title,
			// 	text: message,
			// 	ses: {
			// 		Source: process.env.AWS_EMAIL_FROM
			// 	}
			// });

		} catch (e) {
			logger.error(e);
			throw new Error(e);
		}
	}
}
