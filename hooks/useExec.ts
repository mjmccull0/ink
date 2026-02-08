import React from 'react';
import fs from 'node:fs';
import { useApp } from '../src/index.js';
import { CommandItem } from '../utils/args.js';


export const useExec = () => {
  const { exit } = useApp();

  const exec = ({ command, label, outputFilePath }: CommandItem) => {
		try {
			fs.writeFileSync(outputFilePath, command, 'utf-8');
		} catch (error) {
			process.stderr.write(`\n❌ Error writing ${label} to file ${outputFilePath}: ${error}\n`);
		}

    // Trigger the exit sequence
    exit();

    // The "Hard Exit" to return control to the shell immediately
    setImmediate(() => {
        process.exit(0);
    });
  };

  return { exec };
};
