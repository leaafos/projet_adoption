import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Animal extends Model<InferAttributes<Animal>, InferCreationAttributes<Animal>> {
  declare id: CreationOptional<number>;
  declare organizationId: number;
  declare type: string;
  declare size: string;
  declare genre: string;
  declare breed: string;
  declare age: string;
  declare description: string;
  declare status: string;
  declare color: string;
  declare coat: string;
  declare name: string;
  declare good_with_children: boolean;
  declare good_with_dogs: boolean;
  declare good_with_cats: boolean;
  declare house_trained: boolean;
  declare declawed: boolean;
  declare special_needs: string;

  static initModel(sequelize: Sequelize): typeof Animal {
    Animal.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        organizationId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'organizations', key: 'organization_id' } },
        type: { type: DataTypes.STRING(50), allowNull: false },
        size: { type: DataTypes.STRING(50), allowNull: false },
        genre: { type: DataTypes.STRING(50), allowNull: false },
        breed: { type: DataTypes.STRING(100), allowNull: true },
        age: { type: DataTypes.STRING(50), allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: false },
        status: { type: DataTypes.STRING(50), allowNull: false },
        color: { type: DataTypes.STRING(50), allowNull: true },
        coat: { type: DataTypes.STRING(50), allowNull: true },
        name: { type: DataTypes.STRING(100), allowNull: true },
        good_with_children: { type: DataTypes.BOOLEAN, allowNull: true },
        good_with_dogs: { type: DataTypes.BOOLEAN, allowNull: true },
        good_with_cats: { type: DataTypes.BOOLEAN, allowNull: true },
        house_trained: { type: DataTypes.BOOLEAN, allowNull: true },
        declawed: { type: DataTypes.BOOLEAN, allowNull: true },
        special_needs: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'animals', modelName: 'Animal', timestamps: true }
    );
    return Animal;
  }
}
