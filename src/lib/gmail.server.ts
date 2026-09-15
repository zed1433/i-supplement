// Server-only Gmail access through the Lovable connector gateway.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

function credentials() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !connectionKey) {
    throw new Error(
      "Gmail is not connected yet. Connect the Google Mail account in Lovable to enable inbox scanning and newsletter sending.",
    );
  }
  return { lovableKey, connectionKey };
}

export function gmailConfigured(): boolean {
  return Boolean(process.env["LOVABLE_API_KEY"] && process.env["GOOGLE_MAIL_API_KEY"]);
}

async function gmail<T>(path: string, init?: RequestInit): Promise<T> {
  const { lovableKey, connectionKey } = credentials();
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connectionKey,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[gmail] request failed [${res.status}] ${path}: ${body}`);
    throw new Error(`Gmail request failed [${res.status}]: ${body}`);
  }
  return (await res.json()) as T;
}

export type GmailHeader = { name: string; value: string };
export type GmailPart = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: { size?: number; data?: string; attachmentId?: string };
  parts?: GmailPart[];
};
export type GmailMessage = {
  id: string;
  threadId: string;
  internalDate?: string;
  snippet?: string;
  payload?: GmailPart;
};

export async function listMessageIds(query: string, maxResults = 20): Promise<string[]> {
  const data = await gmail<{ messages?: { id: string }[] }>(
    `/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
  );
  return (data.messages ?? []).map((m) => m.id);
}

export async function getMessage(id: string): Promise<GmailMessage> {
  return gmail<GmailMessage>(`/users/me/messages/${id}?format=full`);
}

export async function getAttachment(messageId: string, attachmentId: string): Promise<string> {
  const data = await gmail<{ data?: string }>(
    `/users/me/messages/${messageId}/attachments/${attachmentId}`,
  );
  return decodeB64Url(data.data ?? "");
}

export function header(msg: GmailMessage, name: string): string {
  const all = flattenHeaders(msg.payload);
  return all.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function flattenHeaders(part?: GmailPart): GmailHeader[] {
  if (!part) return [];
  return [...(part.headers ?? []), ...(part.parts ?? []).flatMap(flattenHeaders)];
}

export function decodeB64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

/** Best-effort plain-text body of a message. */
export function messageText(msg: GmailMessage): string {
  const parts: string[] = [];
  const walk = (part?: GmailPart) => {
    if (!part) return;
    if (part.body?.data && (part.mimeType === "text/plain" || part.mimeType === "text/html")) {
      const raw = decodeB64Url(part.body.data);
      parts.push(part.mimeType === "text/html" ? stripHtml(raw) : raw);
    }
    (part.parts ?? []).forEach(walk);
  };
  walk(msg.payload);
  const text = parts.join("\n").trim();
  return text || (msg.snippet ?? "");
}

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** CSV/XLSX-ish attachments on a message. */
export function csvAttachments(msg: GmailMessage): { filename: string; attachmentId: string }[] {
  const found: { filename: string; attachmentId: string }[] = [];
  const walk = (part?: GmailPart) => {
    if (!part) return;
    const name = part.filename ?? "";
    if (name && /\.(csv|txt|tsv)$/i.test(name) && part.body?.attachmentId) {
      found.push({ filename: name, attachmentId: part.body.attachmentId });
    }
    (part.parts ?? []).forEach(walk);
  };
  walk(msg.payload);
  return found;
}

const b64 = (s: string) =>
  Buffer.from(new TextEncoder().encode(s)).toString("base64");
const encodeHeader = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);

/**
 * Send a well-formed bulk-safe email: multipart/alternative (plain text +
 * HTML), a readable From display name, and the list headers mail providers
 * expect from legitimate newsletters.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromAddress?: string;
  unsubscribeUrl?: string;
  listId?: string;
}): Promise<void> {
  const boundary = `b_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  let fromAddress = opts.fromAddress;
  if (opts.fromName && !fromAddress) {
    try {
      fromAddress = (await gmailProfile()).emailAddress;
    } catch {
      fromAddress = undefined;
    }
  }
  const from =
    opts.fromName && fromAddress
      ? [`From: ${encodeHeader(opts.fromName)} <${fromAddress}>`]
      : [];

  const listHeaders = opts.unsubscribeUrl
    ? [
        `List-Unsubscribe: <${opts.unsubscribeUrl}>`,
        "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
        ...(opts.listId ? [`List-Id: ${opts.listId}`] : []),
        "Precedence: bulk",
        "Auto-Submitted: auto-generated",
      ]
    : [];

  const text = opts.text ?? stripHtml(opts.html);

  const email = [
    `To: ${opts.to}`,
    ...from,
    `Subject: ${encodeHeader(opts.subject)}`,
    ...listHeaders,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    opts.html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const raw = b64(email).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  await gmail("/users/me/messages/send", { method: "POST", body: JSON.stringify({ raw }) });
}

export async function gmailProfile(): Promise<{ emailAddress: string }> {
  return gmail<{ emailAddress: string }>("/users/me/profile");
}
