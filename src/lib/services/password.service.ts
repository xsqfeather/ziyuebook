import bcrypt from "bcrypt";
import { Service } from "typedi";

const saltRounds = 10;

@Service()
export class PasswordService {
  generateHash(plantPassword: string) {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(plantPassword, salt);
    return hash;
  }

  checkHash(plantPassword: string, hash: string) {
    return bcrypt.compareSync(plantPassword, hash);
  }
}
