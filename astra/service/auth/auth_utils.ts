import { FastifyReply, FastifyRequest } from "fastify";

export const getTokenFromRequest = (
  req: FastifyRequest,
): string | undefined => {
  let token: string | undefined = undefined;
  if (
    req.headers.authorization != null &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split("Bearer ")[1];
  } else if (req.body != null) {
    token = (req.body as Record<string, any>)["token"];
  } else if (req.query != null) {
    token = (req.query as Record<string, any>)["token"];
  }
  if (
    token == null &&
    req.cookies != null &&
    req.cookies["sessionToken"] != null
  ) {
    token = req.cookies["sessionToken"];
  }

  return token;
};

export const removeTokenFromRequest = (
  req: FastifyRequest,
  res: FastifyReply,
): void => {
  res.clearCookie("sessionToken");
  (res.headers as any)["authorization"] = undefined;
};
