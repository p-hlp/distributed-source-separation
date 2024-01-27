import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const createUser = async (auth0Id: string) => {
  return await prisma.user.create({
    data: {
      auth0Id,
    },
  });
};

const getUser = async (auth0Id: string) => {
  return await prisma.user.findUnique({
    where: { auth0Id },
  });
};

export const createOrAddUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    if (!auth0Id) return res.status(401).send("Unauthorized");

    const user = await getUser(auth0Id);
    console.log("trying to find user", user);
    if (user) {
      req.user = user; // Attach user to the request object
      next();
    } else {
      const newUser = await createUser(auth0Id);
      console.log("new user", newUser);
      req.user = newUser; // Attach user to the request object
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
