const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Banco SQLite local para logs e auditoria. Não armazena dados sensíveis (apenas hash/funções).
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, 'database.sqlite'),
  logging: false
});

const ContactLog = sequelize.define('ContactLog', {
  event: { type: DataTypes.STRING(50), allowNull: false },
  fingerprint: { type: DataTypes.STRING(128), allowNull: true },
  ip: { type: DataTypes.STRING(45), allowNull: true },
  userAgent: { type: DataTypes.TEXT, allowNull: true }
}, {
  indexes: [{ fields: ['event'] }]
});

async function initDb() {
  await sequelize.authenticate();
  await sequelize.sync();
}

module.exports = {
  sequelize,
  ContactLog,
  initDb
};
