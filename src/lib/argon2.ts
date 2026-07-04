import { hash, verify } from "@node-rs/argon2";

export const hashPasswordFunction = async (
  password: string,
): Promise<string> => {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
};

export const verifyPasswordFunction = async ({
  password,
  hash: hashString,
}: {
  password: string;
  hash: string;
}): Promise<boolean> => {
  return await verify(hashString, password);
};
