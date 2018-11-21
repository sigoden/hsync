const Ajv = require("ajv");

const ajv = new Ajv();

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["connection", "targets"],
  properties: {
    connection: {
      type: "object",
      required: ["host", "port"],
      properties: {
        host: {
          type: "string",
          pattern: "^(.*)$"
        },
        port: {
          type: "integer"
        },
        ssl: {
          type: "object",
          required: ["cert", "key"],
          properties: {
            ca: {
              type: "string"
            },
            cert: {
              type: "string"
            },
            key: {
              type: "string"
            }
          }
        }
      }
    },
    targets: {
      type: "object",
      properties: {
        "^(.*)$": {
          type: "object",
          required: ["target"],
          properties: {
            target: {
              type: "string"
            }
          }
        }
      }
    }
  }
};

const validate = ajv.compile(schema);

module.exports = config => {
  const valid = validate(config);
  if (!valid) {
    throw new Error(
      `verify config failed\n${JSON.stringify(validate.errors, null, 2)}`
    );
  }
};
