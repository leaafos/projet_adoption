import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Artist extends Model<InferAttributes<Artist>, InferCreationAttributes<Artist>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare bio: string | null;
  declare country: string | null;

  static initModel(sequelize: Sequelize): typeof Artist {
    Artist.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        bio: { type: DataTypes.STRING(255), allowNull: true },
        country: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'artists', modelName: 'Artist', timestamps: true }
    );
    return Artist;
  }
}
