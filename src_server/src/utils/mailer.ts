import nodemailer from 'nodemailer';
import logger from './logger';

class Mailer {
	private transporter: nodemailer.Transporter | null = null;
	private isEnabled = false;

	send(email: string, subject: string, text: string) {
		if (!this.isEnabled || !this.transporter) {
			console.warn('[MAILER] Email sending is disabled. Check MAIL_USER and MAIL_PASS environment variables.');
			return;
		}

		const mail = {
			subject,
			text,
			from: process.env.MAIL_USER,
			to: `${email}`
		};

		this.transporter.sendMail(mail).catch((error) => {
			console.error('[MAILER] Failed to send email:', error.message);
		});
	}

	init() {
		const mailUser = process.env.MAIL_USER;
		const mailPass = process.env.MAIL_PASS;

		if (!mailUser || !mailPass) {
			console.warn('[MAILER] Email service is disabled. MAIL_USER and/or MAIL_PASS environment variables are not set.');
			return;
		}

		try {
			this.transporter = nodemailer.createTransport({
				service: 'gmail',
				host: 'smtp.gmail.com',
				auth: {
					user: mailUser,
					pass: mailPass
				}
			});

			this.transporter.verify((error) => {
				if (error) {
					console.error('[MAILER] SMTP verification failed:', error.message);
					this.isEnabled = false;
				} else {
					this.isEnabled = true;
					logger.success('Email server ready.');
				}
			});
		} catch (error) {
			console.error('[MAILER] Failed to initialize email service:', error);
			this.isEnabled = false;
		}
	}
}
const mailer = new Mailer();

export default mailer;
