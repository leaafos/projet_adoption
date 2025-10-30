import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Organization extends Model<InferAttributes<Organization>, InferCreationAttributes<Organization>> {
  declare organization_id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare address: string;
  declare city: string;
  declare state: string;
  declare postcode: string;
  declare country: string;
  declare hours: string;
  declare url: string;
  declare website: string;
  declare facebook: string;
  declare pinterest: string;
  declare x: string;
  declare youtube: string;
  declare instagram: string;
  declare photos_url: string;

  static initModel(sequelize: Sequelize): typeof Organization {
    Organization.init(
      {
        organization_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(100), allowNull: false },  
        email: { type: DataTypes.STRING(100), allowNull: true },
        phone: { type: DataTypes.STRING(50), allowNull: true },
        address: { type: DataTypes.STRING(255), allowNull: true },
        city: { type: DataTypes.STRING(100), allowNull: true },
        state: { type: DataTypes.STRING(100), allowNull: true },
        postcode: { type: DataTypes.STRING(20), allowNull: true },
        country: { type: DataTypes.STRING(100), allowNull: true },
        hours: { type: DataTypes.STRING(255), allowNull: true },
        url: { type: DataTypes.STRING(255), allowNull: true },
        website: { type: DataTypes.STRING(255), allowNull: true },
        facebook: { type: DataTypes.STRING(255), allowNull: true },
        pinterest: { type: DataTypes.STRING(255), allowNull: true },
        x: { type: DataTypes.STRING(255), allowNull: true },
        youtube: { type: DataTypes.STRING(255), allowNull: true },
        instagram: { type: DataTypes.STRING(255), allowNull: true },
        photos_url: { type: DataTypes.STRING(255), allowNull: true },
      },
      { sequelize, tableName: 'organizations', modelName: 'Organization', timestamps: true }
    );
    return Organization;
  }
}
