import winston from 'winston';
import chalk from 'chalk';

class Logger {
	create(name: string) {
		// Winston 2.x API - используем new winston.Logger() вместо winston.createLogger()
		const logger = new winston.Logger({
			transports: [
				new winston.transports.Console({
					level: 'debug',
					handleExceptions: true,
					json: false,
					colorize: true,
					timestamp: () => {
						return new Date().toISOString().replace('T', ' ').substring(0, 19);
					},
					formatter: (options: any) => {
						const timestamp = options.timestamp();
						return `[${timestamp}]: ${options.message || ''}`;
					}
				}),
				new winston.transports.File({
					level: 'info',
					filename: `logs/${name}.log`,
					json: true,
					timestamp: true,
					handleExceptions: true
				})
			]
		});

		return logger;
	}

	success(message: string) {
		console.log(chalk.green('[DONE] ') + message);
	}
}

export default new Logger();
