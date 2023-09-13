import { STAGES } from "./index.js";
import { getStage, stages } from "../stages.js";
import { storage } from "../storage.js";
import { VenomBot } from "../venom.js";

export const stageFive = {
    async exec({from, message, to}) {
        if (message.toUpperCase() === 'MENU') {
            storage[from].stage = STAGES.WELCOME;
            const currentStage = getStage({ from });

            await stages[currentStage].stage.exec({ from, to });
        } else {
            const bot = VenomBot.getInstance();
            console.log(storage[from]);
            delete storage[from];
            bot.sendText({session: to, to: from, message: 'Obrigado pelo contato.\nAtendimento encerrado.'});
        }
    }
}