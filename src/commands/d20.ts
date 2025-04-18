import { App } from "@slack/bolt";
import path from "path";
import { Command, onlyForMe } from "../modules/BaseCommand";
export default class D20Roller implements Command {
  name: string;
  description: string;
  is_event?: boolean;
  constructor() {
    this.name = `message`;
    this.description = `d20`;
    this.is_event = true;
  }
  run(app: App) {
    console.debug(`#message-dice`);
    // app.command()
    app.event(this.name, async (par) => {
      //@ts-ignore
      if (par.event.channel !== "C085VCW4AKX") return;
      const message = par;
      //@ts-ignore
      if (par.event.thread_ts) return;

      console.debug(`cmd`);
      const { event, say } = par;
      // roll the dice!
      const roll = Math.floor(Math.random() * 19) + 1;
      let video = path.join(process.cwd(), `assets/dice/splits/${roll}.mp4`);

      await app.client.files.uploadV2({
        file: video,
        filename: `dice.mp4`,
        //@ts-ignore
        thread_ts: event.ts,
        //@ts-ignore
        channel_id: event.channel,
        alt_text: `a d20 dice rolling to ${roll}`,

        // title: `:d20: You rolled a *${roll}* and the video is here:`,
        initial_comment: `:d20: You rolled a *${roll}* and the video is here:`,
      });
      console.debug(`#message-`);
    });
  }
}
