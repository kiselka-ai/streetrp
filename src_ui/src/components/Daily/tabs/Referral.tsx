import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { showNotification } from 'utils/notifications';
import PrimaryTitle from 'components/Common/primary-title';
import GradientButton from 'components/Common/gradient-button';

type State = {
	code: string;
	income: number;
	bonus: number;
	referrals: { total: number; confirmed: number };
	confirmLevel: number;
};

export default class TabReferral extends Component<{}, State> {
	readonly state: State = {
		code: '—',
		income: 0,
		bonus: 0,
		referrals: { total: 0, confirmed: 0 },
		confirmLevel: 0
	};

	componentDidMount() {
		rpc
			.callServer('Referral-GetInfo')
			.then((data: State) => this.setState(() => data))
			.catch(() => {});
	}

	async useCode(code: string) {
		try {
			await rpc.callServer('Referral-UseCode', code);
			showNotification('success', 'Промокод успешно активирован');
		} catch (e: any) {
			showNotification('error', e?.msg || 'Ошибка');
		}
	}

	render() {
		const { code, bonus, income, referrals, confirmLevel } = this.state;

		return (
			<div className="daily_tab daily_tab--referral">
				<PrimaryTitle className="daily_tab-title">Рефералы</PrimaryTitle>
				<div className="daily_tab-inner">
					<div className="daily_tab-referral-stats">
						<div className="daily_tab-referral-row">
							<span>Ваш код</span>
							<strong>{code}</strong>
						</div>
						<div className="daily_tab-referral-row">
							<span>Ввели код</span>
							<strong>{referrals.total}</strong>
						</div>
						<div className="daily_tab-referral-row">
							<span>Получили бонус</span>
							<strong>{referrals.confirmed}</strong>
						</div>
					</div>
					<p className="daily_tab-referral-desc">
						После {confirmLevel} уровня игрок получит {bonus}$, вы — {income}$.
					</p>
					<Formik
						initialValues={{ code: '' }}
						validationSchema={Yup.object({
							code: Yup.string().trim().required().min(2).max(32)
						})}
						onSubmit={(vals) => this.useCode(vals.code)}
					>
						<Form className="daily_tab-referral-form">
							<Field
								className="outline-input"
								type="text"
								name="code"
								placeholder="Промо-код"
							/>
							<GradientButton type="submit">Активировать</GradientButton>
						</Form>
					</Formik>
				</div>
			</div>
		);
	}
}
