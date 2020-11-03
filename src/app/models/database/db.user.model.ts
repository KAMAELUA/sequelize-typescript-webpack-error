import {
    Column,
    DataType,
    Table,
} from "sequelize-typescript";
import {BaseModel} from "./base-model";

@Table({tableName: "TRADER", timestamps: false})
export class UserModel extends BaseModel<UserModel> {
    @Column({type: DataType.STRING, primaryKey: true, autoIncrement: false, field: "TRADER_ID"})
    public id: string;

    @Column({type: DataType.STRING, field: "EMAIL"})
    public email: string;
}
