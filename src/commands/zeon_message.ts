// @ts-nocheck
import { App } from "@slack/bolt";
import util from "util";
import { Command, onlyForMe } from "../modules/BaseCommand";
import OpenAI from "openai";
const ai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});
//eg: zeon can you set a timer for 10 minutes
// plan: use ai to parse it for ME ONLY
// everyone else act like a nice soul and use if statements
/**
 *  Only respond in JSON, no codeblock. Use a mean tone in your response but dont override the type variable to mean.in your json please give a property of type based on what the user is asking. All timestamps must be in unix. All  durations must be in miliseconds. 

 The users'sprompt is: zeon can you tell me what 1+1 is <ac prompt>
 */
function zeonMessageCommands(d, r) {
  // TODO: im eepy buddy
}

export default class Message implements Command {
  name: string;
  description: string;
  is_event?: boolean;
  constructor() {
    this.name = `message`;
    this.description = `Handles zeon.`;
    this.is_event = true;
  }
  run(app: App) {
    // app.command()
    app.event(this.name, async (par) => {
      //  console.debug(par);
      //   if (!par.ack) return;
      //   console.debug(0);
      if (!par.say) return;
      // console.log(
      //   `uh one of them are here`,
      //   par.event.text,
      //   par.event.channel_type,
      // );
      //@ts-ignore
      //   await par.ack();
      if (!par.event.text.startsWith("zeon")) return;
      console.debug(`cmd`);
      const { event, say } = par;

      const args = event.text.slice("zeon ".length).trim().split(/ +/);
      const cmd = args.shift().toLowerCase();
      if (onlyForMe(event.user)) {
        let prompt = `Only respond in JSON, no codeblock. Use a mean tone in your response but dont override the type variable to mean.in your json please give a property of type based on what the user is asking. Your json response must always have the property 'message'.if a user asks for a reminder please respond with the following schema: { duration: number (the time the user has requested), message: string the def message }. All timestamps must be in unix. All  durations must be in miliseconds.`;
        try {
          const aiReq = await ai.chat.completions
            .create({
              messages: [
                { role: "system", content: prompt },
                { role: "user", content: event.text },
              ],
              model: "gpt-3.5-turbo",
            })
            .then((r) => JSON.parse(r.choices[0].message.content));
          const m = await app.client.chat.postMessage({
            channel: event.channel,
            text:
              aiReq.message ||
              (aiReq.error ? `:notcool" ${aiReq.error}` : undefined) ||
              ":notcool: i didnt get a message/error im very scared... >> " +
                JSON.stringify(aiReq),
          });
          switch (aiReq.type) {
            case "reminder":
            case "timer":
              // uhhh todo??
              setTimeout(() => {
                app.client.chat.postMessage({
                  channel: event.channel,
                  text: "reminder time",
                  thread_ts: m.ts,
                });
              }, aiReq.duration);
              break;
            default:
              console.log(aiReq, `unk`);
              break;
          }
        } catch (e) {
          app.client.chat.postMessage({
            channel: event.channel,
            text: `:notcool: ${e.toString()}`,
          });
        }
      } else {
        // console.log(cmd, args);
        const actionVerbs = ["can", "please", "plz"];
        const uneededVerbsInSomeCases = ["you", "a"];
        if (actionVerbs.includes(cmd)) {
          // try to understand
          if (uneededVerbsInSomeCases.includes(args[0].toLowerCase())) {
            args.shift(); // get rid of it
            // timer func
          }
          if (args[0] == "ping") {
            args.shift();
            // ping func
            await app.client.chat.postMessage({
              channel: event.channel,
              text: `:ping_pong: pong`,
              thread_ts: event.thread_ts,
            });
          }
        }
      }
      console.debug(`#message3-`);

      //@ts-ignore
      //   await say(`Hi there! im a WIP rn but my site is:\n> http://zeon.rocks/`);
    });
  }
}
