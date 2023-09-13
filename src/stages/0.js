import { findServentiaByNumCel } from "../db/db_local_config_bd.js";
import { stages } from "../stages.js";
import { storage } from "../storage.js";
import { VenomBot } from "../venom.js";
import { STAGES } from "./index.js";

export const initialStage = {
  async exec({ from, message = "", to = "" }) {
    if (message) {
      const venombot = await VenomBot.getInstance();

      let msg = ``;
      await venombot.sendText({ session: to, to: from, message: msg });

      const [rows, fields] = await findServentiaByNumCel(to);
      storage[from].stage = STAGES.WELCOME;

      if (!rows || rows.length === 0) {
        msg =
          "Para iniciarmos, favor informar o número TJ do Cartório cadastrado (apenas números):";
        await venombot.sendText(from, msg);
      } else {
        storage[from].serventia = rows[0];
        await stages[storage[from].stage].stage.exec({
          from,
          to,
        });
      }
    }
  },
};
