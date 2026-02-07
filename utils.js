import React from 'react';
import { useApp } from './src/index.js';
import { spawn as spawnProcess } from 'child_process';

export function useExit() {
	const { exit: exitApp } = useApp();

	const exit = ({ exitCode = 0 } = {}) => {

		exitApp();

		// Exit node process with code 0
		process.exit(exitCode);
	};

	return { exit };
}

/**
 * @typedef {Object} SpawnOptions
 * @property {string} command - The shell command to execute (e.g., 'fzf' or a function).
 * @property {boolean} [detached=true] - Whether the process should continue after the parent exits.
 * @property {string} [shell] - The shell to use; defaults to process.env.SHELL.
 * @property {string} [stdio='inherit'] - Where to send the input/output.
 */

/**
 * @returns {{ spawn: (options: SpawnOptions) => void }}
 */
export function useSpawn() {
	const { exit } = useExit();

	const spawn = ({
		command,
		detached = true,
		shell = process.env.SHELL || 'zsh' || 'bash',
		stdio = 'inherit',
	} = {}) => {
		// spawnProcess(shell, ['-ic', command], { stdio, detached });
		spawnProcess(shell, ['-ic', command], { stdio, detached });

	  exit();
	}

	return { spawn };
}

