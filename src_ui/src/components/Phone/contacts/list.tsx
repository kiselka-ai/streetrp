import React from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { ContactData } from './index';

type Props = {
	selectContact: (contact: ContactData) => void;
	contacts: ContactData[];
};

function groupByLetter(contacts: ContactData[]) {
	const map = new Map<string, ContactData[]>();
	for (const c of contacts) {
		const letter = c.firstName[0].toUpperCase();
		if (!map.has(letter)) map.set(letter, []);
		map.get(letter)!.push(c);
	}
	return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function ContactsList({ contacts, selectContact }: Props) {
	const sections = groupByLetter(contacts);

	if (contacts.length === 0) {
		return (
			<div className="contacts_list contacts_list--empty">
				<p className="contacts_list-empty">Нет контактов</p>
			</div>
		);
	}

	return (
		<div className="contacts_list">
			{sections.map(([letter, items]) => (
				<section key={letter} className="contacts_list-section">
					<div className="contacts_list-letter">{letter}</div>
					<div className="contacts_list-group">
						{items.map((contact, i) => (
							<button
								key={`${contact.phone}-${i}`}
								type="button"
								className="contacts_list-item"
								onClick={() => selectContact(contact)}
							>
								<div className="contacts_list-avatar">
									{contact.firstName[0]}
									{contact.lastName[0]}
								</div>
								<span className="contacts_list-name">
									{contact.firstName} {contact.lastName}
								</span>
								<IoIosArrowForward className="contacts_list-chevron" />
							</button>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
