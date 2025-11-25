import path from 'node:path';
import { Sequelize } from 'sequelize';
import { User } from './user';
import { Animal } from './animal';
import { Organization } from './organization';
import { Payment } from './payment';
import { Mail } from './mail';


export interface Database {
  sequelize: Sequelize;
  models: {
    User: typeof User;
    Animal: typeof Animal;
    Organization: typeof Organization;
    Payment: typeof Payment;
    Mail: typeof Mail;
  };
}

export type DbOptions = {
  storage?: string;
  logging?: boolean | ((sql: string) => void);
  inMemory?: boolean;
};

export function createDatabase(opts: DbOptions = {}): Database {
  let database = '../../data-development.sqlite'
  if (process.env.NODE_ENV === 'prod') {
    database = '../../data-development.sqlite'
  }

  const storage = opts.inMemory
    ? ':memory:'
    : opts.storage ?? path.resolve(__dirname, database);

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: opts.logging ?? false,
  });

  // Init models
  User.initModel(sequelize);
  Animal.initModel(sequelize);
  Organization.initModel(sequelize);
  Payment.initModel(sequelize);
  Mail.initModel(sequelize);

  // Define associations
  // Un animal appartient à une organisation
  Animal.belongsTo(Organization, {
    foreignKey: 'organizationId',
    targetKey: 'organization_id',
    as: 'organization'
  });

  // Une organisation peut avoir plusieurs animaux
  Organization.hasMany(Animal, {
    foreignKey: 'organizationId',
    sourceKey: 'organization_id',
    as: 'animals'
  });

  return {
    sequelize,
    models: { User, Animal, Organization, Payment, Mail },
  };
}

export type { User, Animal, Organization, Payment, Mail };

// Default database instance
// - Uses in-memory SQLite under test to keep tests isolated and fast
// - Disables logging by default to reduce noise
const _defaultDb = createDatabase({
  inMemory: process.env.NODE_ENV === 'test',
  logging: false,
});

// Flatten models on the default export to allow `models.sequelize` and `models.User`
const defaultExport = {
  sequelize: _defaultDb.sequelize,
  ..._defaultDb.models,
};

export default defaultExport;
