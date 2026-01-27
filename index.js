require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Node 22 has fetch built-in
async function generateContent(prompt) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    if (!data.candidates) {
      console.error("Bad API response:", data);
      return "❌ No response from AI.";
    }

    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("AI Error:", err);
    return "❌ Failed to generate response.";
  }
}


client.once("clientReady", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const reply = await generateContent(message.content);
  await message.reply(reply);
});

client.login(process.env.DISCORD_BOT_TOKEN);
