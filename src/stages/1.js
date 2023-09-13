import {
  findFirstLevelMenu,
  findMenu,
  findServentiaByCodigoTj,
} from "../db/db_local_config_bd.js";
import { stages } from "../stages.js";
import { storage } from "../storage.js";
import { VenomBot } from "../venom.js";
import { STAGES } from "./index.js";

const findServentiaMenu = async (from, bot, to) => {
  const serventia = storage[from].serventia;
  const [rows, fields] = await findFirstLevelMenu(serventia.ID);
  await handleOptions(rows, from, bot, to);
};

const handleServentia = async (resultRows, from, bot, to) => {
  // if "serventia" encontrada, buscar menu inicial da serventia, e exibir as opções filhas...
  // else exibir mensagem de erro e terminar o atendimento.

  if (!resultRows || resultRows.length === 0) {
    await bot.sendText({
      session: to,
      to: from,
      message:
        "Código da serventia não encontrado. Por favor, tente novamente. Digite o número do TJ da serventia:",
    });
  } else {
    storage[from].serventia = resultRows[0];
    await findServentiaMenu(from, bot, to);
  }
};

const handleOptions = async (resultRows, from, bot, to) => {
  let errorMsg = null;
  const serventia = storage[from].serventia;
  if (!resultRows || resultRows.length === 0) {
    errorMsg = `Não foram encontradas as opções de atendimento da serventia ${serventia.DESCRICAO}.\nAtendimento encerrado.`;
  }
  if (errorMsg) {
    storage[from].stage = STAGES.INITIAL;
    await bot.sendText({ session: to, to: from, message: errorMsg });
  } else {
    const menuPrincipal = resultRows[0];
    const msg = `Olá seja bem vindo(a) ao atendimento do\n*${serventia.DESCRICAO}*\n${menuPrincipal.TITULO}\nou caso queira encerrar o atendimento, digite 'Sair' a qualquer momento.`;
    storage[from].stage = STAGES.FIRST_MENU;
    await bot.sendText({ session: to, to: from, message: msg });

    await stages[storage[from].stage].stage.exec({
      from,
      lastOption: menuPrincipal,
      to,
    });
  }
};

export const stageOne = {
  async exec({ from, message = "", to = "" }) {
    const serventia = storage[from].serventia;
    const bot = VenomBot.getInstance();
    if (!serventia) {
      message = message.trim() || "";

      const pattern = /[0-9]{4,6}/;
      const valid = pattern.test(message);
      if (!valid) {
        const msg =
          "Valor do código da serventia inválido. Por favor, digite novamente.";
        await bot.sendText({ session: to, to: from, message: msg });
      } else {
        const [rows, fields] = await findServentiaByCodigoTj(parseInt(message));
        await handleServentia(rows, from, bot, to);
      }
    } else {
      await findServentiaMenu(from, bot, to);
    }
  },
};
