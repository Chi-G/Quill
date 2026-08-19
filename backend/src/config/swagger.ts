import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quill — Modular Content Publishing Engine API",
      version: "1.0.0",
      description:
        "Production-grade, modular, TypeScript-first Headless CMS & Content Publishing Engine API.",
    },
    servers: [
      {
        url: "http://localhost:8000/api/v1",
        description: "Local Development Server (v1)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./backend/src/routes/v1/*.ts",
    "./backend/src/routes/v1/*.js",
    "./backend/src/controllers/*.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
