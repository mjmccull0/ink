import path from 'node:path';
import os from 'node:os';

export interface CommandItem {
  label: string;
  command: string;
  outputFilePath: string;
}

export const parseArgs = (rawArgs: string[]) => {
  const supportedArguments = {
    '--output-file': { requiresValue: true },
  };

  const getFlagValue = (flag: string) => {
    const index = rawArgs.indexOf(flag);
    if (index !== -1 && rawArgs[index + 1] && !rawArgs[index + 1].startsWith('--')) {
      return rawArgs[index + 1];
    }
    return null;
  };

  const outputFile = getFlagValue('--output-file') ||
                     process.env.MINK_OUTPUT_PATH ||
                     path.join(os.tmpdir(), `mink-exec-${process.pid}.tmp`);

  const items: CommandItem[] = rawArgs
    .filter((arg, index) => {
      if (arg.startsWith('--')) return false;
      const prevArg = rawArgs[index - 1];
      if (supportedArguments[prevArg as keyof typeof supportedArguments]?.requiresValue) return false;
      return true;
    })
    .map(arg => {
      const [label, ...cmdParts] = arg.split(':');
      const command = cmdParts.join(':') || label;
      return {
        label: label || 'Untitled',
        command: command,
        outputFilePath: outputFile,
      };
    });

  return { items, outputFile };
};
