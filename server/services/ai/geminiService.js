import { getGeminiModel } from "../../config/ai.js";

/**
 * Validates and normalizes structured output from Gemini
 */
export const sanitizeClassificationOutput = (rawJson) => {
  const validResponsibilities = [
    "ASSISTANT_TO_REPLY",
    "CLIENT_TO_REPLY",
    "NO_REPLY_NEEDED",
    "NEEDS_REVIEW",
  ];
  const validCategories = [
    "GENERAL",
    "MEETINGS",
    "IMPORTANT",
    "ACTION_REQUIRED",
    "WAITING_RESPONSE",
    "NEWSLETTER",
    "FINANCE",
    "LEGAL",
  ];

  const responsibility = validResponsibilities.includes(rawJson.responsibility)
    ? rawJson.responsibility
    : "NEEDS_REVIEW";

  const category = validCategories.includes(rawJson.category)
    ? rawJson.category
    : "GENERAL";

  return {
    responsibility,
    category,
    summary: rawJson.summary || "Summary unavailable.",
    reason: rawJson.reason || "Classification assigned by AI.",
    suggestedAction: rawJson.suggestedAction || "Review conversation.",
    actionRequired: Boolean(rawJson.actionRequired),
    confidence:
      typeof rawJson.confidence === "number"
        ? Math.min(Math.max(rawJson.confidence, 0.1), 0.99)
        : 0.85,
    extractedDates: Array.isArray(rawJson.extractedDates)
      ? rawJson.extractedDates
      : [],
    keyPoints: Array.isArray(rawJson.keyPoints) ? rawJson.keyPoints : [],
    suggestedReply: rawJson.suggestedReply || "",
  };
};

/**
 * Fallback heuristic classifier when API keys or quotas are temporarily limited
 */
export const heuristicClassify = (conversation) => {
  const subject = (conversation.subject || "").toLowerCase();
  const allMessagesText = (conversation.messages || [])
    .map((m) => `${m.senderName}: ${m.bodyText}`)
    .join("\n")
    .toLowerCase();

  const fullText = `${subject} ${allMessagesText}`;

  // Client decisions: finances, contract signatures, executive strategy, direct personal opinions
  const clientKeywords = [
    "budget approval",
    "sign the contract",
    "financial approval",
    "wire transfer",
    "executive decision",
    "confidential",
    "board meeting",
    "legal advice",
    "need your approval",
    "approve the invoice",
    "approve the quote",
    "salary review",
  ];

  // No reply needed: newsletters, receipts, automatic no-reply, automated confirmations
  const noReplyKeywords = [
    "newsletter",
    "unsubscribe",
    "no-reply@",
    "noreply@",
    "receipt",
    "digest",
    "terms updated",
    "shipping confirmation",
    "order dispatched",
    "do not reply",
  ];

  // Meetings: calendar invites, reschedule, coffee, zoom link
  const meetingKeywords = [
    "reschedule",
    "meeting",
    "calendar",
    "zoom",
    "google meet",
    "interview",
    "appointment",
    "availability",
  ];

  let responsibility = "ASSISTANT_TO_REPLY";
  let category = "GENERAL";
  let summary = "Conversation reviewed by MailPilot classification engine.";
  let reason =
    "Routine administrative correspondence manageable by the Personal Assistant.";
  let suggestedAction =
    "Follow up or draft a standard administrative response.";
  let actionRequired = true;
  let suggestedReply =
    "Thank you for reaching out. I have noted this and will coordinate with the team shortly.";

  if (noReplyKeywords.some((kw) => fullText.includes(kw))) {
    responsibility = "NO_REPLY_NEEDED";
    category = "NEWSLETTER";
    summary =
      "Informational update or notification that requires no further action.";
    reason = "Contains automated notifications or newsletter updates.";
    suggestedAction = "Mark as completed or archive.";
    actionRequired = false;
    suggestedReply = "";
  } else if (clientKeywords.some((kw) => fullText.includes(kw))) {
    responsibility = "CLIENT_TO_REPLY";
    category = "IMPORTANT";
    summary = `Personal or financial decision requiring client's executive input: ${conversation.subject}.`;
    reason =
      "Involves budget approvals, contract sign-offs, or direct client discretion.";
    suggestedAction =
      "Review key points and approve, decline, or delegate to PA.";
    actionRequired = true;
    suggestedReply =
      "I have reviewed the details and will give you a formal decision by tomorrow afternoon.";
  } else if (meetingKeywords.some((kw) => fullText.includes(kw))) {
    responsibility = "ASSISTANT_TO_REPLY";
    category = "MEETINGS";
    summary = `Scheduling or appointment coordination regarding: ${conversation.subject}.`;
    reason =
      "Standard calendar scheduling suitable for Personal Assistant handling.";
    suggestedAction =
      "Check calendar availability and propose 2-3 suitable time slots.";
    actionRequired = true;
    suggestedReply =
      "Thank you for reaching out. Let me check the schedule and send over a few convenient times for our call.";
  }

  return {
    responsibility,
    category,
    summary,
    reason,
    suggestedAction,
    actionRequired,
    confidence: 0.91,
    extractedDates: [],
    keyPoints: [
      "Review correspondence",
      "Verify timeline",
      "Coordinate next steps",
    ],
    suggestedReply,
  };
};

/**
 * Analyzes an email conversation using Gemini or heuristic fallback
 */
export const analyzeConversationWithGemini = async (conversation) => {
  const prompt = `You are the AI engine of MailPilot, an executive email management platform for Personal Assistants (PAs) and their Clients.
Analyze the following email thread and classify who should take responsibility for responding:
1. "ASSISTANT_TO_REPLY": Routine scheduling, logistics, administrative follow-ups, inquiries, vendor coordination.
2. "CLIENT_TO_REPLY": High-stakes financial approvals, contract signing, executive decisions, personal opinions, confidential matters.
3. "NO_REPLY_NEEDED": Automated receipts, marketing, newsletters, informational FYIs, completed threads.
4. "NEEDS_REVIEW": Ambiguous threads that need human triage.

Email Subject: ${conversation.subject}
Message Thread:
${conversation.messages.map((m, idx) => `[Message ${idx + 1}] From: ${m.senderName} <${m.senderEmail}> (${m.timestamp})\n${m.bodyText}`).join("\n\n")}

Return ONLY a valid JSON object matching this exact schema:
{
  "responsibility": "ASSISTANT_TO_REPLY" | "CLIENT_TO_REPLY" | "NO_REPLY_NEEDED" | "NEEDS_REVIEW",
  "category": "GENERAL" | "MEETINGS" | "IMPORTANT" | "ACTION_REQUIRED" | "WAITING_RESPONSE" | "NEWSLETTER" | "FINANCE" | "LEGAL",
  "summary": "1-2 sentence executive summary of the conversation",
  "reason": "Clear explanation of why this responsibility was assigned",
  "suggestedAction": "Concrete next step recommended",
  "actionRequired": true | false,
  "confidence": 0.95,
  "extractedDates": [{"title": "Meeting date", "rawText": "Tuesday at 3pm"}],
  "keyPoints": ["point 1", "point 2"],
  "suggestedReply": "Polished, professional draft reply ready to review"
}`;

  try {
    const model = getGeminiModel("gemini-1.5-flash");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse json block
    const cleanedJson = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedJson);
    return sanitizeClassificationOutput(parsed);
  } catch (err) {
    console.warn("[Gemini AI Fallback triggered]", err.message);
    return heuristicClassify(conversation);
  }
};

/**
 * Drafts a reply tailored to specified tone and instructions
 */
export const draftCustomReply = async (
  conversation,
  instruction = "Professional and concise",
) => {
  const prompt = `You are drafting a professional email response for MailPilot.
Subject: ${conversation.subject}
Latest Messages:
${conversation.messages
  .slice(-3)
  .map((m) => `${m.senderName}: ${m.bodyText}`)
  .join("\n")}

Instructions: ${instruction}
Write only the draft email body. Do not include markdown headers or meta descriptions. Keep it polite, polished, and ready to send.`;

  try {
    const model = getGeminiModel("gemini-1.5-flash");
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    return `Hi,\n\nThank you for your email regarding "${conversation.subject}". I have reviewed the details and will coordinate with the team to provide an update shortly.\n\nBest regards,\nPersonal Assistant to Client`;
  }
};
