import React from 'react';
import { IoPlay, IoPause } from 'react-icons/io5';
import { MdCheck } from 'react-icons/md';

type Props = {
	name: string;
	id: string;
	selected: boolean;
	playing: boolean;
	onSelect: () => void;
	onPlay: () => void;
};

export default function RingtoneItem({ name, selected, playing, onSelect, onPlay }: Props) {
	const handleRowClick = () => {
		onSelect();
		onPlay();
	};

	const handlePlayClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onPlay();
	};

	return (
		<div
			className="settings_ringtones-item"
			onClick={handleRowClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleRowClick()}
		>
			<span className="settings_ringtones-item-name">{name}</span>
			<div className="settings_ringtones-item-right">
				<button
					className="settings_ringtones-item-play"
					onClick={handlePlayClick}
					type="button"
					aria-label={playing ? 'Пауза' : 'Воспроизвести'}
				>
					{playing ? <IoPause /> : <IoPlay />}
				</button>
				{selected && (
					<span className="settings_ringtones-item-check" aria-hidden="true">
						<MdCheck />
					</span>
				)}
			</div>
		</div>
	);
}
