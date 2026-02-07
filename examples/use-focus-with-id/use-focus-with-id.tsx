import React from 'react';
import {
	render,
	Box,
	Text,
	useFocus,
	useInput,
	useFocusManager,
} from '../../src/index.js';
import { useSpawn } from '../../utils.js';

// Parse CLI args: "Label:Command"
const args = process.argv.slice(2);
const items = args.map(arg => {
	const [label, ...cmdParts] = arg.split(':');
	return {
		label: label || 'Untitled',
		command: cmdParts.join(':') || label,
	};
});

function Focus() {
	const { focus } = useFocusManager();
  const { spawn } = useSpawn();

	const handlePress = (command: string) => spawn({ command });

	useInput(input => {
		const index = parseInt(input, 10);
		if (!isNaN(index) && index > 0 && index <= items.length) {
			focus(index.toString());
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Box borderStyle="round" paddingX={1} marginBottom={1}>
				<Text italic color="cyan">{'Select an item and press Enter'}</Text>
			</Box>

			{items.map((item, index) => (
				<Item
					key={index}
					id={(index + 1).toString()}
					label={item.label}
					onPress={() => handlePress(item.command)}
				/>
			))}
		</Box>
	);
}

function Item({ label, id, onPress }) {
	const { isFocused } = useFocus({id});

	useInput((input, key) => {
		if (isFocused && (key.return || input === ' ')) {
			onPress();
		}
	});

	return (
		<Text color={isFocused ? 'green' : undefined}>
			{isFocused ? '❯ ' : '  '}
			<Text bold={isFocused}>[{id}] {label}</Text>
		</Text>
	);
}

render(<Focus />);
