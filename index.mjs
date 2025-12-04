import Fastify from "fastify";
import { z } from "zod";
import nodemailer from "nodemailer";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", async function handler(request, reply) {
  return reply.send("Welcome to Mail lib");
});

fastify.get("/ping", async function handler(request, reply) {
  return reply.send("pong");
});

fastify.post("/sendMail", async function handler(request, reply) {
  const SendMailBody = z.object({
    from: z.string().email("Invalid email format"),
    to: z.string().email("Invalid email format"),
    subject: z.string(),
    html: z.string(),
  });

  if (
    !request.headers["x-hexagn-header"] ||
    request.headers["x-hexagn-header"] !== process.env.HEADER
  )
    return reply.send({ success: false, message: ["Invalid Header"] });

  const transporter = nodemailer.createTransport({
    url: process.env.SMTP_TRANSPORT,
  });

  const data = request.body;

  const valid = SendMailBody.safeParse(data);

  if (!valid.success)
    return reply.send({
      success: false,
      message: valid.error.issues.map((error) => `${error.message}: ${error.path[0]}`),
    });

  try {
    await transporter.sendMail(data);
    return reply.send({ success: true, message: ["mail sent"] });
  } catch (error) {
    return reply.send({ success: false, message: [error.message] });
  }
});

// Run the server!
try {
  await fastify.listen({ port: 3002, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
