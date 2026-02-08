import React from 'react';
import fs from 'fs';
import { useApp } from './src/index.js';
import { spawn as spawnProcess } from 'child_process';

/**
 * Cleanly exits the Ink application and the underlying Node process.
 */
export function useExit() {
	const { exit: exitApp } = useApp();

	const exit = ({ exitCode = 0 } = {}) => {
		exitApp();

		process.exit(exitCode);
	};

  return { exit };
}

/**
 * @typedef {Object} SpawnOptions @property {string} command - The shell command to execute.
 * @property {boolean} [detached=true] - Whether the process should continue after parent exits.
 * @property {string} [shell] - The shell to use (defaults to $SHELL).
 * @property {string} [stdio='inherit'] - Where to send the input/output.
 */

/**
 * Directly spawns a shell process and exits Node.
 * Best for: Interactive tools where Node should disappear immediately.
 */
export function useSpawn() {
	const { exit } = useExit();

	/**
	 * @param {{ command: string, detached?: boolean, shell?: string, stdio?: string }} options
	 */
  const spawn = ({
		command,
		detached = true,
		shell = process.env.SHELL || 'zsh',
		stdio = 'inherit'
	} = {}) => {
		spawnProcess(shell, ['-ic', command], { stdio, detached });

		exit();
	}

  return { spawn };
}

/**
 * @typedef {Object} PassBackOptions
 * @property {string} command - The command string to send back to the caller.
 * @property {boolean} [forceStdout=false] - If true, ignore INK_OUTPUT_PATH and use stdout.
 */

/**
 * Returns a command string to the calling shell via a file or stdout.
 * Best for: The "Eval" workflow where the parent shell executes the result.
 */
export function usePassBack() {
	const { exit } = useExit();

	/**
	* @param {PassBackOptions} options
	*/
	const passBack = ({ command, forceStdout = false }) => {
		const outputPath = process.env.INK_OUTPUT_PATH;

		if (forceStdout || !outputPath) {
			// Mode: Pipe/Stdout
			process.stdout.write(command);
		} else {
			// Mode: Plugin/File
			fs.writeFileSync(outputPath, command); }
		  exit();
		};

    return { passBack };
}
