require("dotenv").config();
const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const { GoogleGenAI } = require("@google/genai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function generateImage(prompt) {
  try {
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
      },
    });

    const imageBase64 = response.generatedImages[0].image.imageBytes;
    return Buffer.from(imageBase64, "base64");
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

client.once("clientReady", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const imageBuffer = await generateImage(message.content);

  if (!imageBuffer) {
    message.reply("❌ Failed to generate image.");
    return;
  }

  const attachment = new AttachmentBuilder(imageBuffer, {
    name: "generated-image.png",
  });

  message.channel.send({ files: [attachment] });
});

client.login(process.env.DISCORD_BOT_TOKEN);
