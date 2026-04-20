import React from 'react';
import { FaGasPump } from 'react-icons/fa';
import { Circle } from 'rc-progress';

/** amount: 0–100, реальный процент (current / max) * 100 от полного бака */
export default function Fuel({ amount }: { amount: number }) {
	const percent = Math.max(0, Math.min(100, amount ?? 0));

	return (
		<div className="speedometer_fuel">
			<FaGasPump className="speedometer_fuel-icon" />
			<Circle
				className="speedometer_fuel-fill"
				strokeWidth={3}
				trailWidth={3}
				trailColor="rgba(255,255,255, 0.5)"
				strokeColor="#ff0082"
				percent={percent}
				gapDegree={292.5}
				gapPosition="bottom"
				strokeLinecap="square"
			/>
		</div>
	);
}
