import React from 'react';
import {
	render,
	Box,
	Text,
	useApp,
	useFocus,
	useInput,
	useFocusManager,
} from '../../src/index.js';
import { usePassBack, useSpawn } from '../../utils.js';

// Parse CLI args: "Label:Command"
const args = process.argv.slice(2);

const flags = {
    forceStdout: args.includes('--force-stdout'),
    spawn: args.includes('--spawn'),
    passBack: args.includes('--pass-back')
};

const items = args
    .filter(arg => !arg.startsWith('--'))
    .map(arg => {
        const [label, ...cmdParts] = arg.split(':');
        return {
            label: label || 'Untitled',
            command: cmdParts.join(':') || label,
        };
    });

function Focus() {
	const { focus } = useFocusManager();
  const { spawn } = useSpawn();
	const { passBack } = usePassBack();

	const getSelectionHandler = (flags) => {
		if (flags.spawn && flags.passBack) {
			throw new Error('Use --spawn or --pass-back.  The default is --spawn.');
		}

		if (flags.passBack) {
			return (command: string) => passBack({ command });
		}

		return (command: string) => spawn({ command })
	}

	const handlePress = getSelectionHandler(flags);


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

// render(<Focus />);
// Render to stderr
const { waitUntilExit } = render(React.createElement(Focus, null), {
    stdout: process.stderr
});

// Wait for Ink to signal it is ready to die
await waitUntilExit();

// THE HANDOFF
// Now that Ink is unmounted, we check if a command was saved
if (process.env.PENDING_SPAWN) {
    // Reset the TTY to be absolutely sure fzf/gum are happy
    process.stdin.setRawMode(false);

    // Spawn directly to the real stdout/stdin
    const child = spawnProcess(process.env.SHELL || 'zsh', ['-ic', process.env.PENDING_SPAWN], {
        stdio: 'inherit'
    });

    // Wait for fzf/gum to finish before the script finally exits
    child.on('exit', (code) => {
        process.exit(code);
    });
}
