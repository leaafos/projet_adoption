import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Mail extends Model<InferAttributes<Mail>, InferCreationAttributes<Mail>> {
  declare id: CreationOptional<number>;
  declare userId: string;
  declare title: string;
  declare body: string;
  declare sentAt: CreationOptional<Date>;
  declare status: string;
  declare errorMessage: CreationOptional<string | null>;


  static initModel(sequelize: Sequelize): typeof Mail {
    Mail.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.STRING(120), allowNull: false },
        title: { type: DataTypes.STRING(255), allowNull: false },
        body: { type: DataTypes.TEXT, allowNull: false },
        sentAt: { type: DataTypes.DATE, allowNull: true },
        status: { type: DataTypes.STRING(50), allowNull: false },
        errorMessage: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'mails', modelName: 'Mail', timestamps: true }
    );
    return Mail;
  }
}
