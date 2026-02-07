import React, {useState} from 'react';
import {exec} from 'child_process';
import {
	render,
	Box,
	Text,
	useApp,
	useFocus,
	useInput,
	useFocusManager,
} from '../../src/index.js';

// Parse CLI args: "Label:Command"
const args = process.argv.slice(2);
const items = args.map(arg => {
	const [label, ...cmdParts] = arg.split(':');
	return {
		label: label || 'Untitled',
		command: cmdParts.join(':') || 'echo "No command provided"'
	};
});

function Focus() {
	const {exit} = useApp();
	const {focus} = useFocusManager();
	const [lastOutput, setLastOutput] = useState('');

	const handlePress = (command: string) => {
		setLastOutput(`Running: ${command}...`);

    const { SHELL, project } = process.env ?? { SHELL: '/usr/bin/zsh' };
		/*
		// Works!
		const filesToSource = [
      '~/.oh-my-zsh/custom/plugins/project/functions.zsh',
			'./.projectrc',
		]
		*/
		const filesToSource = [
      '~/.zshrc'
		]
		const sourceString = filesToSource.map(file => `source ${file}`).join('; ')

		// console.log({ command })
		const fullCommand = `${SHELL} -c '${sourceString}; ${command}'`

		// Execute the shell command
		// exec(command, (error, stdout, stderr) => {
		exec(fullCommand, (error, stdout, stderr) => {
			if (error) {
				setLastOutput(`Error: ${error.message}`);
				return;
			}
			setLastOutput(`Output: ${stdout || stderr || 'Success'}`);
		});
	};

	useInput(input => {
		const index = parseInt(input, 10);
		if (!isNaN(index) && index > 0 && index <= items.length) {
			focus(index.toString());
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Box borderStyle="round" paddingX={1} marginBottom={1}>
				<Text italic color="cyan">{lastOutput || 'Select an item and press Enter'}</Text>
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

function Item({label, id, onPress}) {
	const {isFocused} = useFocus({id});

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
