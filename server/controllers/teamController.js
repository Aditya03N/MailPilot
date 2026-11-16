import Team from "../models/Team.js";
import User from "../models/User.js";
import { generateTeamCode } from "../utils/token.js";

// @desc    Create new workspace
// @route   POST /api/teams/create
// @access  Private (Assistant)
export const createTeam = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a workspace name." });
    }

    const teamCode = generateTeamCode(name);
    const team = await Team.create({
      name,
      teamCode,
      createdBy: req.user._id,
    });

    // Update user
    req.user.teamId = team._id;
    req.user.membershipStatus = "active";
    await req.user.save();

    res.status(201).json({
      success: true,
      team: {
        id: team._id,
        name: team.name,
        teamCode: team.teamCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Join existing team via code
// @route   POST /api/teams/join
// @access  Private
export const joinTeam = async (req, res, next) => {
  try {
    const { teamCode, requestedRole } = req.body;
    if (!teamCode) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a team code." });
    }

    const team = await Team.findOne({
      teamCode: teamCode.trim().toUpperCase(),
    });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Workspace with this code was not found.",
      });
    }

    const role = requestedRole === "client" ? "client" : "assistant";
    const membershipStatus = role === "assistant" ? "pending" : "active";

    req.user.teamId = team._id;
    req.user.role = role;
    req.user.membershipStatus = membershipStatus;
    await req.user.save();

    res.json({
      success: true,
      message:
        role === "assistant"
          ? "Membership request submitted. Pending workspace owner approval."
          : "Successfully joined workspace as client.",
      team: {
        id: team._id,
        name: team.name,
        teamCode: team.teamCode,
      },
      membershipStatus,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current team info
// @route   GET /api/teams/current
// @access  Private
export const getCurrentTeam = async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(404).json({
        success: false,
        message: "No workspace attached to this user.",
      });
    }

    const team = await Team.findById(req.user.teamId).populate(
      "createdBy",
      "name email",
    );
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Workspace not found." });
    }

    res.json({
      success: true,
      team: {
        id: team._id,
        name: team.name,
        teamCode: team.teamCode,
        createdBy: team.createdBy,
        createdAt: team.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get team members
// @route   GET /api/teams/members
// @access  Private
export const getTeamMembers = async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res
        .status(404)
        .json({ success: false, message: "No workspace attached." });
    }

    const members = await User.find({ teamId: req.user.teamId }).select(
      "-password",
    );
    res.json({ success: true, members });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject a member
// @route   POST /api/teams/approve-member
// @access  Private (Assistant owner)
export const approveMember = async (req, res, next) => {
  try {
    const { userId, status } = req.body; // 'active' or 'rejected'

    if (!["active", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be active or rejected.",
      });
    }

    const member = await User.findOne({ _id: userId, teamId: req.user.teamId });
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in your workspace.",
      });
    }

    member.membershipStatus = status;
    await member.save();

    res.json({
      success: true,
      message: `Member status updated to ${status}.`,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        membershipStatus: member.membershipStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};
