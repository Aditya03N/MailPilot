import Conversation from '../../models/Conversation.js';
import ClassificationHistory from '../../models/ClassificationHistory.js';
import EmailAccount from '../../models/EmailAccount.js';
import { emitToTeam } from '../../config/socket.js';

export const generateClientEmailInbox = async (teamId, clientUser) => {
  const clientName = clientUser.name;
  const clientEmail = clientUser.email;
  const domain = clientEmail.includes('@') ? clientEmail.split('@')[1] : 'company.io';

  // Ensure connected email account record exists for client
  let emailAccount = await EmailAccount.findOne({ teamId, clientId: clientUser._id });
  if (!emailAccount) {
    emailAccount = await EmailAccount.create({
      teamId,
      clientId: clientUser._id,
      provider: 'google',
      emailAddress: clientEmail,
      connectionStatus: 'connected',
      isSimulated: true,
      lastSyncedAt: new Date(),
      syncStats: {
        totalSynced: 6,
        unreadCount: 4,
      },
    });
  }

  // Realistic business conversations addressed specifically to this newly joined client
  const emailTemplates = [
    {
      subject: `Executive Budget Approval Request ($35,000) for Q3 Expansion`,
      senderName: "David Sterling (VP Operations)",
      senderEmail: `david.sterling@${domain}`,
      bodyText: `Hi ${clientName},\n\nThe updated Q3 commercial expansion breakdown has been finalized. We need your executive sign-off on the $35,000 infrastructure allocation before Friday so we can lock in vendor terms.\n\nPlease review and let me know if you approve.\n\nBest,\nDavid`,
      aiResponsibility: "CLIENT_TO_REPLY",
      currentResponsibility: "CLIENT_TO_REPLY",
      aiCategory: "FINANCE",
      summary: `David Sterling requested formal executive approval for the $35,000 Q3 infrastructure budget.`,
      reason: `Requires financial commitment and direct executive sign-off from ${clientName}.`,
      suggestedAction: "Review financial breakdown and approve or delegate to PA.",
      confidence: 0.96,
      actionRequired: true,
      isImportant: true,
      isUnread: true,
      extractedDates: [{ title: "Budget Deadline", rawText: "Before Friday" }],
      suggestedReply: `Hi David,\n\nI have reviewed the proposal and approved the $35,000 allocation. Please proceed with the contracts.`,
    },
    {
      subject: `Reschedule Quarterly Strategy Sync to Tomorrow 3:00 PM?`,
      senderName: "Elena Rostova (Partner)",
      senderEmail: "elena@vanguardvc.com",
      bodyText: `Hello ${clientName},\n\nAn unexpected board conflict came up for our planned call. Could we move our strategy sync to tomorrow afternoon at 3:00 PM EST via Google Meet?\n\nLet your assistant know what works for your calendar.\n\nWarmly,\nElena`,
      aiResponsibility: "ASSISTANT_TO_REPLY",
      currentResponsibility: "ASSISTANT_TO_REPLY",
      aiCategory: "MEETINGS",
      summary: `Elena Rostova requested to move the strategy call to tomorrow at 3:00 PM EST.`,
      reason: "Standard calendar scheduling and availability coordination suited for Personal Assistant handling.",
      suggestedAction: `Check ${clientName}'s calendar for 3:00 PM and send updated calendar invite.`,
      confidence: 0.95,
      actionRequired: true,
      isImportant: false,
      isUnread: true,
      extractedDates: [{ title: "Proposed Sync", rawText: "Tomorrow at 3:00 PM EST" }],
      suggestedReply: `Hi Elena,\n\nTomorrow at 3:00 PM EST works seamlessly. I have sent over the updated calendar invitation with the Meet link.\n\nBest regards,\nPersonal Assistant`,
    },
    {
      subject: `Confidential: Outside Counsel Review on Commercial Contract`,
      senderName: "Arthur Vance, Esq. (General Counsel)",
      senderEmail: "avance@wsgr-legal.com",
      bodyText: `Dear ${clientName},\n\nAttached is the revised draft of the Enterprise Master Services Agreement with the liability limitation clause in Section 8.2. Please review this personally before we circulate to counterparties.\n\nRegards,\nArthur Vance`,
      aiResponsibility: "CLIENT_TO_REPLY",
      currentResponsibility: "CLIENT_TO_REPLY",
      aiCategory: "LEGAL",
      summary: `Legal counsel requested personal review of the revised liability clause in Section 8.2.`,
      reason: `Confidential legal contract terms requiring direct client review and authorization.`,
      suggestedAction: "Review clause 8.2 and provide guidance or delegate to PA.",
      confidence: 0.97,
      actionRequired: true,
      isImportant: true,
      isUnread: true,
      suggestedReply: `Hi Arthur,\n\nReceived. I am reviewing the liability limitation and will share our comments directly by tomorrow morning.`,
    },
    {
      subject: `Candidate Interview: Senior Staff Engineer (Final Culture Round)`,
      senderName: "Jessica Lee (Talent Lead)",
      senderEmail: `jessica.lee@${domain}`,
      bodyText: `Hi ${clientName},\n\nCandidate Alex Mercer passed all technical panels. We need to schedule his 30-minute founder culture fit interview. Could your assistant propose 2 available slots on Thursday afternoon?\n\nThanks,\nJessica`,
      aiResponsibility: "ASSISTANT_TO_REPLY",
      currentResponsibility: "ASSISTANT_TO_REPLY",
      aiCategory: "MEETINGS",
      summary: `Jessica Lee requested scheduling for a 30-minute founder culture interview with Alex Mercer.`,
      reason: "Interview scheduling and calendar coordination suitable for Personal Assistant management.",
      suggestedAction: "Propose two 30-minute slots on Thursday afternoon.",
      confidence: 0.94,
      actionRequired: true,
      isImportant: false,
      isUnread: false,
      extractedDates: [{ title: "Interview Slots", rawText: "Thursday afternoon" }],
      suggestedReply: `Hi Jessica,\n\nLet's schedule Alex for Thursday at 2:30 PM EST. I will send the calendar invite.`,
    },
    {
      subject: `Stripe Payment Receipt & Monthly Cloud Statement #INV-88219`,
      senderName: "Stripe Billing",
      senderEmail: "invoicing@stripe.com",
      bodyText: `Your monthly statement for account ending in 4242 has been charged $199.00. Receipt available for download.`,
      aiResponsibility: "NO_REPLY_NEEDED",
      currentResponsibility: "NO_REPLY_NEEDED",
      aiCategory: "NEWSLETTER",
      summary: `Automated Stripe receipt for monthly subscription fee of $199.00.`,
      reason: "System receipt confirming recurring payment. No response required.",
      suggestedAction: "File or mark as completed.",
      confidence: 0.99,
      actionRequired: false,
      isImportant: false,
      isUnread: false,
      status: "completed",
      suggestedReply: "",
    },
    {
      subject: `Speaker Invitation: Keynote at Enterprise AI Summit (San Francisco)`,
      senderName: "Marcus Sterling (Summit Chair)",
      senderEmail: "m.sterling@aisummit.org",
      bodyText: `Dear ${clientName},\n\nWe would be honored to invite you to deliver the morning keynote at the Enterprise AI Summit this October in San Francisco. All travel expenses hosted.\n\nPlease let us know if your schedule allows.\n\nBest,\nMarcus`,
      aiResponsibility: "CLIENT_TO_REPLY",
      currentResponsibility: "CLIENT_TO_REPLY",
      aiCategory: "IMPORTANT",
      summary: `Invitation for ${clientName} to deliver the morning keynote at the Enterprise AI Summit in SF.`,
      reason: "Executive speaking invitation and corporate representation decision.",
      suggestedAction: "Decide whether to accept or ask PA to decline politely.",
      confidence: 0.94,
      actionRequired: true,
      isImportant: true,
      isUnread: true,
      suggestedReply: `Dear Marcus,\n\nThank you for the invitation. I would be glad to attend. My assistant will coordinate logistics.`,
    }
  ];

  const createdConversations = [];

  for (const item of emailTemplates) {
    // Avoid creating duplicates for the exact same subject
    const existing = await Conversation.findOne({
      teamId,
      clientId: clientUser._id,
      subject: item.subject,
    });

    if (existing) {
      createdConversations.push(existing);
      continue;
    }

    const conv = await Conversation.create({
      teamId,
      clientId: clientUser._id,
      emailAccountId: emailAccount._id,
      subject: item.subject,
      participants: [
        { name: item.senderName, email: item.senderEmail, role: 'sender' },
        { name: clientName, email: clientEmail, role: 'client' },
      ],
      messages: [
        {
          senderName: item.senderName,
          senderEmail: item.senderEmail,
          recipientName: clientName,
          recipientEmail: clientEmail,
          bodyText: item.bodyText,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 6)),
          isInbound: true,
        }
      ],
      aiResponsibility: item.aiResponsibility,
      currentResponsibility: item.currentResponsibility,
      aiCategory: item.aiCategory,
      summary: item.summary,
      reason: item.reason,
      suggestedAction: item.suggestedAction,
      confidence: item.confidence,
      actionRequired: item.actionRequired,
      isImportant: item.isImportant,
      isUnread: item.isUnread,
      status: item.status || 'pending',
      extractedDates: item.extractedDates || [],
      suggestedReply: item.suggestedReply || '',
      lastMessageAt: new Date(),
    });

    await ClassificationHistory.create({
      conversationId: conv._id,
      previousResponsibility: null,
      newResponsibility: conv.currentResponsibility,
      changedBy: clientUser._id,
      changeSource: 'AI_CLASSIFICATION',
      reason: conv.reason,
    });

    createdConversations.push(conv);
  }

  // Real-time broadcast to PA and Client in this team
  emitToTeam(teamId, 'client_joined_emails_synced', {
    clientId: clientUser._id,
    clientName: clientUser.name,
    clientEmail: clientUser.email,
    count: createdConversations.length,
  });

  return createdConversations;
};

