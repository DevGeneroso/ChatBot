import { createPool } from "mysql2";

let pool = null;

const getPool = () => {
  pool = pool
    ? pool
    : createPool({
        host: "mysql44-farm2.uni5.net",
        user: "totalsistemas26",
        password: "wtpT0talzap",
        database: "totalsistemas26",
        connectionLimit: 10,
      });
  return pool;
};

const findServentiaByCodigoTj = (codigoTj = 0) => {
  return getPool()
    .promise()
    .query("SELECT * FROM serventias WHERE CODIGO_TJ = ?", [codigoTj]);
};

const findServentiaByNumCel = (numCel = "") => {
  return getPool()
    .promise()
    .query("SELECT * FROM serventias WHERE NUM_CEL = ?", [numCel]);
};

const findValidNumsCel = () => {
  return getPool()
    .promise()
    .query("SELECT NUM_CEL FROM serventias WHERE NUM_CEL IS NOT NULL");
};

const findFirstLevelMenu = (serventiaId = 0) => {
  return getPool()
    .promise()
    .query(
      `
            SELECT B.*, A.ACAO, A.TITULO
            FROM botmenu B 
            INNER JOIN acao_retorno A ON A.ID = B.ACAO_MENU_ID
            WHERE B.SERVENTIA_ID = ? AND B.MENU_PAI_ID IS NULL`,
      [serventiaId]
    );
};

const findMenu = (serventiaId = 0, menuPaiId = 0) => {
  return getPool()
    .promise()
    .query(
      `
            SELECT B.*, A.ACAO, A.TITULO
            FROM botmenu B 
            INNER JOIN acao_retorno A ON A.ID = B.ACAO_MENU_ID
            WHERE B.SERVENTIA_ID = ? AND B.MENU_PAI_ID = ?`,
      [serventiaId, menuPaiId]
    );
};

const findServentiasBdConfig = (serventiaId = 0) => {
  return getPool()
    .promise()
    .query(
      `
            SELECT C.*
            FROM serventia_bd_config C 
            WHERE C.SERVENTIA_ID = ?`,
      [serventiaId]
    );
};

export {
  findMenu,
  findFirstLevelMenu,
  findServentiaByCodigoTj,
  findServentiasBdConfig,
  findServentiaByNumCel,
  findValidNumsCel,
};
