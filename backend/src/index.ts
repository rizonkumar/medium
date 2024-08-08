import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";

const app = new Hono();

app.post("/api/v1/signup", async (c) => {
  try {
    const prisma = new PrismaClient({
      //@ts-ignore
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name, // Add this line
      },
    });

    //@ts-ignore
    const token = await sign({ id: user.id }, c.env.JWT_TOKEN);
    return c.json({ jwt: token });
  } catch (error) {
    console.error("Error in signup:", error);
    //@ts-ignore
    return c.json({ error: error.message }, 500);
  }
});

app.post("/api/v1/signin", async (c) => {
  const prisma = new PrismaClient({
    //@ts-ignore
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    },
  });

  if (!user) {
    c.status(403);
    return c.json({ error: "User not available" });
  }

  //@ts-ignore
  const jwt = await sign({ id: user.id }, c.env.JWT_TOKEN);
  return c.json({ jwt });
});

app.post("/api/v1/blog", (c) => {
  return c.text("Hello World");
});

app.put("/api/v1/signup", (c) => {
  return c.text("Hello World");
});

app.get("/api/v1/signup/:id", (c) => {
  return c.text("Hello World");
});

export default app;
