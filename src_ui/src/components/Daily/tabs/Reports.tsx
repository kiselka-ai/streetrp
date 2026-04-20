import React from 'react';
import rpc from 'utils/rpc';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { showNotification } from 'utils/notifications';
import PrimaryTitle from 'components/Common/primary-title';
import GradientButton from 'components/Common/gradient-button';

export default function TabReports() {
	async function sendMessage(message: string, { resetForm }: FormikHelpers<any>) {
		try {
			await rpc.callServer('Admin-SendReport', message);
			showNotification('success', 'Жалоба отправлена');
			resetForm();
		} catch (e: any) {
			showNotification('error', e?.msg || 'Ошибка');
		}
	}

	return (
		<div className="daily_tab daily_tab--reports">
			<PrimaryTitle className="daily_tab-title">Репорты</PrimaryTitle>
			<div className="daily_tab-inner">
				<p className="daily_tab-reports-desc">Опишите проблему (макс. 64 символа)</p>
				<Formik
					initialValues={{ message: '' }}
					validationSchema={Yup.object({
						message: Yup.string().trim().required().min(2).max(64)
					})}
					onSubmit={(vals, helpers) => sendMessage(vals.message, helpers)}
				>
					<Form className="daily_tab-reports-form">
						<Field
							className="outline-input"
							type="text"
							name="message"
							placeholder="Сообщение"
						/>
						<GradientButton type="submit">Отправить</GradientButton>
					</Form>
				</Formik>
			</div>
		</div>
	);
}
