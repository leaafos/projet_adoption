import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<number>;
  declare organizationId: string;
  declare userId: string;
  declare amount: number;
  declare currency: string;
  declare status: string;
  declare payment_method: string;
  declare stripeId: CreationOptional<string>; // ← ajouter cette ligne

  static initModel(sequelize: Sequelize): typeof Payment {
    Payment.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        organizationId: { type: DataTypes.STRING(120), allowNull: false },
        userId: { type: DataTypes.STRING(120), allowNull: false },
        amount: { type: DataTypes.FLOAT, allowNull: false },
        currency: { type: DataTypes.STRING(10), allowNull: false },
        status: { type: DataTypes.STRING(50), allowNull: false },
        payment_method: { type: DataTypes.STRING(100), allowNull: false },
        stripeId: { type: DataTypes.STRING(255), allowNull: true }, // ← ajouter ici
      },
      { sequelize, tableName: 'payments', modelName: 'Payment', timestamps: true }
    );
    return Payment;
  }
}
