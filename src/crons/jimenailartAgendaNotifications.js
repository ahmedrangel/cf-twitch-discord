import { ButtonStyle, ComponentType, RouteBases, Routes } from "discord-api-types/v10";
import { $fetch } from "ofetch";

const sendToDiscord = async (options) => {
  const { channelId, embeds, components, token } = options;
  await $fetch(`${RouteBases.api}${Routes.channelMessages(channelId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bot ${token}`
    },
    body: {
      content: "",
      embeds,
      components
    }
  });
};

export const jimenailartAgendaNotificate = async (env) => {
  const channelIds = ["1186169944510046230", "1400242939476709428"];
  const token = env.DISCORD_GEMICHAN_TOKEN;
  const DB = env.JimeNailArt;
  const now = Date.now();

  const appointment = await DB.prepare(`
    SELECT id, date_start, client_id, final_price, description
    FROM citas 
    WHERE date_start BETWEEN ? AND ? 
      AND notified = 0 
    ORDER BY date_start ASC
  `).bind(now, now + 3600000).first();

  if (!appointment) {
    console.info("No hay citas próximas en la agenda.");
    return;
  }

  const { id, date_start, client_id, final_price, description } = appointment;

  const client = await DB.prepare("SELECT name FROM clientes WHERE id = ?").bind(client_id).first();
  if (!client) return;

  const { name } = client;

  const detallesCita = (await DB.prepare("SELECT service_id FROM detalles_cita WHERE cita_id = ?").bind(id).all())?.results;

  if (!detallesCita || !detallesCita.length) return;

  const services = detallesCita.map(detail => detail.service_id);
  const servicesPlaceholders = services.map(() => "?").join(", ");
  const serviceNames = (await DB.prepare(`SELECT name FROM servicios WHERE id IN (${servicesPlaceholders})`).bind(...services).all())?.results;

  if (!serviceNames || !serviceNames.length) return;

  const serviceList = serviceNames.map(service => `\`${service.name}\``).join(", ");

  const cliente = `**Cliente:** \`${name}\``;
  const descripcion = description ? `**Descripción:** \`${description}\`` : false;
  const servicios = `**Servicios:** ${serviceList}`;
  const hora = `**Hora:** <t:${Math.floor(date_start / 1000)}:R>`;
  const precioFinal = `**Precio Final:** \`$${final_price} ARS\``;

  const embedDescription = [cliente, servicios, hora, precioFinal, descripcion].filter(Boolean).join("\n");

  const embeds = [
    {
      color: 0xf697c8,
      title: ":watch: Próxima Cita",
      description: embedDescription
    }
  ];

  const components = [
    {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          label: "Agenda",
          url: "https://jimevilte-nailart.pages.dev"
        }
      ]
    }
  ];

  await Promise.all(channelIds.map(channelId => sendToDiscord({ channelId, embeds, components, token })));
  await DB.prepare("UPDATE citas SET notified = 1 WHERE id = ?").bind(id).run();
};