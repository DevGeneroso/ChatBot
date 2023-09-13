import { storage } from "../storage.js";
import { VenomBot } from "../venom.js";
import { STAGES } from "./index.js";

const endMessage =
  `-----------------------------\n` +
  '\nCaso deseje iniciar outro atendimento, digite "MENU".\nOu caso deseje encerrar o atendimento, digite "SAIR".';

export const stageThree = {
  async exec({ from, message = "", to }) {
    message = message.trim() || "";

    const bot = VenomBot.getInstance();
    const pattern = /[0-9]{1}/;
    const valid = pattern.test(message);

    const { lastOptions = [], lastMsg = "" } = storage[from];

    if (!valid) {
      await bot.sendText({session: to, to: from, message: "Opção inválida, apenas números são válidos.",});
      await bot.sendText({ session: to, to: from, message: lastMsg });

    } else {
      const selectedNumber = parseInt(message);
      const selectedOption = lastOptions.find((op) => op.MENU_SEQUENCIA === selectedNumber);
      if (!selectedOption) {
        await bot.sendText({session: to, to: from, message: "Opção enviada inválida, apenas números são válidos.",});
        await bot.sendText({ session: to, to: from, message: lastMsg });

      } else {
        if (selectedNumber === 3) {
          let msg = selectedOption.TITULO + `\n\n` +
          `Escrituras:\n` +
          `https://2oficioniteroi.com.br/servicos/escrituras\n\n` +
          `Procuraçoes:\n` +
          `https://2oficioniteroi.com.br/servicos/procuracoes\n\n` +
          `Casonecessite de maiores informações, faça contato direto com um de nossos escreventes de notas:\n\n` +
          `*Carlos Josiel*  : (21) 98773-8803\n` +
          `*Breno*             : (21) 96435-6830\n` +
          `*Adilea*            : (21) 99914-1891\n` +
          `*Wagner*          : (21) 97167-1220\n\n` +
          `ou, então, dirija-se ao nosso cartório e fale diretamente com um de nossos escreventes.\nSerá um prazer atende-los.` +
          `\n\n${endMessage}`;
          await bot.sendText({session: to, to: from, message: msg});

        } else if (selectedNumber === 4) {
          let msg = selectedOption.TITULO + `\n\n${endMessage}`;
          await bot.sendText({session: to, to: from, message: msg});

        } else {
          await bot.sendText({session: to, to: from, message: selectedOption.TITULO});
        }
        if (selectedOption.ACAO !== "TEXTO") {
          storage[from].lastMsg = selectedOption.TITULO;
          storage[from].stage = STAGES.SEARCH_MENU;
          storage[from].action = selectedOption.ACAO;

        } else {
          console.log(storage[from]);
          delete storage[from];
          await bot.sendText({session: to, to: from, message: "Atendimento encerrado.",});
        }
      }
    }
  },
};
