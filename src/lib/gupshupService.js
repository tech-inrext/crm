// src/service/gupshupService.js
import axios from "axios";

export async function sendViaGupshup({ to, templateName, parameters }) {
  const payload = {
    channel: "whatsapp",
    source: process.env.GUPSHUP_SOURCE_NUMBER,
    destination: to,
    src: { name: process.env.GUPSHUP_APP_NAME },
    message: {
      type: "template",
      template: {
        namespace: process.env.GUPSHUP_NAMESPACE,
        name: templateName,
        language: {
          policy: "deterministic",
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: parameters.map((text) => ({ type: "text", text })),
          },
        ],
      },
    },
  };

  const headers = {
    "Content-Type": "application/json",
    apikey: process.env.GUPSHUP_API_KEY,
  };

  const response = await axios.post(
    "https://api.gupshup.io/sm/api/v1/msg",
    payload,
    { headers }
  );
  return response.data;
}
