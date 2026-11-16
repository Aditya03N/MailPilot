import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Team from '../models/Team.js';
import EmailAccount from '../models/EmailAccount.js';
import Conversation from '../models/Conversation.js';
import ClassificationHistory from '../models/ClassificationHistory.js';
import Handover from '../models/Handover.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Starting database cleanup and seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Team.deleteMany({});
    await EmailAccount.deleteMany({});
    await Conversation.deleteMany({});
    await ClassificationHistory.deleteMany({});
    await Handover.deleteMany({});

    console.log('[Seed] Cleaned old records.');

    // 1. Create Temporary Assistant ObjectId
    const assistantId = new mongoose.Types.ObjectId();
    const clientId = new mongoose.Types.ObjectId();
    const teamId = new mongoose.Types.ObjectId();

    // 2. Create Workspace
    const team = await Team.create({
      _id: teamId,
      name: "Aditya's Workspace",
      teamCode: "MAIL-8X92K",
      createdBy: assistantId,
      createdAt: new Date(),
    });

    // 3. Create Users
    // Demo password: "password123"
    const assistantUser = await User.create({
      _id: assistantId,
      name: "Aditya Anande (PA)",
      email: "assistant@demo.com",
      password: "password123",
      role: "assistant",
      teamId: team._id,
      membershipStatus: "active",
      title: "Executive Personal Assistant",
    });

    const clientUser = await User.create({
      _id: clientId,
      name: "Sarah Jenkins (CEO)",
      email: "client@demo.com",
      password: "password123",
      role: "client",
      teamId: team._id,
      membershipStatus: "active",
      title: "Founder & Chief Executive Officer",
    });

    console.log('[Seed] Created Team & Users (assistant@demo.com, client@demo.com)');

    // 3. Create Connected Email Account
    const emailAccount = await EmailAccount.create({
      teamId: team._id,
      clientId: clientUser._id,
      provider: 'google',
      emailAddress: 'sarah.jenkins@acmecorp.io',
      connectionStatus: 'connected',
      isSimulated: true,
      lastSyncedAt: new Date(),
      syncStats: {
        totalSynced: 18,
        unreadCount: 7,
      },
    });

    // 4. Create 18 Realistic Conversations
    const rawConversations = [
      {
        subject: "Q3 Marketing Budget Approval Request ($45,000)",
        participants: [
          { name: "Marcus Vance", email: "marcus.v@acmecorp.io", role: "VP Marketing" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Marcus Vance",
            senderEmail: "marcus.v@acmecorp.io",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Hi Sarah,\n\nWe have finalized the Q3 growth marketing strategy. The updated budget proposal is attached and comes to $45,000 for paid acquisition and influencer partnerships. We need your formal executive sign-off before Friday so we can secure the agency contract.\n\nCould you review and confirm if this meets your approval?\n\nBest,\nMarcus",
            timestamp: new Date(Date.now() - 1000 * 60 * 35),
            isInbound: true,
          }
        ],
        aiResponsibility: "CLIENT_TO_REPLY",
        currentResponsibility: "CLIENT_TO_REPLY",
        aiCategory: "IMPORTANT",
        summary: "Marcus Vance requested formal executive approval for the $45,000 Q3 marketing budget before Friday.",
        reason: "Requires executive financial decision and direct monetary commitment from the client.",
        suggestedAction: "Review budget allocation and approve or delegate to PA for breakdown.",
        confidence: 0.96,
        actionRequired: true,
        isImportant: true,
        isUnread: true,
        extractedDates: [{ title: "Approval Deadline", date: new Date(Date.now() + 1000 * 60 * 60 * 48), rawText: "Before Friday" }],
        keyPoints: ["Budget amount: $45,000", "Deadline: Friday", "Requires formal executive sign-off"],
        suggestedReply: "Hi Marcus, I have reviewed the Q3 marketing budget proposal. The $45,000 allocation is approved. Please proceed with the agency contracts.",
      },
      {
        subject: "Reschedule Strategy Sync to Thursday 2:00 PM?",
        participants: [
          { name: "Elena Rostova", email: "elena@vanguardpartners.vc", role: "Partner" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Elena Rostova",
            senderEmail: "elena@vanguardpartners.vc",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Hi Sarah,\n\nAn unexpected board conflict came up for our Wednesday slot. Would you or your assistant be open to moving our quarterly sync to Thursday afternoon at 2:00 PM EST via Google Meet?\n\nLet me know what works for your calendar.\n\nWarm regards,\nElena",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            isInbound: true,
          }
        ],
        aiResponsibility: "ASSISTANT_TO_REPLY",
        currentResponsibility: "ASSISTANT_TO_REPLY",
        aiCategory: "MEETINGS",
        summary: "Elena Rostova requested to move the quarterly sync from Wednesday to Thursday at 2:00 PM EST.",
        reason: "Routine calendar scheduling and availability coordination best handled by the Personal Assistant.",
        suggestedAction: "Check Sarah's calendar for Thursday 2:00 PM EST and confirm the invite.",
        confidence: 0.95,
        actionRequired: true,
        isImportant: false,
        isUnread: true,
        extractedDates: [{ title: "Proposed Sync", date: new Date(Date.now() + 1000 * 60 * 60 * 24), rawText: "Thursday afternoon at 2:00 PM EST" }],
        keyPoints: ["Move quarterly sync to Thursday 2:00 PM EST", "Platform: Google Meet", "Routine schedule shift"],
        suggestedReply: "Hi Elena,\n\nThank you for checking in. Thursday at 2:00 PM EST works seamlessly on Sarah's calendar. I have updated the calendar invitation accordingly with the Google Meet link.\n\nBest regards,\nAditya (Personal Assistant)",
      },
      {
        subject: "Stripe Monthly Billing Receipt & Statement #INV-92819",
        participants: [
          { name: "Stripe Billing", email: "invoicing@stripe.com", role: "Notification" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Stripe Billing",
            senderEmail: "invoicing@stripe.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Your monthly invoice of $249.00 for Acme Corp has been automatically charged to card ending in 4242. View invoice details in your dashboard.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
            isInbound: true,
          }
        ],
        aiResponsibility: "NO_REPLY_NEEDED",
        currentResponsibility: "NO_REPLY_NEEDED",
        aiCategory: "NEWSLETTER",
        summary: "Automated Stripe receipt for monthly subscription fee of $249.00.",
        reason: "System-generated notification confirming completed payment. No action required.",
        suggestedAction: "Archive or file for accounting.",
        confidence: 0.99,
        actionRequired: false,
        isImportant: false,
        isUnread: false,
        status: "completed",
        keyPoints: ["Amount: $249.00", "Paid via Visa 4242", "Automated receipt"],
        suggestedReply: "",
      },
      {
        subject: "Confidential: Series B Term Sheet Discussion & Legal Counsel",
        participants: [
          { name: "David Chen", email: "dchen@sequoiacap.com", role: "Lead Partner" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "David Chen",
            senderEmail: "dchen@sequoiacap.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Sarah,\n\nOur investment committee gave preliminary greenlight on the Series B terms. Attached is the revised valuation and liquidation preference clause. Please review section 4.2 with your outside counsel and let me know your thoughts personally before we circulate to co-investors.\n\nDavid",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
            isInbound: true,
          }
        ],
        aiResponsibility: "CLIENT_TO_REPLY",
        currentResponsibility: "CLIENT_TO_REPLY",
        aiCategory: "LEGAL",
        summary: "David Chen shared confidential Series B term sheet revisions regarding valuation and liquidation preferences.",
        reason: "Sensitive corporate governance and venture financing matter that strictly requires client discretion.",
        suggestedAction: "Review section 4.2 with counsel and send personal feedback to David.",
        confidence: 0.98,
        actionRequired: true,
        isImportant: true,
        isUnread: true,
        keyPoints: ["Series B terms", "Confidential clause 4.2", "Review with outside counsel"],
        suggestedReply: "Hi David, received. I will review section 4.2 with our counsel tomorrow morning and get back to you with our notes directly.",
      },
      {
        subject: "Flight Confirmation: San Francisco (SFO) to New York (JFK) - Delta DL482",
        participants: [
          { name: "Delta Air Lines", email: "ticketreceipt@delta.com", role: "Airline" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Delta Air Lines",
            senderEmail: "ticketreceipt@delta.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Confirmation #H7K92L. Departure: Monday 8:30 AM SFO -> Arrival: 5:15 PM JFK. Seat 3B (First Class). Electronic boarding pass will be available 24 hours prior.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
            isInbound: true,
          }
        ],
        aiResponsibility: "NO_REPLY_NEEDED",
        currentResponsibility: "NO_REPLY_NEEDED",
        aiCategory: "GENERAL",
        summary: "Flight confirmation for Sarah's trip from SFO to JFK on Monday morning (Seat 3B).",
        reason: "Informational travel booking confirmation. No reply needed; assistant can add to master itinerary.",
        suggestedAction: "Log flight details into Sarah's travel itinerary calendar.",
        confidence: 0.97,
        actionRequired: false,
        isImportant: false,
        isUnread: false,
        extractedDates: [{ title: "Flight SFO->JFK", date: new Date(Date.now() + 1000 * 60 * 60 * 72), rawText: "Monday 8:30 AM" }],
        keyPoints: ["Delta Flight DL482", "Confirmation: H7K92L", "Seat: 3B"],
        suggestedReply: "",
      },
      {
        subject: "Vendor Follow-up: Office Ergonomic Furniture Quote Revision",
        participants: [
          { name: "Rachel Gomez", email: "rachel@hermanmiller-partners.com", role: "Account Exec" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Rachel Gomez",
            senderEmail: "rachel@hermanmiller-partners.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Hello,\n\nFollowing up on our quote for 25 Aeron chairs and standing desks. We applied the 15% corporate discount we discussed. Could you let us know if we should deliver next Monday or hold off until your new floor opens?\n\nThanks,\nRachel",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16),
            isInbound: true,
          }
        ],
        aiResponsibility: "ASSISTANT_TO_REPLY",
        currentResponsibility: "ASSISTANT_TO_REPLY",
        aiCategory: "ACTION_REQUIRED",
        summary: "Rachel Gomez is requesting delivery date confirmation for the discounted office furniture order.",
        reason: "Operational procurement coordination that the PA can handle directly.",
        suggestedAction: "Confirm delivery window with facilities and reply to Rachel.",
        confidence: 0.93,
        actionRequired: true,
        isImportant: false,
        isUnread: true,
        keyPoints: ["25 Aeron chairs with 15% discount", "Delivery coordination needed"],
        suggestedReply: "Hi Rachel, thanks for applying the discount. Please schedule delivery for next Monday between 10am-2pm with our loading dock manager. Best, Aditya.",
      },
      {
        subject: "Keynote Speaker Invitation: TechSummit Global London (November)",
        participants: [
          { name: "Oliver Sterling", email: "oliver@techsummit.org", role: "Program Director" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Oliver Sterling",
            senderEmail: "oliver@techsummit.org",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Dear Sarah,\n\nOn behalf of TechSummit Global, we would be delighted to invite you as our opening keynote speaker in London this November. The topic is 'Autonomous AI in Enterprise Operations'. All travel and accommodations will be hosted by us.\n\nPlease let us know if your schedule allows you to accept.\n\nWarmly,\nOliver",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
            isInbound: true,
          }
        ],
        aiResponsibility: "CLIENT_TO_REPLY",
        currentResponsibility: "CLIENT_TO_REPLY",
        aiCategory: "IMPORTANT",
        summary: "Invitation to deliver the opening keynote at TechSummit Global London this November.",
        reason: "Personal speaking invitation and public representation decision requiring client interest check.",
        suggestedAction: "Decide whether to accept London keynote or decline politely.",
        confidence: 0.94,
        actionRequired: true,
        isImportant: true,
        isUnread: true,
        keyPoints: ["TechSummit London Keynote", "All travel covered", "November timeline"],
        suggestedReply: "Dear Oliver, thank you for the generous invitation. I would love to explore this keynote. My assistant Aditya will connect to coordinate dates and logistics.",
      },
      {
        subject: "Substack: The Pragmatic Engineer Weekly #142",
        participants: [
          { name: "Gergely Orosz", email: "newsletter@pragmaticengineer.com", role: "Newsletter" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Gergely Orosz",
            senderEmail: "newsletter@pragmaticengineer.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "In this edition: Benchmarking modern AI agent frameworks in production, compensation trends in tech, and lessons from building reliable high-throughput backends.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            isInbound: true,
          }
        ],
        aiResponsibility: "NO_REPLY_NEEDED",
        currentResponsibility: "NO_REPLY_NEEDED",
        aiCategory: "NEWSLETTER",
        summary: "Weekly software engineering industry newsletter edition #142.",
        reason: "Educational newsletter. No response expected.",
        suggestedAction: "Archive or save to reading list.",
        confidence: 0.99,
        actionRequired: false,
        isImportant: false,
        isUnread: false,
        status: "completed",
        keyPoints: ["AI agent frameworks in production", "Compensation trends"],
        suggestedReply: "",
      },
      {
        subject: "Coffee Catch-up: Alex Rivera (Head of Product at Figma)",
        participants: [
          { name: "Alex Rivera", email: "arivera@figma.com", role: "Head of Product" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Alex Rivera",
            senderEmail: "arivera@figma.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Hey Sarah, it has been too long since our Stanford days! I will be in town next Tuesday and would love to grab coffee around downtown to trade notes on AI workflows. Any chance you're free for 30 minutes in the morning?\n\nBest,\nAlex",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28),
            isInbound: true,
          }
        ],
        aiResponsibility: "ASSISTANT_TO_REPLY",
        currentResponsibility: "ASSISTANT_TO_REPLY",
        aiCategory: "MEETINGS",
        summary: "Alex Rivera wants to grab a casual 30-min coffee next Tuesday morning downtown.",
        reason: "Informal networking and coffee meeting; PA can check calendar and suggest a venue.",
        suggestedAction: "Propose 10:00 AM coffee slot at Blue Bottle downtown.",
        confidence: 0.92,
        actionRequired: true,
        isImportant: false,
        isUnread: false,
        extractedDates: [{ title: "Coffee Catch-up", date: new Date(Date.now() + 1000 * 60 * 60 * 96), rawText: "Next Tuesday morning" }],
        keyPoints: ["Alex Rivera (Figma Head of Product)", "Tuesday morning coffee", "30 minutes downtown"],
        suggestedReply: "Hi Alex, Sarah would love to catch up! How does 10:00 AM next Tuesday at Blue Bottle Coffee on Market St sound for you? Looking forward to setting this up.",
      },
      {
        subject: "URGENT: Outstanding Legal Retainer Invoice #7819 ($12,500)",
        participants: [
          { name: "Wilson Sonsini Accounting", email: "billing@wsgr.com", role: "Finance" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Wilson Sonsini Accounting",
            senderEmail: "billing@wsgr.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Dear Ms. Jenkins,\n\nOur records indicate invoice #7819 for $12,500 covering intellectual property filing counsel is now 15 days past due. Please confirm wire transfer or provide accounts payable contact.\n\nThank you.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 32),
            isInbound: true,
          }
        ],
        aiResponsibility: "CLIENT_TO_REPLY",
        currentResponsibility: "CLIENT_TO_REPLY",
        aiCategory: "FINANCE",
        summary: "Wilson Sonsini legal retainer invoice #7819 for $12,500 is 15 days past due.",
        reason: "Requires urgent client confirmation of corporate payment authorization.",
        suggestedAction: "Authorize wire payment or instruct assistant to route to finance department.",
        confidence: 0.96,
        actionRequired: true,
        isImportant: true,
        isUnread: true,
        keyPoints: ["Invoice #7819", "Amount: $12,500", "15 days overdue", "IP filing services"],
        suggestedReply: "Hello, I have authorized this wire transfer today. Our finance manager will send over the transfer confirmation receipt within the hour.",
      },
      {
        subject: "Candidate Interview Scheduling: Senior AI Research Engineer (Candidate: Kai Lin)",
        participants: [
          { name: "Liam Cooper", email: "liam@recruitingpartners.io", role: "Recruiter" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Liam Cooper",
            senderEmail: "liam@recruitingpartners.io",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Hi Sarah,\n\nKai Lin passed the technical challenge with top marks. We'd like to book his 45-minute executive culture fit interview with you. He is available Thursday after 3 PM or Friday anytime before 1 PM.\n\nPlease share what works.\n\nThanks,\nLiam",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
            isInbound: true,
          }
        ],
        aiResponsibility: "ASSISTANT_TO_REPLY",
        currentResponsibility: "ASSISTANT_TO_REPLY",
        aiCategory: "MEETINGS",
        summary: "Liam Cooper is requesting a 45-minute executive interview slot with candidate Kai Lin.",
        reason: "Candidate interview coordination suited for assistant scheduling.",
        suggestedAction: "Book Friday at 11:00 AM on Sarah's calendar and reply to recruiter.",
        confidence: 0.94,
        actionRequired: true,
        isImportant: false,
        isUnread: true,
        extractedDates: [{ title: "Kai Lin Interview", date: new Date(Date.now() + 1000 * 60 * 60 * 50), rawText: "Friday anytime before 1 PM" }],
        keyPoints: ["Senior AI Research candidate", "45-minute interview", "Friday morning preferred"],
        suggestedReply: "Hi Liam, let's schedule Kai's interview for Friday at 11:00 AM PST. I will send over the calendar invite and Zoom link shortly.",
      },
      {
        subject: "AWS Cloud Infrastructure Monthly Usage Summary ($1,438.12)",
        participants: [
          { name: "Amazon Web Services", email: "no-reply-aws@amazon.com", role: "Cloud" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Amazon Web Services",
            senderEmail: "no-reply-aws@amazon.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Your AWS billing report for Account 8392-1920 is available. Total accrued charges for the current billing cycle: $1,438.12. No further action is required.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40),
            isInbound: true,
          }
        ],
        aiResponsibility: "NO_REPLY_NEEDED",
        currentResponsibility: "NO_REPLY_NEEDED",
        aiCategory: "NEWSLETTER",
        summary: "AWS cloud hosting monthly billing notification ($1,438.12).",
        reason: "Standard informational billing report with automated charge.",
        suggestedAction: "Log monthly cloud infrastructure costs.",
        confidence: 0.98,
        actionRequired: false,
        isImportant: false,
        isUnread: false,
        keyPoints: ["Account 8392-1920", "Cost: $1,438.12"],
        suggestedReply: "",
      },
      {
        subject: "Partnership Proposal: Enterprise Distribution with Salesforce AppExchange",
        participants: [
          { name: "Chloe Bennett", email: "cbennett@salesforce.com", role: "Alliances VP" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Chloe Bennett",
            senderEmail: "cbennett@salesforce.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Hi Sarah,\n\nWe love what your team is building with intelligent inbox workflows. Salesforce Alliances would like to propose a co-marketing and integration partnership on AppExchange for enterprise customers. Let us know if you'd be open to an introductory discussion.\n\nBest,\nChloe Bennett",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
            isInbound: true,
          }
        ],
        aiResponsibility: "CLIENT_TO_REPLY",
        currentResponsibility: "CLIENT_TO_REPLY",
        aiCategory: "IMPORTANT",
        summary: "Salesforce Alliances proposes enterprise co-marketing and distribution partnership on AppExchange.",
        reason: "Strategic business partnership opportunity requiring founder evaluation.",
        suggestedAction: "Decide whether to explore Salesforce AppExchange distribution partnership.",
        confidence: 0.93,
        actionRequired: true,
        isImportant: true,
        isUnread: false,
        keyPoints: ["Salesforce AppExchange co-marketing", "Strategic partnership", "Enterprise tier"],
        suggestedReply: "Hi Chloe, thank you for reaching out. We see high alignment here and would be glad to explore an AppExchange integration. Let me loop in my assistant to coordinate our introductory call.",
      },
      {
        subject: "Action Required: DocuSign Commercial Lease Amendment for 4th Floor Expansion",
        participants: [
          { name: "DocuSign System", email: "dse@docusign.net", role: "System" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "DocuSign System",
            senderEmail: "dse@docusign.net",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Beacon Capital Properties has sent you 'Acme Corp - 4th Floor Lease Amendment 2026.pdf' for electronic signature. Please review lease terms and sign.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 55),
            isInbound: true,
          }
        ],
        aiResponsibility: "CLIENT_TO_REPLY",
        currentResponsibility: "CLIENT_TO_REPLY",
        aiCategory: "LEGAL",
        summary: "DocuSign request for signature on commercial lease amendment for the 4th-floor office expansion.",
        reason: "Binding legal contract signature strictly reserved for client.",
        suggestedAction: "Review square footage terms and execute electronic signature.",
        confidence: 0.97,
        actionRequired: true,
        isImportant: true,
        isUnread: true,
        keyPoints: ["Commercial lease amendment", "DocuSign electronic signature needed", "4th floor expansion"],
        suggestedReply: "Executed via DocuSign today. Looking forward to our expansion move.",
      },
      {
        subject: "Weekly Engineering Sprint Summary: v2.4 Feature Release Delivered",
        participants: [
          { name: "Dev Team Lead", email: "tariq@acmecorp.io", role: "Lead Engineer" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Dev Team Lead",
            senderEmail: "tariq@acmecorp.io",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Sarah,\n\nv2.4 is live on production with 99.98% uptime. All 14 customer-reported bugs from last week have been resolved. Next sprint starts Monday focusing on Gemini AI latency improvements.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 60),
            isInbound: true,
          }
        ],
        aiResponsibility: "NO_REPLY_NEEDED",
        currentResponsibility: "NO_REPLY_NEEDED",
        aiCategory: "GENERAL",
        summary: "Weekly sprint recap reporting v2.4 production deployment and 99.98% uptime.",
        reason: "Internal status update report requiring no immediate reply.",
        suggestedAction: "Acknowledge in weekly staff standup if needed.",
        confidence: 0.95,
        actionRequired: false,
        isImportant: false,
        isUnread: false,
        keyPoints: ["v2.4 deployed", "14 bugs closed", "Gemini latency next sprint"],
        suggestedReply: "Great work team on the clean release!",
      },
      {
        subject: "Advisory Board Dinner at Quince (SF) - RSVP Confirmation",
        participants: [
          { name: "Harrison Cole", email: "hcole@luminaadvisors.com", role: "Host" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Harrison Cole",
            senderEmail: "hcole@luminaadvisors.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Sarah,\n\nWe are hosting an intimate private dinner for tech founders and advisors next Thursday at Quince in San Francisco at 7:00 PM. Please confirm if you will be joining us so we can finalize the private dining room count.\n\nHarrison",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 70),
            isInbound: true,
          }
        ],
        aiResponsibility: "CLIENT_TO_REPLY",
        currentResponsibility: "CLIENT_TO_REPLY",
        aiCategory: "IMPORTANT",
        summary: "Private advisory board dinner invitation at Quince in SF next Thursday at 7:00 PM.",
        reason: "Personal executive attendance decision and private dining reservation.",
        suggestedAction: "Confirm attendance or ask PA to decline.",
        confidence: 0.93,
        actionRequired: true,
        isImportant: true,
        isUnread: true,
        extractedDates: [{ title: "Quince Dinner", date: new Date(Date.now() + 1000 * 60 * 60 * 120), rawText: "Next Thursday at 7:00 PM" }],
        keyPoints: ["Private dinner at Quince SF", "Next Thursday 7 PM", "RSVP needed for headcount"],
        suggestedReply: "Hi Harrison, I would be delighted to attend. Count me in for Thursday at 7:00 PM. Thanks for hosting!",
      },
      {
        subject: "Feedback Request on Product Design Sprint Proposals",
        participants: [
          { name: "Maya Patel", email: "maya.design@acmecorp.io", role: "Design Director" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Maya Patel",
            senderEmail: "maya.design@acmecorp.io",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Hey Sarah,\n\nWe uploaded 2 Figma prototypes for the new executive onboarding experience. Could your assistant help schedule 30 mins for us to walk through them, or leave comments directly in Figma?\n\nThanks,\nMaya",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 80),
            isInbound: true,
          }
        ],
        aiResponsibility: "ASSISTANT_TO_REPLY",
        currentResponsibility: "ASSISTANT_TO_REPLY",
        aiCategory: "ACTION_REQUIRED",
        summary: "Maya Patel wants to coordinate a 30-min design walkthrough or collect Figma comments.",
        reason: "Assistant can coordinate a 30-min review slot in Sarah's schedule.",
        suggestedAction: "Schedule a 30-minute design review slot for Wednesday morning.",
        confidence: 0.91,
        actionRequired: true,
        isImportant: false,
        isUnread: false,
        keyPoints: ["2 onboarding Figma prototypes", "30-min review slot needed"],
        suggestedReply: "Hi Maya, Aditya here. I will look over Sarah's calendar and book a 30-minute slot for us to walk through the prototypes on Wednesday morning. Thanks!",
      },
      {
        subject: "Airport Car Service Confirmation: JFK to Midtown Manhattan",
        participants: [
          { name: "Empire Chauffeurs", email: "dispatch@empirechauffeurs.com", role: "Transport" },
          { name: "Sarah Jenkins", email: "sarah.jenkins@acmecorp.io", role: "CEO" },
        ],
        messages: [
          {
            senderName: "Empire Chauffeurs",
            senderEmail: "dispatch@empirechauffeurs.com",
            recipientName: "Sarah Jenkins",
            recipientEmail: "sarah.jenkins@acmecorp.io",
            bodyText: "Your private sedan reservation for Monday 5:30 PM pickup at JFK Terminal 4 is confirmed. Driver details: Marcus (Cadillac Escalade #NY-8910).",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 90),
            isInbound: true,
          }
        ],
        aiResponsibility: "NO_REPLY_NEEDED",
        currentResponsibility: "NO_REPLY_NEEDED",
        aiCategory: "GENERAL",
        summary: "Airport transfer confirmation from JFK Terminal 4 to Midtown Manhattan.",
        reason: "Confirmation receipt for booked ground transportation.",
        suggestedAction: "Verify driver details match flight arrival time.",
        confidence: 0.98,
        actionRequired: false,
        isImportant: false,
        isUnread: false,
        status: "completed",
        keyPoints: ["JFK pickup Monday 5:30 PM", "Driver Marcus (Cadillac Escalade)"],
        suggestedReply: "",
      }
    ];

    for (const item of rawConversations) {
      const conv = await Conversation.create({
        ...item,
        teamId: team._id,
        clientId: clientUser._id,
        emailAccountId: emailAccount._id,
        status: item.status || 'pending',
      });

      await ClassificationHistory.create({
        conversationId: conv._id,
        previousResponsibility: null,
        newResponsibility: conv.currentResponsibility,
        changedBy: assistantUser._id,
        changeSource: 'AI_CLASSIFICATION',
        reason: conv.reason,
      });
    }

    console.log(`[Seed] Seeded ${rawConversations.length} realistic conversations with AI classification.`);
    console.log('[Seed] Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedData();
