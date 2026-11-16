import Conversation from "../models/Conversation.js";
import EmailAccount from "../models/EmailAccount.js";
import User from "../models/User.js";
import Team from "../models/Team.js";

// @desc    Assistant Dashboard Statistics & Insights
// @route   GET /api/dashboard/assistant
// @access  Private (Assistant)
export const getAssistantDashboard = async (req, res, next) => {
  try {
    const teamId = req.user.teamId;

    const totalEmails = await Conversation.countDocuments({
      teamId,
      isArchived: false,
    });
    const unreadEmails = await Conversation.countDocuments({
      teamId,
      isUnread: true,
      isArchived: false,
    });
    const assistantToReply = await Conversation.countDocuments({
      teamId,
      currentResponsibility: "ASSISTANT_TO_REPLY",
      isArchived: false,
    });
    const clientToReply = await Conversation.countDocuments({
      teamId,
      currentResponsibility: "CLIENT_TO_REPLY",
      isArchived: false,
    });
    const waitingForResponse = await Conversation.countDocuments({
      teamId,
      status: "waiting_response",
      isArchived: false,
    });
    const noReplyNeeded = await Conversation.countDocuments({
      teamId,
      currentResponsibility: "NO_REPLY_NEEDED",
      isArchived: false,
    });

    // Priority conversations needing attention
    const priorityConversations = await Conversation.find({
      teamId,
      isArchived: false,
      $or: [
        { currentResponsibility: "ASSISTANT_TO_REPLY" },
        { currentResponsibility: "CLIENT_TO_REPLY" },
        { isImportant: true },
      ],
    })
      .sort({ isImportant: -1, lastMessageAt: -1 })
      .limit(6)
      .populate("clientId", "name email");

    // Recent conversations
    const recentConversations = await Conversation.find({
      teamId,
      isArchived: false,
    })
      .sort({ lastMessageAt: -1 })
      .limit(5)
      .populate("clientId", "name email");

    // Upcoming meetings extracted from emails
    const meetingConversations = await Conversation.find({
      teamId,
      isArchived: false,
      $or: [
        { aiCategory: "MEETINGS" },
        { "extractedDates.0": { $exists: true } },
      ],
    })
      .sort({ lastMessageAt: -1 })
      .limit(4)
      .populate("clientId", "name");

    // Connected Clients in this team/workspace
    const clients = await User.find({
      teamId,
      role: "client",
    }).select("name email avatar createdAt membershipStatus");

    // Dynamic AI insights calculated from database
    const insights = [];
    if (clientToReply > 0) {
      insights.push({
        type: "client_escalation",
        text: `${clientToReply} conversation${clientToReply > 1 ? "s require" : " requires"} client attention or approval.`,
        actionUrl: "/assistant/inbox?segment=client-to-reply",
      });
    }
    if (assistantToReply > 0) {
      insights.push({
        type: "pa_action",
        text: `You have ${assistantToReply} pending email${assistantToReply > 1 ? "s" : ""} to reply to on behalf of clients.`,
        actionUrl: "/assistant/inbox?segment=assistant-to-reply",
      });
    }
    if (meetingConversations.length > 0) {
      insights.push({
        type: "meetings",
        text: `${meetingConversations.length} meeting request${meetingConversations.length > 1 ? "s or dates extracted" : " or date extracted"} need scheduling coordination.`,
        actionUrl: "/assistant/inbox?segment=meetings",
      });
    }

    res.json({
      success: true,
      stats: {
        totalEmails,
        unreadEmails,
        assistantToReply,
        clientToReply,
        waitingForResponse,
        noReplyNeeded,
      },
      clients,
      priorityConversations,
      recentConversations,
      upcomingMeetings: meetingConversations,
      insights,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Client Dashboard Overview
// @route   GET /api/dashboard/client
// @access  Private (Client)
export const getClientDashboard = async (req, res, next) => {
  try {
    const teamId = req.user.teamId;
    let clientId = req.user._id;

    if (req.user.role === "assistant") {
      const defaultClient = await User.findOne({ teamId, role: "client" });
      if (defaultClient) {
        clientId = defaultClient._id;
      }
    }

    const pendingAttentionCount = await Conversation.countDocuments({
      teamId,
      clientId,
      currentResponsibility: "CLIENT_TO_REPLY",
      status: { $ne: "handled" },
      isArchived: false,
    });

    const importantCount = await Conversation.countDocuments({
      teamId,
      clientId,
      isImportant: true,
      isArchived: false,
    });

    const handledCount = await Conversation.countDocuments({
      teamId,
      clientId,
      status: "handled",
    });

    const attentionConversations = await Conversation.find({
      teamId,
      clientId,
      currentResponsibility: "CLIENT_TO_REPLY",
      status: { $ne: "handled" },
      isArchived: false,
    }).sort({ isImportant: -1, lastMessageAt: -1 });

    // Find assigned PA and Team Workspace
    const assistant = await User.findOne({ teamId, role: "assistant" }).select(
      "name email title avatar",
    );
    const team = await Team.findById(teamId).select("name teamCode createdAt");

    res.json({
      success: true,
      assistant: assistant || {
        name: "Your Personal Assistant",
        email: "assistant@mailpilot.com",
      },
      team: team || {
        name: "Executive Workspace",
        teamCode: "CONNECTED",
      },
      stats: {
        pendingAttentionCount,
        importantCount,
        handledCount,
      },
      attentionConversations,
    });
  } catch (err) {
    next(err);
  }
};
