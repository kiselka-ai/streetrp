import React from 'react';
import { Circle } from 'rc-progress';

type Props = {
	amount: number;
};

export default function RPM({ amount }: Props) {
	// Ограничиваем значение от 0 до 100 и нормализуем если больше 100
	const percent = Math.max(0, Math.min(100, amount || 0));
	const color = percent > 90 ? '#d40000' : '#fce638';

	return (
		<div className="speedometer_rpm">
			<Circle
				className="speedometer_rpm-fill"
				strokeWidth={3}
				trailWidth={3}
				trailColor="rgba(255,255,255, 0.5)"
				strokeColor={color}
				percent={percent}
				gapDegree={120}
				gapPosition="bottom"
				strokeLinecap="square"
			/>

			<Circle
				className="speedometer_rpm-fill"
				strokeWidth={3}
				trailWidth={3}
				trailColor="rgba(255,255,255, 0.5)"
				strokeColor={color}
				percent={percent}
				gapDegree={120}
				gapPosition="bottom"
				strokeLinecap="square"
			/>
		</div>
	);
}
