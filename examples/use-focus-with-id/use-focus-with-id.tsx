import React, { useEffect, useState } from 'react';
import path from 'node:path';
import os from 'node:os';
import {
	render,
	Box,
	Text,
	useApp,
	useFocus,
	useInput,
	useFocusManager,
} from '../../src/index.js';
import { useExec } from '../../hooks/useExec.ts';
// import { parseArgs } from '../../utils/args.ts';

// Parse CLI args: "Label:Command"
const args = process.argv.slice(2);

const supportedArguments = {
	'--output-file': {
	  requiresValue: true,
		default: path.join(os.tmpdir(), `mink-exec-${process.pid}.tmp`),
	},
};

// Helper to find the value following a flag (e.g., --output-file path/to/file)
const getFlagValue = (flag) => {
    const index = args.indexOf(flag);
    if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) {
        return args[index + 1];
    }
    return null;
};

const flags = {
    forceStdout: args.includes('--force-stdout'),
	  outputFile: getFlagValue('--output-file') ||
		  process.env.MINK_OUTPUT_PATH ||
		  path.join(os.tmpdir(), `mink-exec-${process.pid}.tmp`),
};

const items = args
	.filter((arg, index) => {
		if (arg.startsWith('--')) return false;
		// Check if this arg was a value for a flag (like the path after --output-file)
		const prevArg = args[index - 1];
		if (supportedArguments[prevArg]?.requiresValue) return false;

		return true;
	})
	.map(arg => {
		const [ label, ...cmdParts ] = arg.split(':');
		const command = cmdParts.join(':') || label;

		return { label, command, outputFilePath: flags.outputFile };
	});


function Focus() {
	const { focus } = useFocusManager();
  const { exec } = useExec();

	const handlePress = ({
		command,
		label,
		outputFilePath,
	}) => exec({ command, label, outputFilePath });

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
					onPress={() => handlePress(item)}
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

// render(<Focus />);
// Render to stderr
const { waitUntilExit } = render(React.createElement(Focus, null), {
    stdout: process.stderr
});

// Wait for Ink to signal it is ready to die
await waitUntilExit();
