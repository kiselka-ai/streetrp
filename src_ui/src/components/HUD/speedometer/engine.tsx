import React from 'react';
import images from 'utils/images';

export default function Engine({ health }: { health: number }) {
	// Ограничиваем значение от 0 до 100
	const percent = Math.max(0, Math.min(100, health || 0));
	
	// Определяем цвет иконки в зависимости от здоровья двигателя
	// Если здоровье меньше 30%, иконка красная (check engine)
	// Иначе фиолетовая (как была полоска)
	const iconColor = percent < 30 ? '#ff4444' : '#d257d6';

	return (
		<div className="speedometer_engine" style={{ display: 'block', visibility: 'visible' }}>
			<svg className="speedometer_engine-icon" style={{ fill: iconColor, display: 'block' }}>
				<use xlinkHref={`${images.getImage('engine.svg')}#icon`} />
			</svg>
		</div>
	);
}
