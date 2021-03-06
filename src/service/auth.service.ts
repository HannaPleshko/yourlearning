import bcrypt from 'bcrypt';
import { ExceptionType } from '../exception/exception';
import { ErrorHandler } from '../helpers/error';
import { createToken } from '../helpers/jwt';
import { createUser, getUser, getUsersDB, delUser } from '../repository/auth.repository';

const saltround = 10;

export const regUser = async (email: string, name: string, surname: string, role: number, pwd: string): Promise<iAuth> => {
  const user = await getUser(email).catch((err) => {
    throw err;
  });

  if (user) throw new ErrorHandler(500, ExceptionType.USER_EXISTS);

  const hashPwd = await bcrypt.hash(pwd, saltround);
  const newUser = await createUser(email, name, surname, hashPwd, role).catch((err) => {
    throw err;
  });

  if (!newUser) throw new ErrorHandler(404, ExceptionType.NOT_FOUND);
  return newUser;
};

export const authUser = async (email: string, pwd: string): Promise<iAuth> => {
  const user = await getUser(email).catch((err) => {
    throw err;
  });

  if (!user) throw new ErrorHandler(404, ExceptionType.NOT_FOUND);
  if (user.role === 1 || user.role === 2 || user.role === 0) {
    const hashPwd = user.password;
    if (!(await bcrypt.compare(pwd, hashPwd))) throw new ErrorHandler(500, ExceptionType.WRONG_PASSWORD);
    return user;
  } else throw new ErrorHandler(500, ExceptionType.USER_INACTIVE);
};

export const getUsers = async (): Promise<iAuth[]> => {
  const users = await getUsersDB().catch((err) => {
    throw err;
  });

  if (!users) throw new ErrorHandler(404, ExceptionType.NOT_FOUND);
  return users;
};

export const deleteUser = async (email: string): Promise<iAuth> => {
  // Changes the user's status. 0 - active, 1 - del
  const user = await delUser(email).catch((err) => {
    throw err;
  });
  if (!user) throw new ErrorHandler(404, ExceptionType.NOT_FOUND);
  return user;
};
