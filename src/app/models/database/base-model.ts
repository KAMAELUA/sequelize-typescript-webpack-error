import {Model} from "sequelize-typescript";

export class BaseModel<T = any, T2 = any> extends Model<T, T2> {
    private encoder = new TextEncoder();
    public encode = this.encoder.encode.bind(this.encoder);
}
