import { RaidData } from './raid.interface';
import "dotenv/config";
export const raidData: RaidData = {
  icon: 'https://images-ext-1.discordapp.net/external/MNhTLpAjfnYRn-9ccT7G9xHytta5uOOt_FHpdQqiWfo/%3Fsize%3D2048/https/cdn.discordapp.com/icons/1093539713123623033/533cf23881e06906efe831be83573490.png?format=webp&quality=lossless&width=662&height=662',
  message: 'Servidor Atacado por OSint!',
  invite: 'https://discord.gg/PxFDykkt',
  name: '/shabz',
  nuke_name: '/shabz',
  raid_channel: '/shabz',
};

export const colors = {
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
};

export const admin: string = '817516787074596884';
export const reset: string = '\x1b[0m';
export const prefix: string = '+';

export const TOKEN: string = process.env.TOKEN as string;
