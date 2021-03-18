var version = 'Version 8.0';
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const path = require('path')
const ms = require("ms");

const PREFIX = "!!"
var bot = new Discord.Client();
bot.on('ready', () => {
    console.log('Im online! ' + version);

    bot.user.setActivity("100 gecs", {
        type: "LISTENING"
    });
});

function play(connection, message) {
    var server = servers[message.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {
        filter: "audioonly"
    }));

    server.queue.shift();

    server.dispatcher.on("end", function () {
        if (server.queue[0]) play(connection, message);
        else connection.disconnect();
    });
}

var fortunes = [
    "yes",
    "no",
    "maybe",
];

var servers = {};

bot.on("message", function (message) {
    if (message.author.equals(bot.user)) return;

    if (!message.content.startsWith(PREFIX)) return;

    let args = message.content.toLowerCase().substring(PREFIX.length).split(" ");

    switch (args[0]) {
        case "ping":
            var embed = new Discord.RichEmbed()
                .setDescription("Pong!")
                .setColor(0x00FFFF)
            message.channel.send(embed);
            break;
        case "info":
            var embed = new Discord.RichEmbed()
                .setDescription("I'm a friendly bot created by Detz")
                .setColor(0x00FFFF)
                .setThumbnail(message.author.avatarURL)
            message.channel.send(embed);
            break;
        case "8ball":
            if (args[1]) message.channel.send(fortunes[Math.floor(Math.random() * fortunes.length)]);
            else var embed = new Discord.RichEmbed()
                .setDescription("❌ You must include a question!")
                .setColor(0x00FFFF)
            message.channel.send(embed).catch(err => {
                console.log(err);
            })
            break;
        case "help":
            var embed = new Discord.RichEmbed()
                .addField("!!commands", "List of all commands", true)
                .setColor(0x00FFFF)
                .setFooter("Created By Detz")
            message.channel.send(embed);
            break;
        case "commands":
            var embed = new Discord.RichEmbed()
                .addField("!!ping", "Play ping pong cuz why not", true)
                .addField("!!8ball", "Play 8ball cuz why not", true)
                .addField("!!info", "Info about bot", true)
                .addField("!!play", "Plays songs what u think", true)
                .addField("!!purge", "Purges the chat by set amount", true)
                .addField("!!mute", "Mutes a specified user", true)
                .addField("!!kick", "Kicks a specified user", true)
                .addField("!!ban", "Bans a specified user", true)
                .setFooter("Created by DetailZZ")
                .setColor(0x00FFFF)
                .setThumbnail(message.author.avatarURL)
            message.channel.send(embed);
            break;
        case "play":
            if (args[1] == (null) || !args[1].includes('youtube.com') || !args[1].includes('youtu.be')) {
                var embed = new Discord.RichEmbed()
                    .setTitle("❌ Please provide a link")
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor(0x00FFFF)
                message.channel.send(embed);
                return;
            }
            if (!message.member.voiceChannel) {
                var embed = new Discord.RichEmbed()
                    .setTitle("❌ You must be in a voice channel")
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor(0x00FFFF)
                message.channel.send(embed);
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);
            var embed = new Discord.RichEmbed()
                .setTitle("Added to queue")
                .setAuthor(message.author.username, message.author.avatarURL)
                .setColor(0x00FFFF)
            message.channel.send(embed);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function (connection) {
                console.log("Connection exists");
                play(connection, message);
                var embed = new Discord.RichEmbed()
                    .setTitle("🎵 Now playing song 🎵")
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor(0x00FFFF)
                message.channel.send(embed);
            });
            break;
        case "skip":
            var server = servers[message.guild.id];

            if (!message.member.voiceChannel) {
                var embed = new Discord.RichEmbed()
                    .setTitle("❌ You must be in the same voice channel as the bot to skip the current song")
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor(0x00FFFF)
                message.channel.send(embed);
                return;
            }

            if (server.dispatcher) server.dispatcher.end(); {
                var embed = new Discord.RichEmbed()
                    .setTitle("Skipping current song")
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor(0x00FFFF)
                message.channel.send(embed);
            }
            break;
        case "stop":
            var server = servers[message.guild.id];

            if (!message.member.voiceChannel) {
                var embed = new Discord.RichEmbed()
                    .setTitle("❌ You must be in the same voice channel as the bot to stop the current song")
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor(0x00FFFF)
                message.channel.send(embed);
                return;
            }

            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect(); {
                var embed = new Discord.RichEmbed()
                    .setTitle("Stopping current song")
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor(0x00FFFF)
                message.channel.send(embed);
            }
            break;
        case "ecksdee":
            var embed = new Discord.RichEmbed()
                .setDescription("XD")
                .setColor(0x00FFFF)
            message.channel.send(embed);
            break;
        case "purge":
            if (!args[1]) return message.reply("Please specify how many messages you want to delete");
            message.channel.bulkDelete(args[1]);
            if (args[1]) return message.reply(`Successfully deleted`);
            break;
        case "mute":
            let person = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]))
            if (!person) return message.reply("Couldn't find the specified user");

            let mainrole = message.guild.roles.find(role => role.name === "Member");
            let muterole = message.guild.roles.find(role => role.name === "Muted");

            if (!muterole) return message.reply("Couldn't find a mute role");

            let time = args[2];

            if (!time) {
                return message.reply("No time has been specified")
            }

            person.removeRole(mainrole.id);
            person.addRole(muterole.id);

            message.channel.send(`@${person.user.tag} has now been muted for ${ms(ms(time))}`);

            setTimeout(function () {
                person.addRole(mainrole.id);
                person.removeRole(muterole.id);
                message.channel.send(`@${person.user.tag} has now been unmuted`)
            }, ms(time));
            break;
        case "unmute":
            let muted1 = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]))
            if (!muted1) return message.reply("Couldn't find the specified user");

            let mainrole1 = message.guild.roles.find(role => role.name === "Member");
            let muterole1 = message.guild.roles.find(role => role.name === "Muted");

            muted1.addRole(mainrole1.id);
            muted1.removeRole(muterole1.id);
            message.channel.send(`@${muted1.user.tag} has now been unmuted`)
            break;
        case "kick":

            const user = message.mentions.users.first();

            if (user) {
                const member = message.guild.member(user);

                if (member) {
                    member.kick("You were kicked for trolling!").then(() => {
                        message.reply(`Sucessfully kicked ${user.tag}`);
                    }).catch(err => {
                        message.reply("I was unable to kick the user");
                        console.log(err);
                    })
                } else {
                    message.reply("That user isn\'t in the server");
                }
            } else {
                message.reply(`You need to specify a user`);
            }
            break;
        case "ban":

            const user1 = message.mentions.users.first();

            if (user1) {
                const member = message.guild.member(user1);

                if (member) {
                    member.ban({
                        ression: "You were banned from " + message.guild.name
                    }).then(() => {
                        message.reply(`Sucessfully banned ${user1.tag}`);
                    }).catch(err => {
                        message.reply("I was unable to ban the user");
                        console.log(err);
                    })
                } else {
                    message.reply("That user isn\'t in the server");
                }
            } else {
                message.reply(`You need to specify a user`);
            }

            break;
        default:
            var embed = new Discord.RichEmbed()
                .setDescription("❌ Invalid Command " + message.author)
                .setColor(0x00FFFF)
                .setThumbnail(message.author.avatarURL)
            message.channel.send(embed);
    }
});

bot.login(process.env.token);
